import { reaction } from "mobx";
import * as PIXI from "pixi.js";
import { MultiColorReplaceFilter } from "@pixi/filter-multi-color-replace";

import { clamp, lerp, easeOut, isMobileView } from "../utils/utils.js";
import { ThresholdObserver } from "../utils/ThresholdObserver.js";
import { tintedContainer, prismaticContainer } from "../utils/coloredContainers.js";
import { convertTextureMap } from "../utils/convertTexture.js";
import { replaceColorsFromBuffer } from "../utils/replaceColorsFromBuffer.js";

import EventHub from "../events/eventHub.js";

// constant
const ITEM_GAP = 80;
const DRAG_THRESHOLD = 30;
const SWIPE_THRESHOLD = 6;
const EPSILON = 1.5;
const AXIS_X = Symbol.for('x');
const AXIS_Y = Symbol.for('y');
const MOBILE_MAX_SCREEN_WIDTH = 768;

function getScaleMultifier(screenWidth)
{
	return isMobileView(screenWidth) ? 4/5 : 1;
}

function grid(i, multiplier=1)
{
	return (i+0.5) * ITEM_GAP * multiplier;
}

class GridedSprite extends PIXI.Sprite
{
	constructor(index, texture)
	{
		super(texture);
		this.innerIndex = index;
	}
	setPosition(multiplier=1)
	{
		this.x = grid(this.innerIndex, multiplier);
		this.y = 0;
	}
	arrangePosition(columns, axis=AXIS_X, multiplier = 1)
	{
		const index = this.innerIndex;
		const x = index % columns;
		const y = Math.floor(index / columns);
		this.x = grid(x, multiplier);
		this.y = axis === AXIS_Y ? grid(y, multiplier) : 0;
	}
}


function makeSheetMap(sheet, additionalSheet={})
{
	const additionalTexture = convertTextureMap(additionalSheet);
	return {default:new PIXI.BaseTexture(sheet), ...additionalTexture};
}

function generateItem(i, sheets, sheetPos, size={width:20, height:20}, multiplier=1)
{
	if(sheetPos === null) return;

	const {x, y, sheet="default"} = sheetPos;
	const {width, height} = size;
	if(sheets === undefined || sheets[sheet] === undefined) return;

	const rect = new PIXI.Rectangle(x, y, width, height);
	const clothTexture = new PIXI.Texture(sheets[sheet], rect);
	const cloth = new GridedSprite(i, clothTexture);

	cloth.setPosition(multiplier);
	cloth.anchor.set(0.5);
	cloth.scale.set(Math.floor(3 * multiplier));

	return cloth;
}

function arrangeItems(container, columns, axis=AXIS_X, multiplier=1)
{
	for(let child of container.children)
	{
		child.arrangePosition(columns, axis, multiplier);
	}
}

function adjustScale(container, scale)
{
	for(let child of container.children)
	{
		child.scale.set(scale);
	}
}

class RadioButtons
{
	static deselectedTexture = new PIXI.Texture(PIXI.Texture.EMPTY, new PIXI.Rectangle(0,0,72,72));
	static selectedTexture = PIXI.Texture.from("assets/selectedBorder.png");

	constructor(selectBox)
	{
		this.previousCheck = 0;

		this.selectBox = selectBox;
		this.container = new PIXI.Container();
		this.parent = null;
		this.buttons = [];

		this.check = this.check.bind(this);

		EventHub.addEventListener("changeCloth", this.syncronize.bind(this));
	}
	get current()
	{
		return this.selectBox.value;
	}
	attachToParent(parent)
	{
		parent.addChild(this.container);
		this.parent = parent;
	}
	generateButton(i, x, multiplier=1)
	{
		const button = new GridedSprite(x);
		if(i === this.previousCheck) button.texture = this.constructor.selectedTexture;
		else button.texture = this.constructor.deselectedTexture;

		button.interactive = true;
		button.buttonMode = true;
		button.anchor.set(0.5);
		button.setPosition(multiplier);
		button.scale.set(multiplier);
		button.on('pointertap', this.check(i));

		this.buttons[i] = button;
		this.container.addChild(button);
	}
	flush()
	{
		this.container.removeChildren();
		this.buttons = [];
	}
	change(value)
	{
		if(this.buttons[this.previousCheck] && this.previousCheck !== value) {
			this.buttons[this.previousCheck].texture = this.constructor.deselectedTexture;
		}
		this.buttons[value].texture = this.constructor.selectedTexture;
		this.previousCheck = value;
	}
	check(i)
	{
		return (e)=>{
			// prevent selection while dragging
			if( this.parent?.isDragged ) return;

			this.selectBox.changeSelect(i, false);
			this.change(i);
		}
	}
	setInitialValue(i)
	{
		this.previousCheck = i;
	}
	syncronize({detail})
	{
		if(detail.sender !== this.selectBox) return;

		const value = detail.value;
		if(this.previousCheck === value) return;

		this.change(value);
		const omittable = this.buttons[-1] !== undefined ? -1 : 0;
		EventHub.dispatchEvent("syncronizeSlider", {sender:this, value: value - omittable});
	}
}

class ScrollSnappedContainer extends PIXI.Container
{
	static transitionTime = 800;
	constructor(container)
	{
		super();

		// properties for calculate the border
		this.itemAmount = 0;
		this.lineCount = 0;
		this.container = container;

		// properties for scroll
		this.scroll_index = 0;
		this.scroll_time = 0;
		this.scroll_prevPos = 0;
		this.scroll_nextPos = 0;
		this.scroll_axis = AXIS_X;

		// properties for drag
		this.holding = false;
		this.dragThreshold = 0;
		this.dragPrevPos = 0;
		this.velocity = 0;

		this.interactive = true;

		// add event listeners
		this.on('pointerdown', (e)=>this.onDragStart(this.mousePos(e)) )
			.on('pointermove', (e)=>this.onDragMove(this.mousePos(e)) )
			.on('pointerup', ()=>this.onDragEnd() )
			.on('pointerupoutside', ()=>this.onDragEnd() );
	}
	get gap()
	{
		return ITEM_GAP * getScaleMultifier(document.body.clientWidth);
	}
	get containerSize()
	{
		let target = (!this.container) ? this : this.container;
		return this.scroll_axis === AXIS_Y ? target.height : target.width;
	}
	// number of items visible on the screen
	get screenItemNumber()
	{
		return clamp(Math.floor(this.containerSize / this.gap), 1, Infinity);
	}
	// When the mouse is dragged over a certain distance, it is treated as a drag and prevents the item selection action.
	get isDragged()
	{
		return this.dragThreshold > DRAG_THRESHOLD;
	}
	get rightBoundary()
	{
		return Math.max(this.lineCount - this.screenItemNumber, 0);
	}
	// main scroll position
	get scroll_pos()
	{
		return this.scroll_axis === AXIS_Y ? this.y : this.x;
	}
	set scroll_pos(value)
	{
		if(this.scroll_axis === AXIS_Y) this.y = value;
		else this.x = value;
	}
	// Invoke sliding with the specified offset index
	slideTo(to, transitionTime=ScrollSnappedContainer.transitionTime)
	{
		this.scroll_index = clamp(to, 0, this.rightBoundary);

		this.scroll_time = clamp(transitionTime, 1, Infinity);
		this.scroll_prevPos = this.scroll_pos;
		this.scroll_nextPos = -this.gap*this.scroll_index;
	}
	slide(offset, transitionTime=ScrollSnappedContainer.transitionTime)
	{
		this.slideTo(this.scroll_index + offset, transitionTime);
	}
	slideToCenter(index, transitionTime=ScrollSnappedContainer.transitionTime)
	{
		const to = index - Math.floor( (this.screenItemNumber-1)/2 );
		this.slideTo(to, transitionTime);
	}
	slideLeft()
	{
		this.slide(-this.screenItemNumber);
	}
	slideRight()
	{
		this.slide(this.screenItemNumber);
	}
	// ticker function
	progress(deltaMS)
	{
		// if this container is sliding
		if(this.scroll_time > 0)
		{
			this.scroll_time = clamp(this.scroll_time - deltaMS, 0, Infinity);

			const percent = 1 - (this.scroll_time / this.constructor.transitionTime);
			this.scroll_pos = lerp(this.scroll_prevPos, this.scroll_nextPos, easeOut(percent));
		}
		// if this container is swiped
		if(!this.holding && Math.abs(this.velocity) > EPSILON)
		{
			this.scroll_pos += this.velocity;
			this.scroll_index = this.getCurrentScrollIndex();
			this.velocity *= 0.98;

			if(Math.abs(this.velocity) <= EPSILON || this.scroll_pos > this.gap || this.scroll_pos < -(this.rightBoundary+1) * this.gap)
			{
				this.velocity = 0;
				this.slide(0);
			}
		}
	}

	// drag event handler function
	onDragStart(mousePos)
	{
		this.holding = true;
		this.dragPrevPos = mousePos;
		this.dragThreshold = 0;
		this.velocity = 0;
	}
	onDragMove(mousePos)
	{
		if(this.holding)
		{
			const delta = mousePos - this.dragPrevPos;

			this.scroll_pos += delta;
			this.dragThreshold += Math.abs(delta);
			this.velocity = delta;
			this.scroll_index = this.getCurrentScrollIndex();

			this.dragPrevPos = mousePos;
		}
	}
	onDragEnd(e)
	{
		const isDragged = this.dragThreshold > DRAG_THRESHOLD;
		const isSwiped = Math.abs(this.velocity) > SWIPE_THRESHOLD;

		this.holding = false;

		this.dragPrevPos = 0;
		this.dragThreshold = 0;
		if(!isSwiped)
		{
			this.velocity = 0;
			this.slide(0);
		}
	}

	getCurrentScrollIndex()
	{
		return clamp( Math.round(-this.scroll_pos / this.gap), 0, this.rightBoundary);
	}
	mousePos(e)
	{
		return this.scroll_axis === AXIS_Y ? e.data.global.y : e.data.global.x;
	}
	resetHitArea()
	{
		this.hitArea = new PIXI.Rectangle(0, (this.scroll_axis === AXIS_Y ? 0 : -this.height/2), this.width, this.height);
	}
}

class ItemListControllerBase
{
	constructor(selectBox)
	{
		// set application
		this.app = new PIXI.Application({
			resolution: 1,
			antialias: true,
			backgroundColor: 0xffffff,
			autoResize:true
		});

		// make controllers
		this.setContainer(selectBox);

		// optimize pixi.js setting to pixel environment
		PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
		PIXI.settings.ROUND_PIXELS = true;

		// expanding toggler
		this.expanded = false;

		// mobile adjustment
		this.screenSizeObserver = new ThresholdObserver([336, 400, 464, 528, MOBILE_MAX_SCREEN_WIDTH], document.body.clientWidth, 20);

		// mobx reaction
		this.disposer = ()=>{};

		// event dispatcher
		this.resize = this.resize.bind(this);
		this.ticker = this.ticker.bind(this);
		this.slideLeft = this.slideLeft.bind(this);
		this.slideRight = this.slideRight.bind(this);
		this.onWheel = this.onWheel.bind(this);
		this.toggleExpantion = this.toggleExpantion.bind(this);

		EventHub.addEventListener("syncronizeSlider", this.syncronize.bind(this));
	}
	get lines()
	{
		return this.expanded ? (this.container.container.width / (ITEM_GAP * this.multiplier) ) : 1;
	}
	get multiplier()
	{
		return getScaleMultifier(document.body.clientWidth);
	}
	setContainer(selectBox)
	{
		// make main container
		this.container = new ScrollSnappedContainer(this.app.screen);
		this.app.stage.addChild(this.container);

		// make container for the icon
		this.radioButton = new RadioButtons(selectBox);

		// attach to container
		this.radioButton.attachToParent(this.container);
	}

	// attach to dom
	appendParent(dom)
	{
		dom.appendChild(this.app.view);

		this.app.resizeTo = dom;
		this.app.screen.height = dom.clientHeight;
		this.app.view.height = dom.clientHeight;
		this.container.y = this.app.screen.height / 2;
	}
	initializeRadio(i)
	{
		this.radioButton.setInitialValue(i);
	}

	setDisposer(args)
	{
	}
	initialize(args)
	{
		this.app.start();

		this.setDisposer(args);

		// add resize event listener
		window.addEventListener("resize", this.resize);

		// add ticker
		this.app.ticker.add(this.ticker);
	}
	
	initializeSprites()
	{
	}
	ticker(dt)
	{
		const FPS = 60;
		this.container.progress(dt*FPS);
	}
	syncronize({detail})
	{
		if(detail.sender !== this.radioButton) return;
		this.container.slideToCenter( Math.floor(detail.value / this.lines) );
	}
	slideLeft()
	{
		if(this.expanded) return;
		this.container.slideLeft();
	}
	slideRight()
	{
		if(this.expanded) return;
		this.container.slideRight();
	}
	onWheel(delta)
	{
		this.container.slide(delta);
	}
	arrangeIcons(arranger)
	{
	}
	arrangeContainerItems(multiplier)
	{
		// calculate axis, itemAmout, lines
		const axis = this.expanded ? AXIS_Y : AXIS_X;
		const itemAmount = this.container.itemAmount;
		const lines = this.expanded ? (this.container.container.width / (ITEM_GAP * multiplier) ) : 1;
		const columns = axis === AXIS_Y ? lines : Math.ceil(itemAmount / lines);

		const arranger = (container)=>arrangeItems(container, columns, axis, multiplier);

		// arrange items
		arranger(this.radioButton.container);
		this.arrangeIcons(arranger);
	}
	toggleExpantion(state)
	{
		this.app.resize();
		// toggle expanded property
		this.expanded = state ?? !this.expanded;
		
		// arrange items
		this.arrangeContainerItems( this.multiplier );

		// set container's scroll axis
		this.container.scroll_axis = this.expanded ? AXIS_Y : AXIS_X;

		// fix container's position
		if(this.expanded) {
			this.container.x = 0;
			this.container.y = 0;
		}
		else this.container.y = this.app.screen.height / 2;

		this.container.scroll_index = 0;
		this.container.lineCount = Math.ceil(this.container.itemAmount / this.lines);
		this.container.resetHitArea();

		const currentLine = Math.floor(this.radioButton.current / this.lines) - 2;
		this.container.slide(currentLine, 1);
	}
	scaleIcons(pixelIconScale)
	{
	}
	adjustItemSize(multiplier)
	{
		const radioButtonScale = 1 * multiplier;
		const pixelIconScale = clamp(Math.floor(3 * multiplier), 1, Infinity);

		// adjust scale
		adjustScale(this.radioButton.container, radioButtonScale);
		this.scaleIcons(pixelIconScale);

		this.arrangeContainerItems(multiplier);
		this.container.resetHitArea();
		this.container.slideTo(this.radioButton.current);
	}
	
	flushChildren()
	{
		this.radioButton.flush();
	}
	halt()
	{
		this.app.stop();
		this.disposer();
		window.removeEventListener("resize", this.resize);
		this.app.ticker.remove(this.ticker);
	}
	startTick()
	{
		this.app.start();
	}
	stopTick()
	{
		this.app.stop();
	}
	resize()
	{
		this.screenSizeObserver.update(document.body.clientWidth, ()=>{
			const multiplier = getScaleMultifier(document.body.clientWidth);
			this.adjustItemSize(multiplier);
		} );
	}
}

class ItemListController extends ItemListControllerBase
{
	constructor(selectBox, { defaultImage, additionalDefaultImage={} })
	{
		super(selectBox);

		// cache default image link
		this.defaultImage = defaultImage;
		this.additionalDefaultImage = additionalDefaultImage;

	}
	setContainer(selectBox)
	{
		// make main container, radioButton
		super.setContainer(selectBox);

		// make container for the icon
		this.uncolored = new PIXI.Container();
		this.colored = new tintedContainer(selectBox);
		this.prismatic = new prismaticContainer();

		// attach to container
		this.container.addChild(this.uncolored, this.colored, this.prismatic);

	}
	setDisposer(spritesheetData)
	{
		// add the mobx reaction for spritesheet data(image change or data change)
		this.disposer = reaction( 
			()=>({
				sheet: spritesheetData._spritesheet?.blobURL ?? this.defaultImage, 
				clothesData: spritesheetData._clothesData, 
				additionalSheet: {...spritesheetData._additionalSheet, ...this.additionalDefaultImage}
			}),
			({sheet, additionalSheet})=>this.initializeSprites(spritesheetData, sheet, additionalSheet)
		);
	}
	initializeSprites(spritesheetData, sheet, additionalSheet)
	{
		const size = spritesheetData.constructor.size;
		const omittable = spritesheetData.constructor.omittable;
		const shift = omittable ? 1 : 0;

		// remove all icons
		this.flushChildren();

		// make baseTexture map ( Dict<String, PIXI.BaseTexture> )
		const sheets = makeSheetMap(sheet, additionalSheet);

		// make icon generator
		const maker = [
			{parent:this.uncolored,		positioner:spritesheetData.getUncoloredSpriteFromIndex},
			{parent:this.colored,		positioner:spritesheetData.getColoredSpriteFromIndex},
			{parent:this.prismatic,		positioner:spritesheetData.getPrismaticSpriteFromIndex}
		].map( ({parent, positioner})=>(i=>{
			const child=generateItem(i + shift, sheets, positioner(i), size, this.multiplier);
			if(child) parent.addChild(child);
		}) );

		// make icons and attach to parent
		for(let i = -shift; i<spritesheetData.count; i++)
		{
			this.radioButton.generateButton(i, i + shift, this.multiplier);
			maker.forEach((makeItem)=>makeItem(i));
		}

		// reset container's item amount & hit area
		this.container.itemAmount = spritesheetData.count + shift;
		this.toggleExpantion(this.expanded);
//		this.container.lineCount = this.container.itemAmount;
//		this.container.resetHitArea();
	}
	flushChildren()
	{
		super.flushChildren();
		this.uncolored.removeChildren();
		this.colored.removeChildren();
		this.prismatic.removeChildren();
	}
	arrangeIcons(arranger)
	{
		arranger(this.uncolored);
		arranger(this.colored);
		arranger(this.prismatic);
	}
	scaleIcons(pixelIconScale)
	{
		adjustScale(this.uncolored, pixelIconScale);
		adjustScale(this.colored, pixelIconScale);
		adjustScale(this.prismatic, pixelIconScale);
	}
	ticker(dt)
	{
		super.ticker(dt);
		const FPS = 60;
		this.colored.autoTint();
		this.prismatic.progress(dt*FPS);
	}
}


class SkinColorController extends ItemListControllerBase
{
	constructor(selectBox)
	{
		super(selectBox);

		this.basePixels = null;
	}
	loadPixelData(callback)
	{
		const loader = new PIXI.Loader();
		loader.add("body_icon", "assets/body_icon.png");
		loader.load((loader,resource)=>{
			const sprite = PIXI.Sprite.from(resource.body_icon.texture);
			this.basePixels = this.app.renderer.plugins.extract.pixels(sprite);
			callback();
		});
	}
	makeTexture({light=0xf9ae89, mid=0xe06b65, dark=0x6b003a}={})
	{
		// replace pixel
		const replaceMap = [ [0xf9ae89, light], [0xe06b65, mid], [0x6b003a, dark] ];
		const newPixel = replaceColorsFromBuffer(this.basePixels, replaceMap);

		// make buffer resource
		return PIXI.Texture.fromBuffer(newPixel, 16, 16);
	}
	setContainer(selectBox)
	{
		// make main container, radioButton
		super.setContainer(selectBox);

		// make container for the icon
		this.icons = new PIXI.Container();

		// attach to container
		this.container.addChild(this.icons);
	}
	setDisposer(spritesheetData)
	{
		// add the mobx reaction for spritesheet data(image change or data change)
		this.disposer = reaction( 
			()=>spritesheetData.skinColor,
			skinColors=>this.initializeSprites(skinColors)
		);
	}
	_initializeSprites(skinColors)
	{
		// remove all icons
		this.flushChildren();

		// make icon generator
		const maker = (i)=>{
			const texture = this.makeTexture(skinColors[i]);
			const child = new GridedSprite(i, texture);
			child.setPosition(this.multiplier);
			child.anchor.set(0.5);
			child.scale.set(Math.floor(3 * this.multiplier));
			if(child) this.icons.addChild(child);
		}

		// make icons and attach to parent
		for(let i = 0; i<skinColors.length; i++)
		{
			this.radioButton.generateButton(i, i, this.multiplier);
			maker(i);
		}

		// reset container's item amount & hit area
		this.container.itemAmount = skinColors.length;
		this.toggleExpantion(this.expanded);
	}
	initializeSprites(skinColors)
	{
		if(this.basePixels !== null) this._initializeSprites(skinColors);
		else this.loadPixelData(()=>this._initializeSprites(skinColors));
	}
	flushChildren()
	{
		super.flushChildren();
		this.icons.removeChildren();
	}
	arrangeIcons(arranger)
	{
		arranger(this.icons);
	}
	scaleIcons(pixelIconScale)
	{
		adjustScale(this.icons, pixelIconScale);
	}
}


export {ItemListController, SkinColorController};