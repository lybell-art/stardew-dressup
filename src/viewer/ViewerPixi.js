import { reaction } from "mobx";
import * as PIXI from "pixi.js";
import { colorArrayToHex, getPrismaticColor } from "../utils/utils.js";

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
	}
	initialize(farmer)
	{
		// change hats index or hairstyle index
		this.makeReaction( 
			()=>{
				return {
					boundBox : farmer.hatBoundBox,
					offsetY : farmer.hatYOffset
				};
			}, 

			( {boundBox, offsetY} )=>{
				console.log("yes!");
				const texture = new PIXI.Texture(this.baseTexture, boundBox);

				this.sprite.texture = texture;
				this.sprite.x = -2;
				this.sprite.y = offsetY;
			}
		);

		// change color
		this.makeReaction( 
			()=>farmer.hatTint, 

			tint=>{
				console.log("yearh!!");
				this.prismatic = (tint === "prismatic");
				if(!this.prismatic) this.sprite.tint = 0xffffff;
			}
		);

		// change sprite sheet
		this.makeReaction( 
			()=>farmer.hatsSheet._spritesheet?.blobURL ?? "/assets/hats.png",

			assetURL=>{
				this.baseTexture = new PIXI.BaseTexture(assetURL);
				this.sprite.texture.baseTexture = this.baseTexture;
			}, 
		false);
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
		this.container.addChild(this.hatSprite);

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
		if(this.hatSprite.prismatic) this.hatSprite.applyTint(prismaticTint);;
	}
	destroy()
	{
		this.container.destroy({children:true});
	}
}


export default ViewerPixi;