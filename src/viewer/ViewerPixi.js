import { reaction } from "mobx";
import * as PIXI from "pixi.js";
import { colorArrayToHex, getPrismaticColor } from "../utils/utils.js";
import { convertTextureMap } from "../utils/convertTexture.js";

// direction constant(using stardew valley code)
const FRONT = 2;
const BACK = 0;
const LEFT = 3;
const RIGHT = 1;

function makeDefaultTextures()
{
	const defaultTextureSrc = {
		body_male:"/assets/farmer_base.png",
		body_male_bald:"/assets/farmer_base_bald.png",
		body_female:"/assets/farmer_girl_base.png",
		body_female_bald:"/assets/farmer_girl_base_bald.png",
		hats:"/assets/hats.png",
		hairstyle:"/assets/hairstyle.png",
		hairstyle2:"/assets/hairstyles2.png",
		shirts:"/assets/shirts.png",
		pants:"/assets/pants.png"
	};

	const map=new Map();
	for(let [key, value] of Object.entries(defaultTextureSrc))
	{
		map.set(key, new PIXI.BaseTexture(value));
	}
	return map;
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
		this.subSprite.zIndex = 2;

		this.zIndex = 5;
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
			()=>farmer.hatsSheet._spritesheet?.blobURL ?? "/assets/hats.png",

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
		this.sprite.texture.baseTexture = this.baseTexture;
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

		this.zIndex = 4;
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
				let additional = {...farmer.hairstyleSheet._additionalSheet, hairstyles2:"/assets/hairstyles2.png" };
				return {
					base:farmer.hairstyleSheet._spritesheet?.blobURL ?? "/assets/hairstyle.png",
					additional
				};
			},

			this.changeSpriteSheet.bind(this), 
		false);
	}

	changeSprite({boundBox, offsetY})
	{
		const {rect, sheet="default", flipped} = boundBox;
		const baseTexture = sheet === "default" ? this.baseTexture : this.additionalTexture[sheet];
		const texture = new PIXI.Texture(baseTexture, rect);

		this.sprite.texture = texture;
		this.sprite.x = 0;
		this.sprite.y = offsetY;
		this.currentSheet = sheet;
		this.sprite.scale.x = flipped ? -1 : 1;
		if(flipped) this.sprite.x = this.sprite.width;
	}
	changeSpriteSheet({base, additional})
	{
		this.baseTexture = new PIXI.BaseTexture(base);
		this.additionalTexture = convertTextureMap(additional);

		const myTexture = this.currentSheet === "default" ? this.baseTexture : this.additionalTexture[this.currentSheet];
		this.sprite.texture.baseTexture = myTexture;
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

		this.zIndex = 3;
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
			()=>farmer.shirtsSheet._spritesheet?.blobURL ?? "/assets/shirts.png",

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
		this.uncoloredSprite.texture.baseTexture = this.baseTexture;
		this.coloredSprite.texture.baseTexture = this.baseTexture;
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

		this.zIndex = 2;
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
			()=>farmer.pantsSheet._spritesheet?.blobURL ?? "/assets/pants.png",

			this.changeSpriteSheet.bind(this), 
		false);
	}

	changeSprite(boundBox)
	{
		const texture = new PIXI.Texture(this.baseTexture, boundBox);
		this.sprite.texture = texture;
	}
	changeColor(tint)
	{
		this.prismatic = (tint === "prismatic");
		if(!this.prismatic) this.applyTint(tint);
	}
	changeSpriteSheet(assetURL)
	{
		this.baseTexture = new PIXI.BaseTexture(assetURL);
		this.sprite.texture.baseTexture = this.baseTexture;
	}
	applyTint(tint)
	{
		this.sprite.tint = tint;
	}
}


class ViewerPixi
{
	constructor( farmer )
	{
		// set application
		this.app = new PIXI.Application({
			resolution: 1,
			antialias: true,
			backgroundColor: 0xffffff,
			autoResize:true
		});
		// optimize pixi.js setting to pixel environment
		PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
		PIXI.settings.ROUND_PIXELS = true;

		this.app.stage.pivot.set(0.5);

		this.container = new PIXI.Container();
		this.container.pivot.set(8, 16);
		this.container.scale.set(5);
		this.container.sortableChildren = true;
		this.app.stage.addChild(this.container);

		const debug = new PIXI.Graphics();
		debug.beginFill(0x24adaf);
		debug.drawRect(0, 0, 16, 32);
		debug.endFill();

		this.container.addChild(debug);

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

		this.app.resizeTo = dom;
		this.app.screen.height = dom.clientHeight;
		this.app.view.height = dom.clientHeight;
		this.app.stage.pivot.set(-this.app.screen.width/2, -this.app.screen.height/2);
	}

	initialize()
	{
		this.app.start();

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