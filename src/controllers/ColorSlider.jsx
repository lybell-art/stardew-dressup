import { observer } from "mobx-react-lite";
import { HSBtoRGB, HSBToString } from "../utils/colors.js";

function getStyle(type, {hue, saturation, brightness})
{
	if(type === "H") return {["--thumb-border-color"] : HSBToString(hue, 100, 100)};
	if(type === "S")
	{
		return {
			["--thumb-border-color"] : HSBToString(hue, saturation, brightness),
			["--left"] : HSBToString(hue, 0, brightness),
			["--right"] : HSBToString(hue, 100, brightness)
			
		};
	}
	if(type === "B")
	{
		return {
			["--thumb-border-color"] : HSBToString(hue, saturation, brightness),
			["--left"] : HSBToString(hue, saturation, 0),
			["--right"] : HSBToString(hue, saturation, 100)
		};
	}
}

const ColorSliderItem = observer( ({type, selection})=>{
	const [value, setValue, name] = ( (type, selection)=>{
		if(type === "H") return [selection.hue, selection.changeHue.bind(selection), "slider-hue"];
		if(type === "S") return [selection.saturation, selection.changeSaturation.bind(selection), "slider-saturation"];
		if(type === "B") return [selection.brightness, selection.changeBrightness.bind(selection), "slider-brightness"];
	} )(type, selection);

	const style = getStyle(type, selection);

	return (
		<label>
			<p className="label">{type}</p>
			<input type="range" min="0" max={type === "H" ? 360 : 100} value={value} className={name} 
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