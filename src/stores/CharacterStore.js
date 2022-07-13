import { makeAutoObservable } from "mobx";
import { Rectangle } from "pixi.js";

// observable selector store class
import ClothSelectorStore from "./ClothSelectorStore.js";

// observable spritesheet data store class
import {HatsSheetStore, HairstyleSheetStore, ShirtsSheetStore, PantsSheetStore, BodySheetStore} from "./SpritesheetStore.js";
import {hatsJsonProcessing, hairstyleJsonProcessing, clothesJsonProcessing} from "../utils/dataProcessing.js";

// color utils
import {colorArrayToHex, multiplyColor} from "../utils/utils.js";

// direction constant(using stardew valley code)
const FRONT = 2;
const BACK = 0;
const LEFT = 3;
const RIGHT = 1;

// direction value for actual sprite sheet
function dirSheetIdx(direction, hasLeft=false)
{
	switch (direction)
	{
		case FRONT: return 0;
		case BACK: return hasLeft ? 3 : 2;
		case RIGHT: return 1;
		case LEFT: return hasLeft ? 2 : 1;
	}
}

function getHair(hairIndex, hatHairDrawType, getCoveredHairIndex)
{
	const ORIGINAL = 0;
	const COVERED = 1;
	const HIDE = 2;

	if(hairIndex === -1) return hairIndex;
	if(hatHairDrawType === HIDE) return 52; // bald
	if(hatHairDrawType === ORIGINAL) return hairIndex;
	return getCoveredHairIndex(hairIndex);
}

class CharacterStore
{
	// selector store
	bodySelector = new ClothSelectorStore( {hue:3*360/100, saturation:57, brightness:47} );
	hatsSelector = new ClothSelectorStore( {value:-1} );
	hairstyleSelector = new ClothSelectorStore( {hue:4*360/100, saturation:74, brightness:75} );
	shirtsSelector = new ClothSelectorStore();
	pantsSelector = new ClothSelectorStore( {hue:61*360/100, saturation:74, brightness:71} );

	// sprite sheet data store
	bodySheet = new BodySheetStore();
	hatsSheet = new HatsSheetStore();
	hairstyleSheet = new HairstyleSheetStore();
	shirtsSheet = new ShirtsSheetStore();
	pantsSheet = new PantsSheetStore();

	// character props
	direction = FRONT;
	isMale = true;

	constructor()
	{
		makeAutoObservable(this);
	}

	// computed
	get isFemale()
	{
		return !this.isMale;
	}
	get body()
	{
		const gender = this.isMale ? "male" : "female";
		const bald = this.hair.isBald ? "_bald" : "";
		const sheet = `body_${gender}${bald}`;

		return {sheet};
	}
	get bodyMaskedColor()
	{
		const {skin, eye, sleeve} = this.bodySheet.bodyColor[this.body.sheet];
		return {
			from:[...skin, ...eye, ...sleeve],
			to:[...this.skinColor, ...this.eyeColor, ...this.sleeveColor]
		};
	}
	get hat()
	{
		const index = this.hatsSelector.value;

		return {
			index,
			ignoreYOffset: this.hatsSheet.getIgnoreHairstyleOffset(index),
			isMask: this.hatsSheet.getMask(index)
		};
	}
	get hair()
	{
		let index = this.hairstyleSheet.getInnerIndex(this.hairstyleSelector.value);
		const hairDrawType = this.hatsSheet.getHairDrawType(this.hatsSelector.value);

		// get hair
		const [ORIGINAL, COVERED, HIDE] = [0, 1, 2];
		switch(hairDrawType)
		{
			case HIDE: index = 52; break;
			case COVERED: index = this.hairstyleSheet.getCoveredHairIndex(index); break;
		}

		return {
			index,
			hasUniqueLeftSprite: this.hairstyleSheet.hasUniqueLeftSprite(index),
			isBald: hairDrawType !== HIDE && this.hairstyleSheet.isBald(index)
		};
	}
	get shirt()
	{
		const index = this.shirtsSelector.value;

		return {
			index,
			sleeveless: this.shirtsSheet.getSleeveless(index)
		};
	}
	get pants()
	{
		const index = this.pantsSheet.getInnerIndex(this.pantsSelector.value);

		return {index};
	}

	get skinColor()
	{
		const index = this.bodySelector.value;
		const {light, mid, dark} = this.bodySheet.getSkinColor(index);
		return [light, mid, dark];
	}
	get eyeColor()
	{
		const baseColor = colorArrayToHex(this.bodySelector.color);
		return [baseColor, baseColor];
	}
	get sleeveColor()
	{
		if(this.shirt.sleeveless) {
			return this.skinColor;
		};
		let {light, mid, dark, dyeable=0} = this.shirtsSheet.getSleeveColor(this.shirt.index);

		// tint sleeve color
		const color = this.shirtsSelector.color;
		if(dyeable & 4 !== 0) light = multiplyColor(light, color);
		if(dyeable & 2 !== 0) mid = multiplyColor(mid, color);
		if(dyeable & 1 !== 0) dark = multiplyColor(dark, color);

		return [light, mid, dark];
	}

	get hatYOffset()
	{
		let offset = -2;

		if(this.direction === BACK) offset -= 1;
		if(this.hat.ignoreYOffset === false)
		{
			const hairtype = this.hair.index % 16;
			if(hairtype === 3 || hairtype === 6 || hairtype === 8) offset += 1;
		}
		if(this.isFemale) offset += 1;

		return offset;
	}
	get hairstyleYOffset()
	{
		let offset = 1;

		if(this.hair.index >= 16) offset -= 1;
		if(this.isFemale) offset += 1;

		return offset;
	}
	get shirtYOffset()
	{
		let offset = 15;

		if(this.direction === BACK) offset -= 1;
		if(this.isFemale) offset += 1;

		return offset;
	}

	get bodyBoundBox()
	{
		const width = 16, height = 32;
		const y = dirSheetIdx(this.direction) * height;
		const flipped = (this.direction === LEFT);
		const base = new Rectangle(0, y, width, height);
		const arm = new Rectangle(96, y, width, height);

		return {base, arm, flipped};
	}
	get hatBoundBox()
	{
		const {width, height} = HatsSheetStore.size;
		const yOffset = dirSheetIdx(this.direction, true) * height;
		const {x, y} = HatsSheetStore.getSpriteFromIndex(this.hat.index, 0, yOffset);
		const rect = new Rectangle(x, y, width, height);

		return rect;
	}
	get hairBoundBox()
	{
		const width = 16, height = 32;
		let yOffset;
		if(this.hair.hasUniqueLeftSprite)
		{
			switch(this.direction)
			{
				case FRONT: yOffset = 0; break;
				case BACK: yOffset = 2 * height; break;
				case RIGHT: yOffset = 1 * height; break;
				case LEFT: yOffset = 3 * height; break;
			}
		}
		else yOffset = dirSheetIdx(this.direction) * height;

		const {x, y, sheet} = this.hairstyleSheet.getSpriteFromInnerIndex(this.hair.index);
		const rect = new Rectangle(x, y + yOffset, width, height);
		const flipped = this.hair.hasUniqueLeftSprite ? false : (this.direction === LEFT) ;

		return {rect, sheet, flipped};
	}
	get shirtBoundBox()
	{
		const {width, height} = ShirtsSheetStore.size;
		const yOffset = dirSheetIdx(this.direction, true) * height;

		const {x, y} = this.shirtsSheet.getUncoloredSpriteFromIndex(this.shirt.index);

		const uncolored = new Rectangle(x, y + yOffset, width, height);
		const colored = new Rectangle(x + 128, y + yOffset, width, height);

		return {uncolored, colored};
	}
	get pantsBoundBox()
	{
		const width = 16, height = 32;
		const yOffset = dirSheetIdx(this.direction) * height;
		const {columns, deltaX, deltaY} = PantsSheetStore;
		const index = this.pants.index;

		let x = (index % columns)*deltaX + (this.isMale ? 0 : 96);
		let y = Math.floor(index / columns)*deltaY + yOffset;

		const rect = new Rectangle(x, y, width, height);

		return rect;
	}

	get hatTint()
	{
		if ( this.hatsSheet.getPrismatic(this.hat.index) ) return "prismatic";
		return 0xffffff;
	}
	get hairTint()
	{
		return colorArrayToHex(this.hairstyleSelector.color);
	}
	get shirtTint()
	{
		if ( this.shirtsSheet.getPrismatic(this.shirt.index) ) return "prismatic";
		return colorArrayToHex(this.shirtsSelector.color);
	}
	get pantsTint()
	{
		const index = this.pantsSelector.value;
		if ( this.pantsSheet.getPrismatic(index) ) return "prismatic";
		if ( this.pantsSheet.getDyeable(index) ) return colorArrayToHex(this.pantsSelector.color);
		return 0xffffff;
	}


	// action
	turnLeft()
	{
		this.direction++;
		if (this.direction > 3) this.direction = 0;
	}
	turnRight()
	{
		this.direction--;
		if (this.direction < 0) this.direction = 3;
	}
	setGender(value)
	{
		if(value === "male")
		{
			this.isMale=true;
			this.shirtsSheet.setGender(value);
		}
		if(value === "female")
		{
			this.isMale=false;
			this.shirtsSheet.setGender(value);
		}
	}

	// for <ClothesController /> component
	getProps(name)
	{
		return {
			selection : this[`${name}Selector`],
			dataSet : this[`${name}Sheet`],
			defaultImage : name === "body" ? "assets/farmer_base_bald.png" : `assets/${name}.png`
		};
	}

	// import json data
	importHatsData(json)
	{
		this.hatsSheet.setClothesData( hatsJsonProcessing(json) );
	}
	importHairstyleData(json)
	{
		this.hairstyleSheet.setClothesData( hairstyleJsonProcessing(json) );
	}
	importClothesData(json)
	{
		const [shirtsData, pantsData] = clothesJsonProcessing(json);

		this.shirtsSheet.setClothesData( shirtsData );
		this.pantsSheet.setClothesData( shirtsData );
	}
}

const characterStore = new CharacterStore();

export default characterStore;