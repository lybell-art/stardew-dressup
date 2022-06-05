import { Component, createRef } from "react";
import ItemListController from "./clothListControllerPixi.js";

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
	}
	componentDidMount() {
		if(this.canvasDom.current){
			this.hud.appendParent(this.canvasDom.current);
			this.hud.initialize(this.props.dataSet);
		}
	}
	componentWillUnmount() {
		if(this.canvasDom.current){
			this.hud.halt();
		}
	}
	toggleExpansion()
	{
		this.setState((state) => {
			return {expanded: !state.expanded};
		});
	}
	componentDidUpdate() {
		this.hud.toggleExpantion(this.state.expaned);
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