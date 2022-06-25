import { makeAutoObservable, reaction } from "mobx";
import { Rectangle } from "pixi.js";

// observable selector store class
import ClothSelectorStore from "./ClothSelectorStore.js";

// observable spritesheet data store class
import {HatsSheetStore, HairstyleSheetStore, ShirtsSheetStore, PantsSheetStore} from "./SpritesheetStore.js";
import {hatsJsonProcessing, hairstyleJsonProcessing, clothesJsonProcessing} from "../utils/dataProcessing.js";

// color utils
import {colorArrayToHex} from "../utils/utils.js";

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
	hatsSelector = new ClothSelectorStore( {value:-1} );
	hairstyleSelector = new ClothSelectorStore( {hue:4*360/100, saturation:74, brightness:75} );
	shirtsSelector = new ClothSelectorStore();
	pantsSelector = new ClothSelectorStore( {hue:61*360/100, saturation:74, brightness:71} );

	// sprite sheet data store
	hatsSheet = new HatsSheetStore();
	hairstyleSheet = new HairstyleSheetStore();
	shirtsSheet = new ShirtsSheetStore();
	pantsSheet = new PantsSheetStore();

	// character props
	direction = BACK;
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
		let gender = this.isMale ? "male" : "female";
		let bald = this.hair.isBald ? "_bald" : "";
		return `body_${gender}${bald}`;
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
		const index = this.shirtsSelector.value

		return {
			index,
			sleeveless: this.shirtsSheet.getSleeveless(index)
		};
	}
	get pants()
	{
		return {
			index: this.pantsSelector.value
		};
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
	get shirtsYOffset()
	{
		let offset = 15;

		if(this.direction === BACK) offset -= 1;
		if(this.isFemale) offset += 1;

		return offset;
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
		const yOffset = dirSheetIdx(this.direction) * height;

		const {x, y, sheet} = this.hairstyleSheet.getSpriteFromInnerIndex(this.hair.index);
		const rect = new Rectangle(x, y + yOffset, width, height);

		return {rect, sheet};
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

		let x = (index % columns)*deltaX;
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
		if ( this.pantsSheet.getPrismatic(this.pants.index) ) return "prismatic";
		if ( this.pantsSheet.getDyeable(this.pants.index) ) return colorArrayToHex(this.pantsSelector.color);
		return 0xffffff;
	}


	// action
	turnLeft()
	{
		this.direction--;
		if (this.direction < 0) this.direction = 3;
	}
	turnRight()
	{
		this.direction++;
		if (this.direction > 3) this.direction = 0;
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
			defaultImage : `assets/${name}.png`
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