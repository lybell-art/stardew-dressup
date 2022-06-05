import { useState, useRef, useEffect } from "react";
import { reaction } from "mobx";
import * as PIXI from "pixi.js";
import { clamp, lerp, easeOut } from "../utils/utils.js";
import { tintedContainer, prismaticContainer } from "../utils/coloredContainers.js";

// constant
const ITEM_GAP = 80;
const DRAG_THRESHOLD = 30;
const SWIPE_THRESHOLD = 6;
const EPSILON = 1.5;
const AXIS_X = Symbol.for('x');
const AXIS_Y = Symbol.for('y');

const garvageCollectedFuckingReact = [];

function grid(i)
{
	return (i+0.5) * ITEM_GAP;
}

class GridedSprite extends PIXI.Sprite
{
	constructor(index, texture)
	{
		super(texture);
		this.innerIndex = index;
		this.x = grid(index);
		this.y = 0;
	}
}


function makeSheetMap(sheet, additionalSheet={})
{
	const additionalTexture = {};
	for(let [key, value] of Object.entries(additionalSheet))
	{
		additionalTexture[key] = new PIXI.BaseTexture(value);
	}

	return {default:new PIXI.BaseTexture(sheet), ...additionalTexture};
}

function generateItem(i, sheets, parent, sheetPos, size={width:20, height:20})
{
	if(sheetPos === null) return;

	const {x, y, sheet="default"} = sheetPos;
	const {width, height} = size;
	if(sheets === undefined || sheets[sheet] === undefined) return;

	const rect = new PIXI.Rectangle(x, y, width, height);
	const clothTexture = new PIXI.Texture(sheets[sheet], rect);
	const cloth = new GridedSprite(i, clothTexture);

	cloth.anchor.set(0.5);
	cloth.scale.set(3);

	parent.addChild(cloth);
}

function arrangeItems(container, itemAmount, axis=AXIS_X, fixedLines=1)
{
	const columns = axis === AXIS_Y ? fixedLines : Math.ceil(itemAmount / fixedLines);

	for(let child of container.children)
	{
		const index = child.innerIndex;
		const x = index % columns;
		const y = Math.floor(index / columns);
		child.x = grid(x);
		child.y = axis === AXIS_Y ? grid(y) : 0;
	}
}

class RadioButtons
{
	static deselectedTexture = new PIXI.Texture(PIXI.Texture.EMPTY, new PIXI.Rectangle(0,0,72,72));
	static selectedTexture = PIXI.Texture.from("assets/selectedBorder.png");

	constructor(selectBox)
	{
		this.initialValue = 0;

		this.selectBox = selectBox;
		this.previousCheck = 0;
		this.container = new PIXI.Container();
		this.parent = null;
		this.buttons = [];

		this.check = this.check.bind(this);
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
	generateButton(i, x)
	{
		const button = new GridedSprite(x);
		if(i === this.initialValue) button.texture = this.constructor.selectedTexture;
		else button.texture = this.constructor.deselectedTexture;

		button.interactive = true;
		button.buttonMode = true;
		button.anchor.set(0.5);
		button.on('pointertap', this.check(i));

		this.buttons[i] = button;
		this.container.addChild(button);
	}
	flush()
	{
		this.container.removeChildren();
		this.buttons = [];
	}
	check(i)
	{
		return (e)=>{
			// prevent selection while dragging
			if( this.parent?.isDragged ) return;

			if(this.buttons[this.previousCheck] || this.previousCheck !== i) {
				this.buttons[this.previousCheck].texture = this.constructor.deselectedTexture;
			}
			this.selectBox.changeSelect(i);
			this.buttons[i].texture = this.constructor.selectedTexture;
			this.previousCheck = i;
		}
	}
	setInitialValue(i)
	{
		this.initialValue = i;
		this.previousCheck = i;
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
		this.gap = ITEM_GAP;
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
		return this.lineCount - this.screenItemNumber;
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
	slide(to, transitionTime=ScrollSnappedContainer.transitionTime)
	{
		this.scroll_index = clamp(this.scroll_index + to, 0, this.rightBoundary);

		this.scroll_time = clamp(transitionTime, 1, Infinity);
		this.scroll_prevPos = this.scroll_pos;
		this.scroll_nextPos = -this.gap*this.scroll_index;
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

			if(Math.abs(this.velocity) <= EPSILON || this.scroll_pos > ITEM_GAP || this.scroll_pos < -(this.rightBoundary+1) * ITEM_GAP)
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
		return clamp( Math.round(-this.scroll_pos / ITEM_GAP), 0, this.rightBoundary);
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

class ItemListController
{
	constructor({ selectBox, defaultImage, additionalDefaultImage={} })
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

		// cache default image link
		this.defaultImage = defaultImage;
		this.additionalDefaultImage = additionalDefaultImage;

		// expanding toggler
		this.expanded = false;

		// mobx reaction
		this.disposer = ()=>{};

		// event dispatcher
		this.resize = this.resize.bind(this);
		this.ticker = this.ticker.bind(this);
		this.slideLeft = this.slideLeft.bind(this);
		this.slideRight = this.slideRight.bind(this);
		this.toggleExpantion = this.toggleExpantion.bind(this);

		console.log("miko is baby!");
	}
	setContainer(selectBox)
	{
		// make main container
		this.container = new ScrollSnappedContainer(this.app.screen);
		this.container.pivot.set(0.5);
		this.app.stage.addChild(this.container);

		// make container for the icon
		this.radioButton = new RadioButtons(selectBox);
		this.uncolored = new PIXI.Container();
		this.colored = new tintedContainer(selectBox);
		this.prismatic = new prismaticContainer();

		// attach to container
		this.radioButton.attachToParent(this.container);
		this.container.addChild(this.uncolored, this.colored, this.prismatic);
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

	initialize(spritesheetData)
	{
		this.app.start();

		// add the mobx reaction for spritesheet data(image change or data change)
		this.disposer = reaction(()=>({
			sheet: spritesheetData._spritesheet?.blobURL ?? this.defaultImage, 
			clothesData: spritesheetData._clothesData, 
			additionalSheet: spritesheetData._additionalSheet ?? this.additionalDefaultImage 
		}),
		({sheet, additionalSheet})=>this.initializeSprites(spritesheetData, sheet, additionalSheet) );

		// add resize event listener
		window.addEventListener("resize", this.resize);

		// add ticker
		this.app.ticker.add(this.ticker);
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
		const makeItemArray = [
			{parent:this.uncolored,		positioner:spritesheetData.getUncoloredSpriteFromIndex},
			{parent:this.colored,		positioner:spritesheetData.getColoredSpriteFromIndex},
			{parent:this.prismatic,		positioner:spritesheetData.getPrismaticSpriteFromIndex},
		].map( ({parent, positioner})=>( (i)=>generateItem(i + shift, sheets, parent, positioner(i), size) ) );

		// make icons and attach to parent
		for(let i = -shift; i<spritesheetData.count; i++)
		{
			this.radioButton.generateButton(i, i + shift);
			makeItemArray.forEach((makeItem)=>makeItem(i));
		}

		// reset container's item amount & hit area
		this.container.itemAmount = spritesheetData.count + shift;
		this.container.lineCount = this.container.itemAmount;
		this.container.resetHitArea();
	}
	ticker(dt)
	{
		const FPS = 60;
		this.colored.autoTint();
		this.prismatic.progress(dt*FPS);

		this.container.progress(dt*FPS);
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
	toggleExpantion(state)
	{
		this.app.resize();
		// toggle expanded property
		this.expanded = state ?? !this.expanded;
		
		// calculate axis, itemAmout, lines
		const axis = this.expanded ? AXIS_Y : AXIS_X;
		const itemAmount = this.container.itemAmount;
		const lines = this.expanded ? (this.container.container.width / ITEM_GAP) : 1;

		const arranger = (container)=>arrangeItems(container, itemAmount, axis, lines);

		// set container's scroll axis
		this.container.scroll_axis = axis;

		// arrange items
		arranger(this.radioButton.container);
		arranger(this.uncolored);
		arranger(this.colored);
		arranger(this.prismatic);

		// fix container's position
		if(this.expanded) {
			this.container.x = 0;
			this.container.y = 0;
		}
		else this.container.y = this.app.screen.height / 2;

		this.container.scroll_index = 0;
		this.container.lineCount = Math.ceil(itemAmount / lines);
		this.container.resetHitArea();

		const currentLine = Math.floor(this.radioButton.current / lines) - 2;
		this.container.slide(currentLine, 1);
	}
	
	flushChildren()
	{
		this.radioButton.flush();
		this.uncolored.removeChildren();
		this.colored.removeChildren();
		this.prismatic.removeChildren();
	}
	halt()
	{
		this.app.stop();
		this.disposer();
		window.removeEventListener("resize", this.resize);
		this.app.ticker.remove(this.ticker);
	}
	resize()
	{
		this.container.y = this.app.screen.height / 2;
	}
}


export default ItemListController;