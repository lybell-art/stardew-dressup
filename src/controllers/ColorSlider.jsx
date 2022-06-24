import { observer } from "mobx-react-lite";
import { HSBtoRGB }from "../utils/utils.js";

function HSBToString(hue, saturation, brightness)
{
	const rgb = HSBtoRGB(hue, saturation, brightness);
	return `RGB(${rgb.join(", ")})`;
}

const ColorSliderItem = observer( ({type, selection})=>{
	
	const [value, setValue, name] = ( (type, selection)=>{
		if(type === "H") return [selection.hue, selection.changeHue.bind(selection), "slider-hue"];
		if(type === "S") return [selection.saturation, selection.changeSaturation.bind(selection), "slider-saturation"];
		if(type === "B") return [selection.brightness, selection.changeBrightness.bind(selection), "slider-brightness"];
	} )(type, selection);

	let style={};
	if(type === "H")
	{
		style["--thumb-border-color"] = HSBToString(selection.hue, 100, 100);
	}
	else if(type === "S")
	{
		style["--thumb-border-color"] = HSBToString(selection.hue, selection.saturation, selection.brightness);
		style["--left"] = HSBToString(selection.hue, 0, selection.brightness);
		style["--right"] = HSBToString(selection.hue, 100, selection.brightness);
	}
	else if(type === "B")
	{
		style["--thumb-border-color"] = HSBToString(selection.hue, selection.saturation, selection.brightness);
		style["--left"] = HSBToString(selection.hue, selection.saturation, 0);
		style["--right"] = HSBToString(selection.hue, selection.saturation, 100);
	}

	return (
		<label>
			<p className="label">{type}</p>
			<input type="range" min="0" max={type === "H" ? 360 : 100} defaultValue={value} className={name} 
				onChange={e=>setValue(+e.target.value)} 
				onTouchMove={e=>e.stopPropagation()} style={style}/>
			<output>{value}</output>
		</label>
	)
} );

function ColorSlider({selection})
{
	return (
	<div className="slider">
		<ColorSliderItem type="H" selection={selection} />
		<ColorSliderItem type="S" selection={selection} />
		<ColorSliderItem type="B" selection={selection} />
	</div>
	)
}

export default observer(ColorSlider);