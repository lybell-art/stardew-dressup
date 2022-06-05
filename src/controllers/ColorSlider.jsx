import { observer } from "mobx-react-lite";

function ColorSlider({type, selection})
{
	return (
	<div className="color-slider-wrapper">
		<input type="range" min="0" max="360" defaultValue={selection.hue} className="hue-slider" 
			onChange={(e)=>selection.changeHue(+e.target.value)}/>
		<input type="range" min="0" max="100" defaultValue={selection.saturation} className="saturation-slider" 
			onChange={(e)=>selection.changeSaturation(+e.target.value)}/>
		<input type="range" min="0" max="100" defaultValue={selection.lightness} className="lightness-slider" 
			onChange={(e)=>selection.changeLightness(+e.target.value)}/>
	</div>
	)
}

export default observer(ColorSlider);