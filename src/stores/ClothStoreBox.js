import { makeAutoObservable } from "mobx";
import { HSLtoRGB } from "../utils/utils.js";

class ClothStoreBox
{
	value=0;
	color=[255,255,255];

	constructor(initialValue=0)
	{
		makeAutoObservable(this);
		this.value=initialValue;
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