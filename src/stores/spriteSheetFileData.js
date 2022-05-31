import {HatsFileStore, HairstyleFileStore, ShirtsFileStore, PantsFileStore} from "./FileStoreBox.js";
import {hatsJsonProcessing, hairstyleJsonProcessing, clothesJsonProcessing} from "../utils/dataProcessing.js";

class SpriteSheetFileData
{
	constructor()
	{
		this.hats = new HatsFileStore();
		this.hairstyle = new HairstyleFileStore();
		this.shirts = new ShirtsFileStore();
		this.pants = new PantsFileStore();
	}
	importHatsData(json)
	{
		this.hats.clothesData = hatsJsonProcessing(json);
	}
	importHairstyleData(json)
	{
		this.hairstyle.clothesData = hairstyleJsonProcessing(json);
	}
	importClothesData(json)
	{
		[this.shirts.clothesData, this.pants.clothesData] = clothesJsonProcessing(json);
	}
}

const spriteSheetFileData = new SpriteSheetFileData();

export default spriteSheetFileData;