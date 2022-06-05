import { makeObservable, observable, action, computed } from "mobx";
import { HSLtoRGB } from "../utils/utils.js";

class ClothStoreBox
{
	value=0;
	hue=0;
	saturation=100;
	lightness=50;

	constructor(initialValue=0)
	{
		makeObservable(this, {
			value: observable,
			hue: observable,
			saturation: observable,
			lightness: observable,
			color: computed,
			changeSelect: action,
			changeHue: action,
			changeSaturation: action,
			changeLightness: action
		});
		this.value=initialValue;
	}
	get color()
	{
		return HSLtoRGB(this.hue, this.saturation, this.lightness);
	}

	changeSelect(value)
	{
		this.value = value;
	}
	changeHue(hue)
	{
		this.hue = +hue;
	}
	changeSaturation(saturation)
	{
		this.saturation = +saturation;
	}
	changeLightness(lightness)
	{
		this.lightness = +lightness;
	}
}

export default ClothStoreBox;