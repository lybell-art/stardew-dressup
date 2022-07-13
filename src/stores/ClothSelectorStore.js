import { makeObservable, observable, action, computed } from "mobx";
import { HSBtoRGB } from "../utils/utils.js";

class ClothSelectorStore
{
	value=0;
	hue=0;
	saturation=0;
	brightness=100;

	constructor({value=0, hue=0, saturation=0, brightness=100}={})
	{
		makeObservable(this, {
			value: observable,
			hue: observable,
			saturation: observable,
			brightness: observable,
			color: computed,
			changeSelect: action,
			changeHue: action,
			changeSaturation: action,
			changeBrightness: action
		});
		this.value=value;
		this.hue=Math.round(hue);
		this.saturation=Math.round(saturation);
		this.brightness=Math.round(brightness);
	}
	get color()
	{
		return HSBtoRGB(this.hue, this.saturation, this.brightness);
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
	changeBrightness(brightness)
	{
		this.brightness = +brightness;
	}
}

export default ClothSelectorStore;