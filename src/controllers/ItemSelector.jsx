import { Component, createRef } from "react";
import ItemListController from "./clothListControllerPixi.js";
import debounce from "lodash.debounce";
import { ThresholdObserver } from "../utils/utils.js";

const APP_DOM = document.getElementById("app");
const MOBILE_SCREEN = 768;
const TABLET_SCREEN = 1366;

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

		this.resizeObserver = new ThresholdObserver([MOBILE_SCREEN, TABLET_SCREEN], document.body.clientWidth);

		this.toggleExpansion = this.toggleExpansion.bind(this);
		this.screenResize = debounce(this.screenResize.bind(this), 100);
		this.mobileScrollToggle = debounce(this.mobileScrollToggle.bind(this), 100);
		this.canvasScroll = e=>{
			e.preventDefault();
			let delta = Math.sign(getScrollDelta(e));
			this.hud.onWheel(delta);
		}
	}
	
	mobileScrollToggle(e)
	{
		if(document.body.clientWidth >= MOBILE_SCREEN) return;
		const {scrollTop} = e.target;
		this.setState((state) => {
			if (scrollTop < 1) return {expanded: false};
			return {expanded: true};
		})
	}
	screenResize()
	{
		this.resizeObserver.update(document.body.clientWidth, ()=>{
			APP_DOM.scrollTop = 0;
			this.setState({expanded: false});
		});
	}
	componentDidMount() {
		if(this.canvasDom.current){
			this.hud.appendParent(this.canvasDom.current);
			this.hud.initialize(this.props.dataSet);
			this.canvasDom.current.addEventListener('wheel', this.canvasScroll, {passive:false});
		}
		window.addEventListener('resize', this.screenResize);
		APP_DOM.addEventListener('scroll', this.mobileScrollToggle);
	}
	componentWillUnmount() {
		if(this.canvasDom.current){
			this.hud.halt();
			this.canvasDom.current.removeEventListener('wheel', this.canvasScroll, {passive:false});
		}
		window.removeEventListener('resize', this.screenResize);
		APP_DOM.removeEventListener('scroll', this.mobileScrollToggle);
	}
	toggleExpansion()
	{
		this.setState((state) => {
			return {expanded: !state.expanded};
		});
	}
	componentDidUpdate() {
		setTimeout(()=>this.hud.toggleExpantion(this.state.expanded), 310);
	}
	render()
	{
		return (
			<div className="selector">
				<div className={`left-button ${this.state.expanded ? "inactive" : ""}`} onClick={()=>this.hud.slideLeft()}></div>
				<div className="selector-border">
					<div className={`hidden ${this.state.expanded ? "expanded" : ""}`} style={{"display":"none"}} />
					<div className="selector-canvas" ref={this.canvasDom} />
				</div>
				<div className={`right-button ${this.state.expanded ? "inactive" : ""}`} onClick={()=>this.hud.slideRight()}></div>
				<div className="expand-button" onClick={this.toggleExpansion}></div>
			</div>
		);
	}
}

export default ItemSelector;