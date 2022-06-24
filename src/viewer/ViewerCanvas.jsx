import {Component, createRef} from "react";
import ViewerPixi from "./ViewerPixi.js";
import characterStore from "../stores/CharacterStore.js";

class ViewerCanvas extends Component
{
	constructor()
	{
		super();

		// make item list controller pixi.js canvas
		this.hud = new ViewerPixi(characterStore);

		// for attach canvas
		this.canvasDom = createRef();
	}

	componentDidMount() {
		if(this.canvasDom.current){
			this.hud.appendParent(this.canvasDom.current);
			this.hud.initialize();
		}
	}
	componentWillUnmount() {
		if(this.canvasDom.current){
			this.hud.destroy();
		}
	}
	render()
	{
		return <div className="viewer-canvas" ref={this.canvasDom}></div>;
	}
}

export default ViewerCanvas;