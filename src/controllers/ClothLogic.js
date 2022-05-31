import shirtData from "../data/shirtData.json";
import pantsData from "../data/pantsData.json";

class BaseLogic
{
	static id=null;
	static columns=1;
	static deltaX=0;
	static deltaY=0;
	static getSpriteFromIndex(index, offsetX=0, offsetY=0)
	{
		let x = (index % this.columns)*this.deltaX + offsetX;
		let y = Math.floor(index / this.columns)*this.deltaY + offsetY;

		return {x, y};
	}
	static getDefaultColor(index)
	{
		return [255,255,255];
	}
	static getDyeable(index)
	{
		return false;
	}
	static getPrismatic(index)
	{
		return false;
	}
	static getItemNameFromIndex(index)
	{
		return `${id}.name.${index}`;
	}
	static getDescriptionFromIndex(index)
	{
		return `${id}.desc.${index}`;
	}
}

class HatsLogic extends BaseLogic
{
	static id="hats";
	static columns=12;
	static deltaX=20;
	static deltaY=80;
	static getUncoloredSpriteFromIndex(index)
	{
		return super.getSpriteFromIndex(index, 0, 0);
	}
	static getColoredSpriteFromIndex(index)
	{
		return null;
	}
	static count()
	{
		return 82;
	}
}

class HairstyleLogic extends BaseLogic
{
	static id="hairstyle";
	static columns=8;
	static deltaX=16;
	static deltaY=96;
	static getUncoloredSpriteFromIndex(index, baseSpriteSheetHeight=672)
	{
		return null;
	}
	static getColoredSpriteFromIndex(index, baseSpriteSheetHeight=672)
	{
		return super.getSpriteFromIndex(index, 0, 0);
	}
	static getDyeable(index)
	{
		return true;
	}
	static count(baseSpriteSheetHeight=672)
	{
		return baseSpriteSheetHeight / 96 * 8 + hairstyleData.length;
	}
}

class ShirtsLogic extends BaseLogic
{
	static id="shirts";
	static columns=16;
	static deltaX=8;
	static deltaY=8;
	static getUncoloredSpriteFromIndex(index, isMale=true)
	{
		let data = shirtData[index];
		let spriteIndex = isMale ? data.male : data.female;
		return super.getSpriteFromIndex(spriteIndex, 0, 0);
	}
	static getColoredSpriteFromIndex(index, isMale=true)
	{
		let data = shirtData[index];
		let spriteIndex = isMale ? data.male : data.female;
		return super.getSpriteFromIndex(spriteIndex, 128, 0);
	}
	static getDefaultColor(index)
	{
		return [...shirtData[index].color];
	}
	static getDyeable(index)
	{
		return shirtData[index].dyeable;
	}
	static getPrismatic(index)
	{
		return shirtData[index].prismatic;
	}
	static getItemNameFromIndex(index)
	{
		return shirtData[index].name;
	}
}

class PantsLogic extends BaseLogic
{
	static id="pants";
	static columns=16;
	static deltaX=8;
	static deltaY=8;
	static getUncoloredSpriteFromIndex(index)
	{
		let data = pantsData[index];
		return data.dyeable ? null : super.getSpriteFromIndex(data.sheetIndex, 0, 0);
	}
	static getColoredSpriteFromIndex(index)
	{
		let data = pantsData[index];
		return data.dyeable ? super.getSpriteFromIndex(data.sheetIndex, 0, 0) : null;
	}
	static getDefaultColor(index)
	{
		return [...pantsData[index].color];
	}
	static getDyeable(index)
	{
		return pantsData[index].dyeable;
	}
	static getPrismatic(index)
	{
		return pantsData[index].prismatic;
	}
	static getItemNameFromIndex(index)
	{
		return pantsData[index].name;
	}
}
