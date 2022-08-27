import ViewerCanvas from "./viewer/ViewerCanvas.jsx";
import characterStore from "./stores/CharacterStore.js";
import GenderSelector from "./viewer/GenderSelector.jsx";

const Viewer = ()=>{
	return (
	<div className="viewer">
		<div className="viewer-wrapper">
			<div className="viewer-box">
				<ViewerCanvas characterStore={characterStore} />
				<div className="ui-icon left-turn-button hover-interact" onClick={()=>characterStore.turnLeft()} ></div>
				<div className="ui-icon right-turn-button hover-interact" onClick={()=>characterStore.turnRight()} ></div>
				<div className="ui-icon shuffle-button hover-interact" onClick={()=>characterStore.randomize()} ></div>
			</div>
			<GenderSelector characterStore={characterStore} />
		</div>
	</div>
	)
}
export default Viewer;