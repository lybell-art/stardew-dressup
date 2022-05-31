import { makeAutoObservable } from "mobx";
import shirtData from "../data/shirtData.json";




class FileStoreBox
{
	static id="";
	static columns=1;
	static deltaX=0;
	static deltaY=0;

	_spritesheet = null;
	_clothesData = null;

	static getSpriteFromIndex(index, offsetX=0, offsetY=0)
	{
		let x = (index % this.columns)*this.deltaX + offsetX;
		let y = Math.floor(index / this.columns)*this.deltaY + offsetY;

		return {x, y};
	}
	constructor(o)
	{
		makeAutoObservable(o);
	}

	set spritesheet(file)
	{
		this._spritesheet = file;
	}
	set clothesData(file)
	{
		this._clothesData = file;
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

	constructor()
	{
		super(this);
	}
	get getUncoloredSpriteFromIndex()
	{
		return (index)=>this.constructor.getSpriteFromIndex(index, 0, 0);
	}
	get getColoredSpriteFromIndex()
	{
		return (index)=>null;
	}
	get count()
	{
		return 82;
	}
}

class HairstyleFileStore extends FileStoreBox
{
	static id="hairstyle";
	static columns=8;
	static deltaX=16;
	static deltaY=96;

	_clothesData = hairstyleData;
	_additionalSheet = {"hairstyle2":null};
	constructor()
	{
		super(this);
	}
	set additionalSheet(data)
	{
		_additionalSheet = {..._additionalSheet, ...data};
	}
	get getInnerIndex()
	{
		const basicHairCount = (_spritesheet === null ? 672 : _spritesheet.height) / 96 * 8;
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
				return {tileX*16, tileY*16, sheet};
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
			return this.getInnerSpriteIndex(index);
		};
	}
	get getDyeable()
	{
		return (index)=>true;
	}
	get count()
	{
		const basicHairCount = (_spritesheet === null ? 672 : _spritesheet.height) / 96 * 8;
		const additionalHairCount = Object.keys(this._clothesData).reduce( (sum, key)=> sum+(key>0) , 0 );
		return basicHairCount+additionalHairCount
	}
}


class ShirtsFileStore extends FileStoreBox
{
	static id="shirts";
	static columns=16;
	static deltaX=8;
	static deltaY=8;

	_clothesData = shirtData;
	gender = "male";
	constructor()
	{
		super(this);
	}
	get getUncoloredSpriteFromIndex()
	{
		return (index)=>{
			const data = this._clothesData[index];
			const spriteIndex = gender === "male" ? data.male : data.female;
			return this.constructor.getSpriteFromIndex(data.male, 0, 0);
		}
	}
	get getColoredSpriteFromIndex()
	{
		return (index)=>{
			const data = this._clothesData[index];
			const spriteIndex = gender === "male" ? data.male : data.female;
			return this.constructor.getSpriteFromIndex(data.male, 128, 0);
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

class PantsFileStore extends FileStoreBox
{
	static id="pants";
	static columns=10;
	static deltaX=192;
	static deltaY=688;

	_clothesData = pantsData;
	constructor()
	{
		super(this);
	}
	get getUncoloredSpriteFromIndex()
	{
		return (index)=>{
			const data = this._clothesData[index];
			return data.dyeable ? null : super.getSpriteFromIndex(data.sheetIndex, 0, 672);
		}
	}
	get getColoredSpriteFromIndex()
	{
		return (index)=>{
			const data = this._clothesData[index];
			return data.dyeable ? super.getSpriteFromIndex(data.sheetIndex, 0, 672) : null;
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