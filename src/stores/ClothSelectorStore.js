import { makeObservable, observable, action, computed } from "mobx";
import { HSBtoRGB, getRandomClothesColor } from "../utils/colors.js";
import EventHub from "../events/eventHub.js";

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
			adjustSelect: action,
			changeHue: action,
			changeSaturation: action,
			changeBrightness: action,
			randomizeColor: action
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

	changeSelect(value, dirty=true)
	{
		this.value = value;
		if(dirty) EventHub.dispatchEvent("changeCloth", {sender:this, value});
	}
	adjustSelect(count)
	{
		if(this.value >= count) this.value = 0;
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
	randomizeColor(alwaysDarken=false)
	{
		const darken = alwaysDarken || (Math.random() < 0.5);
		[this.hue, this.saturation, this.brightness] = getRandomClothesColor(darken);
	}
}

export default ClothSelectorStore;