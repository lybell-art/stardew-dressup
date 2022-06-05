import { makeObservable, observable, computed, action } from "mobx";
import hatsData from "../data/hatsData.json";
import hairstyleData from "../data/hairstyleData.json";
import shirtData from "../data/shirtData.json";
import pantsData from "../data/pantsData.json";


class FileStoreBox
{
	static id="base";
	static columns=1;
	static deltaX=0;
	static deltaY=0;
	static omittable=false;
	static size={width:20, height:20};

	_spritesheet = null;
	_clothesData = null;

	static getSpriteFromIndex(index, offsetX=0, offsetY=0)
	{
		let x = (index % this.columns)*this.deltaX + offsetX;
		let y = Math.floor(index / this.columns)*this.deltaY + offsetY;

		return {x, y};
	}

	setSpritesheet(file)
	{
		this._spritesheet = file;
	}
	setClothesData(file)
	{
		this._clothesData = file;
	}
	get getListItemKey()
	{
		return (index)=>`${this.constructor.id}-${index}`;
	}
	get getDefaultColor()
	{
		return (index)=>[255,255,255];
	}
	get getDyeable()
	{
		return (index)=>false;
	}
	get getPrismatic()
	{
		return (index)=>false;
	}
	get getItemNameFromIndex()
	{
		return (index)=>`${this.constructor.id}.name.${index}`;
	}
	get getDescriptionFromIndex()
	{
		return (index)=>`${this.constructor.id}.desc.${index}`;
	}
}

class HatsFileStore extends FileStoreBox
{
	static id="hats";
	static columns=12;
	static deltaX=20;
	static deltaY=80;
	static omittable=true;

	_clothesData = hatsData;
	constructor()
	{
		super();
		makeObservable(this, {
			_spritesheet: observable,
			_clothesData: observable,
			setSpritesheet: action,
			setClothesData: action,
			getUncoloredSpriteFromIndex: computed,
			getColoredSpriteFromIndex: computed,
			getPrismaticSpriteFromIndex: computed,
			getHairDrawType: computed,
			getIgnoreHairstyleOffset: computed,
			count: computed
		});
	}

	get getUncoloredSpriteFromIndex()
	{
		return (index)=>this.constructor.getSpriteFromIndex(index, 0, 0);
	}
	get getColoredSpriteFromIndex()
	{
		return (index)=>null;
	}
	get getPrismaticSpriteFromIndex()
	{
		return (index)=>null;
	}
	get getHairDrawType()
	{
		return (index)=>this._clothesData[index]?.hairDrawType ?? 0;
	}
	get getIgnoreHairstyleOffset()
	{
		return (index)=>this._clothesData[index]?.ignoreHairstyleOffset ?? false;
	}
	get count()
	{
		return this._clothesData.length;
	}
}

class HairstyleFileStore extends FileStoreBox
{
	static id="hairstyle";
	static columns=8;
	static deltaX=16;
	static deltaY=96;
	static size={width:16, height:20};

	static coveredTable = [
	7, 1, 7, 11, 7, 5, 6, 7, 
	7, 9, 7, 11, 7, 7, 7, 7, 
	30, 17, 23, 23, 20, 23, 30, 23, 
	24, 25, 30, 27, 28, 29, 30, 23, 
	32, 33, 34, 30, 36, 30, 30, 39, 
	30, 41, 46, 43, 44, 45, 46, 47, 
	6, 52, 50, 51, 52, 53, 54, 55];

	_clothesData = hairstyleData;
	_additionalSheet = {"hairstyle2":null};
	constructor()
	{
		super();
		makeObservable(this, {
			_spritesheet: observable,
			_clothesData: observable,
			_additionalSheet: observable,
			setSpritesheet: action,
			setClothesData: action,
			setAdditionalSheet: action,
			getUncoloredSpriteFromIndex: computed,
			getColoredSpriteFromIndex: computed,
			getPrismaticSpriteFromIndex: computed,
			getListItemKey: computed,
			getInnerIndex: computed,
			getSpriteFromInnerIndex: computed,
			getCoveredHairIndex: computed,
			hasUniqueLeftSprite: computed,
			isBald: computed,
			count: computed
		});
	}


	setAdditionalSheet(data)
	{
		_additionalSheet = {..._additionalSheet, ...data};
	}
	get getListItemKey()
	{
		return (index)=>`${this.constructor.id}-${this.getInnerIndex(index)}`;
	}
	get getInnerIndex()
	{
		const basicHairCount = (this._spritesheet === null ? 672 : this._spritesheet.height) / 96 * 8;
		const additionalHairArray = Object.keys(this._clothesData).filter(idx => idx >= 0).sort((a,b)=>a-b);
		return (index)=>{
			if(index < basicHairCount) return index;
			return additionalHairArray[index - basicHairCount];
		};
	}
	get getSpriteFromInnerIndex()
	{
		return (index)=>{
			if(index in this._clothesData)
			{
				let {tileX, tileY, sheet} = this._clothesData[index];
				return {x:tileX*16, y:tileY*16, sheet};
			}
			return this.constructor.getSpriteFromIndex(index, 0, 0);
		};
	}
	get getUncoloredSpriteFromIndex()
	{
		return (index)=>null;
	}
	get getColoredSpriteFromIndex()
	{
		return (index)=>{
			index = this.getInnerIndex(index);
			return this.getSpriteFromInnerIndex(index);
		};
	}
	get getPrismaticSpriteFromIndex()
	{
		return (index)=>null;
	}
	get getCoveredHairIndex()
	{
		return (index)=>{
			if(index in this._clothesData)
			{
				return this._clothesData[index].coveredHair;
			}
			if(index >= 56) return 30;
			return this.constructor.coveredTable[index];
		}
	}
	get hasUniqueLeftSprite()
	{
		return (index)=>{
			if(index in this._clothesData)
			{
				return this._clothesData[index].useUniqueLeft;
			}
			return false;
		}
	}
	get isBald()
	{
		return (index)=>{
			if(index in this._clothesData)
			{
				return this._clothesData[index].isBald;
			}
			return index > 48 && index < 56;
		}
	}
	get getDyeable()
	{
		return (index)=>true;
	}
	get count()
	{
		const basicHairCount = (this._spritesheet === null ? 672 : this._spritesheet.height) / 96 * 8;
		const additionalHairCount = Object.keys(this._clothesData).reduce( (sum, key)=> sum+(key>0) , 0 );
		return basicHairCount + additionalHairCount;
	}
}


class ShirtsFileStore extends FileStoreBox
{
	static id="shirts";
	static columns=16;
	static deltaX=8;
	static deltaY=32;
	static size={width:8, height:8};

	_clothesData = shirtData;
	_gender = "male";
	constructor()
	{
		super();
		makeObservable(this, {
			_spritesheet: observable,
			_clothesData: observable,
			_gender: observable,
			setSpritesheet: action,
			setClothesData: action,
			gender: computed,
			setGender: action,

			getUncoloredSpriteFromIndex: computed,
			getColoredSpriteFromIndex: computed,
			getPrismaticSpriteFromIndex: computed,
			getDefaultColor: computed,
			getDyeable: computed,
			getSleeveless: computed,
			getPrismatic: computed,
			getItemNameFromIndex: computed,
			count: computed
		});
	}

	get gender()
	{
		return this._gender;
	}
	setGender(value)
	{
		this._gender=value;
	}
	get getUncoloredSpriteFromIndex()
	{
		return (index)=>{
			const data = this._clothesData[index];
			const spriteIndex = this.gender === "male" ? data.male : data.female;
			return this.constructor.getSpriteFromIndex(spriteIndex, 0, 0);
		}
	}
	get getColoredSpriteFromIndex()
	{
		return (index)=>{
			const data = this._clothesData[index];
			if(data.prismatic) return null;

			const spriteIndex = this.gender === "male" ? data.male : data.female;
			return this.constructor.getSpriteFromIndex(spriteIndex, 128, 0);
		}
	}
	get getPrismaticSpriteFromIndex()
	{
		return (index)=>{
			const data = this._clothesData[index];
			if(!data.prismatic) return null;

			const spriteIndex = this.gender === "male" ? data.male : data.female;
			return this.constructor.getSpriteFromIndex(spriteIndex, 128, 0);
		}
	}
	get getDefaultColor()
	{
		return (index)=>[...this._clothesData[index].color];
	}
	get getDyeable()
	{
		return (index)=>this._clothesData[index].dyeable;
	}
	get getSleeveless()
	{
		return (index)=>this._clothesData[index].sleeveless;
	}
	get getPrismatic()
	{
		return (index)=>this._clothesData[index].prismatic;
	}
	get getItemNameFromIndex()
	{
		return (index)=>this._clothesData[index].name;
	}
	get count()
	{
		return this._clothesData.length;
	}
}

class PantsFileStore extends FileStoreBox
{
	static id="pants";
	static columns=10;
	static deltaX=192;
	static deltaY=688;
	static size={width:16, height:16};

	_clothesData = pantsData;

	constructor()
	{
		super();
		makeObservable(this, {
			_spritesheet: observable,
			_clothesData: observable,
			setSpritesheet: action,
			setClothesData: action,

			getUncoloredSpriteFromIndex: computed,
			getColoredSpriteFromIndex: computed,
			getPrismaticSpriteFromIndex: computed,
			getDefaultColor: computed,
			getDyeable: computed,
			getPrismatic: computed,
			getItemNameFromIndex: computed,
			count: computed
		});
	}
	get getUncoloredSpriteFromIndex()
	{
		return (index)=>{
			const data = this._clothesData[index];
			if( data.prismatic ) return null;
			if( !data.dyeable ) return this.constructor.getSpriteFromIndex(data.sheetIndex, 0, 672);
			return null;
		}
	}
	get getColoredSpriteFromIndex()
	{
		return (index)=>{
			const data = this._clothesData[index];
			if( data.prismatic ) return null;
			if( data.dyeable ) return this.constructor.getSpriteFromIndex(data.sheetIndex, 0, 672);
			return null;
		}
	}
	get getPrismaticSpriteFromIndex()
	{
		return (index)=>{
			const data = this._clothesData[index];
			return data.prismatic ? this.constructor.getSpriteFromIndex(data.sheetIndex, 0, 672) : null;
		}
	}
	get getDefaultColor()
	{
		return (index)=>[...this._clothesData[index].color];
	}
	get getDyeable()
	{
		return (index)=>this._clothesData[index].dyeable;
	}
	get getPrismatic()
	{
		return (index)=>this._clothesData[index].prismatic;
	}
	get getItemNameFromIndex()
	{
		return (index)=>this._clothesData[index].name;
	}
	get count()
	{
		return this._clothesData.length;
	}
}

export {HatsFileStore, HairstyleFileStore, ShirtsFileStore, PantsFileStore};