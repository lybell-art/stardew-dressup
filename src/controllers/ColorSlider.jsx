import { useContext } from "react";
import { LangsContext } from "../stores/Langs.js";
import { observer } from "mobx-react-lite";

function ColorSlider({type, selection})
{
	const langs = useContext(LangsContext);

	return (
	<div className="color-slider-wrapper box-with-title">
		<h3>{langs.getText("UI.color")}</h3>
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