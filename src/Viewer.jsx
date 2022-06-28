import ViewerCanvas from "./viewer/ViewerCanvas.jsx";
import characterStore from "./stores/CharacterStore.js";
import GenderSelector from "./viewer/GenderSelector.jsx";

const Viewer = ()=>{
	return (
	<div className="viewer">
		<div className="viewer-wrapper">
			<ViewerCanvas characterStore={characterStore} />
			<div className="ui-icon left-turn-button" onClick={()=>characterStore.turnLeft()} ></div>
			<div className="ui-icon right-turn-button" onClick={()=>characterStore.turnRight()} ></div>
			<GenderSelector characterStore={characterStore} />
		</div>
	</div>
	)
}
export default Viewer;