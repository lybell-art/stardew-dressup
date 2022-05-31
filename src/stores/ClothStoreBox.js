import { makeAutoObservable } from "mobx";
import { HSLtoRGB } from "../utils/utils.js";

class ClothStoreBox
{
	value=0;
	color=[255,255,255];

	constructor()
	{
		makeAutoObservable(this);
	}
	changeSelect(value)
	{
		this.value = value;
	}
	changeColor(hue, saturation, lightness)
	{
		this.color = HSLtoRGB(hue, saturation, lightness);
	}
}

export default ClothStoreBox;