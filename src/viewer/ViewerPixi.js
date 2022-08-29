import { reaction } from "mobx";
import * as PIXI from "pixi.js";
import { MultiColorReplaceFilter } from "@pixi/filter-multi-color-replace";
import { colorArrayToHex, getPrismaticColor } from "../utils/colors.js";
import { convertTextureMap } from "../utils/convertTexture.js";

// direction constant(using stardew valley code)
const FRONT = 2;
const BACK = 0;
const LEFT = 3;
const RIGHT = 1;

function makeDefaultTextures()
{
	const defaultTextureSrc = {
		body_male:"./assets/farmer_base.png",
		body_male_bald:"./assets/farmer_base_bald.png",
		body_female:"./assets/farmer_girl_base.png",
		body_female_bald:"./assets/farmer_girl_base_bald.png",
		hats:"./assets/hats.png",
		hairstyle:"./assets/hairstyle.png",
		hairstyle2:"./assets/hairstyles2.png",
		shirts:"./assets/shirts.png",
		pants:"./assets/pants.png"
	};

	const map=new Map();
	for(let [key, value] of Object.entries(defaultTextureSrc))
	{
		map.set(key, new PIXI.BaseTexture(value));
	}
	return map;
}

function replaceBaseTexture(texture, baseTexture)
{
	return new PIXI.Texture(baseTexture, texture.frame);
}

class ResponsiveSprite extends PIXI.Container
{
	constructor()
	{
		super();
		this.disposers = [];
	}
	makeReaction(observeData, react, fireImmediately=true)
	{
		let disposer = reaction(observeData, react, {fireImmediately});
		this.disposers.push( disposer );
	}
	dispose(n)
	{
		if(typeof n === "number" && n>=0 && n<this.disposers.length)
		{
			this.disposers[n]();
			this.disposers.splice(n, 1);
			return;
		}

		for(let i=0; i<this.disposers.length; i++)
		{
			this.disposers[i]();
		}
		this.disposers = [];
	}
	destroy(option)
	{
		super.destroy(option);
		this.dispose();
	}
}

class HatSprite extends ResponsiveSprite
{
	constructor(texture)
	{
		super();

		this.baseTexture = texture;

		this.sprite = new PIXI.Sprite();
		this.prismatic = false;
		this.addChild(this.sprite);

		this.subSprite = new PIXI.Sprite();
		this.subSprite.zIndex = 2.75;

		this.zIndex = 4;
	}
	initialize(farmer)
	{
		// change hats index or hairstyle index
		this.makeReaction( 
			()=>{
				return {
					boundBox : farmer.hatBoundBox,
					offsetY : farmer.hatYOffset,
					masked : farmer.hat.isMask && farmer.direction === BACK
				};
			}, 

			this.changeSprite.bind(this)
		);

		// change color
		this.makeReaction( 
			()=>farmer.hatTint, 

			this.changePrismatic.bind(this)
		);

		// change sprite sheet
		this.makeReaction( 
			()=>farmer.hatsSheet._spritesheet?.blobURL ?? "./assets/hats.png",

			this.changeSpriteSheet.bind(this), 
		false);
	}

	changeSprite( {boundBox, offsetY, masked} )
	{
		if(masked)
		{
			const {x, y, width} = boundBox;
			const upperTexture = new PIXI.Texture(this.baseTexture, new PIXI.Rectangle( x, y, width, 11 ) );
			const lowerTexture = new PIXI.Texture(this.baseTexture, new PIXI.Rectangle( x, y+11, width, 9 ));

			this.sprite.texture = lowerTexture;
			this.sprite.x = -2;
			this.sprite.y = offsetY + 11;

			this.subSprite.texture = upperTexture;
			this.subSprite.x = -2;
			this.subSprite.y = offsetY;
		}
		else
		{
			const texture = new PIXI.Texture(this.baseTexture, boundBox);

			this.sprite.texture = texture;
			this.sprite.x = -2;
			this.sprite.y = offsetY;

			this.subSprite.texture = PIXI.Texture.EMPTY;
		}
		
	}
	changePrismatic(tint)
	{
		this.prismatic = (tint === "prismatic");
		if(!this.prismatic) this.sprite.tint = 0xffffff;
	}
	changeSpriteSheet(assetURL)
	{
		this.baseTexture = new PIXI.BaseTexture(assetURL);
		this.sprite.texture = replaceBaseTexture(this.sprite.texture, this.baseTexture);
	}
	applyTint(tint)
	{
		this.sprite.tint = tint;
	}
}

class HairSprite extends ResponsiveSprite
{
	constructor(texture, additionalTexture)
	{
		super();

		this.baseTexture = texture;
		this.additionalTexture = additionalTexture;

		this.sprite = new PIXI.Sprite();
		this.currentSheet = "default";
		this.addChild(this.sprite);

		this.zIndex = 3;
	}
	initialize(farmer)
	{
		// change hairstyle index
		this.makeReaction( 
			()=>{
				return {
					boundBox : farmer.hairBoundBox,
					offsetY : farmer.hairstyleYOffset,
				};
			}, 

			this.changeSprite.bind(this)
		);

		// change color
		this.makeReaction( 
			()=>farmer.hairTint, 

			this.applyTint.bind(this)
		);

		// change sprite sheet
		this.makeReaction( 
			()=>{
				let additional = {...farmer.hairstyleSheet._additionalSheet, hairstyles2:"./assets/hairstyles2.png" };
				return {
					base:farmer.hairstyleSheet._spritesheet?.blobURL ?? "./assets/hairstyle.png",
					additional
				};
			},

//			this.changeSpriteSheet.bind(this),
			(observable)=>this.changeSpriteSheet(observable, farmer), 
		false);
	}

	changeSprite({boundBox, offsetY})
	{
		const {rect, sheet="default", flipped} = boundBox;
		const baseTexture = sheet === "default" ? this.baseTexture : this.additionalTexture[sheet];

		try {
			const texture = new PIXI.Texture(baseTexture, rect);
			this.sprite.texture = texture;
		}
		catch(e) {
			// When you load a sprite, the reaction runs first before you load the spritesheet, to prevent it
			if(!e.message.startsWith("Texture Error: frame does not fit inside the base Texture dimensions:")) throw e;
		}

		this.sprite.x = 0;
		this.sprite.y = offsetY;
		this.currentSheet = sheet;
		this.sprite.scale.x = flipped ? -1 : 1;
		if(flipped) this.sprite.x = this.sprite.width;

	}
	changeSpriteSheet({base, additional}, farmer)
	{
		this.baseTexture = new PIXI.BaseTexture(base);
		this.additionalTexture = convertTextureMap(additional);

		const myTexture = this.currentSheet === "default" ? this.baseTexture : this.additionalTexture[this.currentSheet];
		this.sprite.texture = replaceBaseTexture(this.sprite.texture, myTexture);
		const {hairBoundBox:boundBox, hairstyleYOffset:offsetY} = farmer;
		this.changeSprite({boundBox, offsetY});
	}
	applyTint(tint)
	{
		this.sprite.tint = tint;
	}
}

class ShirtSprite extends ResponsiveSprite
{
	constructor(texture)
	{
		super();

		this.baseTexture = texture;

		this.uncoloredSprite = new PIXI.Sprite();
		this.coloredSprite = new PIXI.Sprite();

		this.prismatic = false;
		this.addChild(this.uncoloredSprite, this.coloredSprite);

		this.zIndex = 2;
	}
	initialize(farmer)
	{
		// change shirt index
		this.makeReaction( 
			()=>{
				return {
					boundBox : farmer.shirtBoundBox,
					offsetY : farmer.shirtYOffset
				};
			}, 

			this.changeSprite.bind(this)
		);

		// change color
		this.makeReaction( 
			()=>farmer.shirtTint,

			this.changeColor.bind(this)
		);

		// change sprite sheet
		this.makeReaction( 
			()=>farmer.shirtsSheet._spritesheet?.blobURL ?? "./assets/shirts.png",

			this.changeSpriteSheet.bind(this), 
		false);
	}

	changeSprite({boundBox, offsetY})
	{
		const {uncolored, colored} = boundBox;
		const uncoloredTexture = new PIXI.Texture(this.baseTexture, uncolored);
		const coloredTexture = new PIXI.Texture(this.baseTexture, colored);

		this.uncoloredSprite.texture = uncoloredTexture;
		this.uncoloredSprite.x = 4;
		this.uncoloredSprite.y = offsetY;

		this.coloredSprite.texture = coloredTexture;
		this.coloredSprite.x = 4;
		this.coloredSprite.y = offsetY;
	}
	changeColor(tint)
	{
		this.prismatic = (tint === "prismatic");
		if(!this.prismatic) this.applyTint(tint);
	}
	changeSpriteSheet(assetURL)
	{
		this.baseTexture = new PIXI.BaseTexture(assetURL);
		this.uncoloredSprite.texture = replaceBaseTexture(this.uncoloredSprite.texture, this.baseTexture);
		this.coloredSprite.texture = replaceBaseTexture(this.coloredSprite.texture, this.baseTexture);
	}
	applyTint(tint)
	{
		this.coloredSprite.tint = tint;
	}
}

class PantsSprite extends ResponsiveSprite
{
	constructor(texture)
	{
		super();

		this.baseTexture = texture;

		this.sprite = new PIXI.Sprite();

		this.prismatic = false;
		this.addChild(this.sprite);

		this.zIndex = 1;
	}
	initialize(farmer)
	{
		// change pants index
		this.makeReaction( 
			()=>farmer.pantsBoundBox, 

			this.changeSprite.bind(this)
		);

		// change color
		this.makeReaction( 
			()=>farmer.pantsTint,

			this.changeColor.bind(this)
		);

		// change sprite sheet
		this.makeReaction( 
			()=>farmer.pantsSheet._spritesheet?.blobURL ?? "./assets/pants.png",

			this.changeSpriteSheet.bind(this), 
		false);
	}

	changeSprite(boundBox)
	{
		const {rect, flipped} = boundBox;
		const texture = new PIXI.Texture(this.baseTexture, rect);
		this.sprite.texture = texture;

		this.sprite.x = 0;
		this.sprite.scale.x = flipped ? -1 : 1;
		if(flipped) this.sprite.x = this.sprite.width;
	}
	changeColor(tint)
	{
		this.prismatic = (tint === "prismatic");
		if(!this.prismatic) this.applyTint(tint);
	}
	changeSpriteSheet(assetURL)
	{
		this.baseTexture = new PIXI.BaseTexture(assetURL);
		this.sprite.texture = replaceBaseTexture(this.sprite.texture, this.baseTexture);
	}
	applyTint(tint)
	{
		this.sprite.tint = tint;
	}
}

class BodySprite extends ResponsiveSprite
{
	constructor(textures)
	{
		super();

		this.baseTextures = textures;
		this.currentSheet = "body_male";

		this.baseSprite = new PIXI.Sprite();
		this.armSprite = new PIXI.Sprite();

		this.addChild(this.baseSprite);

		// add multi color replace filter
		const dummyArr = new Array(8).fill(0).map(()=>[0,0]);
		this.colorReplacer = new MultiColorReplaceFilter( dummyArr ,0.001, 8);
		this.baseSprite.filters = [this.colorReplacer];
		this.armSprite.filters = [this.colorReplacer];

		this.zIndex = 0;
		this.armSprite.zIndex = 5;
	}
	initialize(farmer)
	{
		// change body direction
		this.makeReaction( 
			()=>{
				return {
					direction: farmer.direction,
					boundBox: farmer.bodyBoundBox, 
					sheetName: farmer.body.sheet
				};
			},

			this.changeSprite.bind(this)
		);

		// change body color
		this.makeReaction(
			()=>farmer.bodyMaskedColor,

			this.changeColor.bind(this)
		);

		// change sprite sheet
		this.makeReaction( 
			()=>farmer.bodySheet.urlDict,

			this.changeSpriteSheet.bind(this), 
		false);
	}

	changeSprite({direction, boundBox, sheetName})
	{
		const {base, arm, flipped} = boundBox;

		const bodyTexture = new PIXI.Texture(this.baseTextures[sheetName], base);
		const armTexture = new PIXI.Texture(this.baseTextures[sheetName], arm);

		this.baseSprite.texture = bodyTexture;
		this.armSprite.texture = armTexture;

		this.baseSprite.scale.x = flipped ? -1 : 1;
		this.baseSprite.x = flipped ? this.baseSprite.width : 0;

		this.armSprite.scale.x = flipped ? -1 : 1;
		this.armSprite.x = flipped ? this.armSprite.width : 0;

		this.currentSheet = sheetName;

		if(direction === BACK) this.armSprite.zIndex = -1;
		else this.armSprite.zIndex = 5;
	}
	changeColor({from, to})
	{
		this.colorReplacer.replacements = from.map( (col, i)=>[col, to[i]] );
	}
	changeSpriteSheet(sheetURLs)
	{
		this.baseTextures = convertTextureMap(sheetURLs);
		
		this.baseSprite.texture.baseTexture = this.baseTextures[this.currentSheet];
		this.armSprite.texture.baseTexture = this.baseTextures[this.currentSheet];
	}
}

class ViewerPixi
{
	constructor( farmer )
	{
		// set application
		this.app = new PIXI.Application({
			width: 100,
			height: 200,
			resolution: 1,
			antialias: true,
			useContextAlpha: true,
			backgroundColor: 0x000000,
			backgroundAlpha: 0
		});
		// optimize pixi.js setting to pixel environment
		PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
		PIXI.settings.ROUND_PIXELS = true;

		this.container = new PIXI.Container();
		this.container.pivot.set(8, 16);
		this.container.scale.set(5);
		this.container.sortableChildren = true;
		this.app.stage.addChild(this.container);

		this.baseTextures = makeDefaultTextures();
		this.farmer = farmer;

		// for prismatic ticker
		this.elapsedTime = 0;

		// event listener
		this.ticker = this.ticker.bind(this);
	}

	// attach to dom
	appendParent(dom)
	{
		dom.appendChild(this.app.view);

		this.app.stage.pivot.set(-this.app.screen.width/2, -this.app.screen.height/2);
	}

	initializeSprites()
	{
		// add hat sprite
		this.hatSprite = new HatSprite(this.baseTextures.get("hats"));
		this.hatSprite.initialize(this.farmer);
		this.container.addChild(this.hatSprite, this.hatSprite.subSprite);

		// add hair sprite
		this.hairSprite = new HairSprite(
			this.baseTextures.get("hairstyle"), 
			{hairstyles2:this.baseTextures.get("hairstyle2")}
		);
		this.hairSprite.initialize(this.farmer);
		this.container.addChild(this.hairSprite);

		// add shirt sprite
		this.shirtSprite = new ShirtSprite(this.baseTextures.get("shirts"));
		this.shirtSprite.initialize(this.farmer);
		this.container.addChild(this.shirtSprite);

		// add pants sprite
		this.pantsSprite = new PantsSprite(this.baseTextures.get("pants"));
		this.pantsSprite.initialize(this.farmer);
		this.container.addChild(this.pantsSprite);

		// add body sprite
		const bodySpriteSheets = ["body_male", "body_male_bald", "body_female", "body_female_bald"].reduce(
			(map, key)=>{
				map[key] = this.baseTextures.get(key);
				return map;
			}, {}
		);
		this.bodySprite = new BodySprite( bodySpriteSheets );
		this.bodySprite.initialize(this.farmer);
		this.container.addChild(this.bodySprite, this.bodySprite.armSprite);
	}
	initialize()
	{
		this.app.start();

		this.initializeSprites();

		// add resize event listener
		window.addEventListener("resize", this.resize);

		// add ticker
		this.app.ticker.add(this.ticker);
	}
	ticker(dt)
	{
		const FPS = 60;
		const deltaTime = 60 * dt;

		// get prismatic color
		const CYCLE = 3000;
		this.elapsedTime = (this.elapsedTime + deltaTime) % CYCLE;
		const lerpPercent = this.elapsedTime / CYCLE;

		const prismaticTint = getPrismaticColor(lerpPercent);

		// apply prismatic tint
		if(this.hatSprite.prismatic) this.hatSprite.applyTint(prismaticTint);
		if(this.shirtSprite.prismatic) this.shirtSprite.applyTint(prismaticTint);
		if(this.pantsSprite.prismatic) this.pantsSprite.applyTint(prismaticTint);

	}
	destroy()
	{
		this.container.destroy({children:true});
	}
}



export default ViewerPixi;