import { Component, createRef } from "react";
import ItemListController from "./clothListControllerPixi.js";

function getScrollDelta(e)
{
	return e.deltaY ?? (typeof e.wheelDeltaY === "number" ? -e.wheelDeltaY : e.detail);
}

class ItemSelector extends Component
{
	constructor(props)
	{
		super(props);
		const {selection, dataSet, defaultImage, additionalDefaultImage={}} = props;
		this.hud = new ItemListController({selectBox:selection, defaultImage, additionalDefaultImage});
		this.hud.initializeRadio(dataSet.constructor.omittable ? -1 : 0);
		this.hud.initializeSprites(dataSet, defaultImage, additionalDefaultImage);

		this.canvasDom = createRef();

		this.state = {
			expanded : false
		};

		this.toggleExpansion = this.toggleExpansion.bind(this);
		this.scroll = e=>{
			e.preventDefault();
			let delta = Math.sign(getScrollDelta(e));
			this.hud.onWheel(delta);
		}
	}
	componentDidMount() {
		if(this.canvasDom.current){
			this.hud.appendParent(this.canvasDom.current);
			this.hud.initialize(this.props.dataSet);
			this.canvasDom.current.addEventListener('wheel', this.scroll, {passive:false});
		}
	}
	componentWillUnmount() {
		if(this.canvasDom.current){
			this.hud.halt();
			this.canvasDom.current.removeEventListener('wheel', this.scroll, {passive:false});
		}
	}
	toggleExpansion()
	{
		this.setState((state) => {
			return {expanded: !state.expanded};
		});
	}
	componentDidUpdate() {
		setTimeout(()=>this.hud.toggleExpantion(this.state.expaned), 300);
	}
	render()
	{
		return (
			<div className="cloth-list-wrapper">
				<div className={`left-button ${this.state.expanded ? "inactive" : ""}`} onClick={()=>this.hud.slideLeft()}></div>
				<div className="cloth-list-border">
					<div className={`hidden ${this.state.expanded ? "expanded" : ""}`} style={{"display":"none"}} />
					<div className="cloth-list" ref={this.canvasDom} />
				</div>
				<div className={`right-button ${this.state.expanded ? "inactive" : ""}`} onClick={()=>this.hud.slideRight()}></div>
				<div className="expand-button" onClick={this.toggleExpansion}></div>
			</div>
		);
	}
}

export default ItemSelector;