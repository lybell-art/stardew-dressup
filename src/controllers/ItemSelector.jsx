import { Component, createRef } from "react";
import debounce from "lodash.debounce";
import { ItemListController, SkinColorController } from "./clothListControllerPixi.js";
import { ThresholdObserver } from "../utils/ThresholdObserver.js";

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

		// props
		const {selection, dataSet, defaultImage, additionalDefaultImage={}, hudType="itemList"} = props;
		this.swiper = props.swiper;

		// make item list controller pixi.js canvas
		this.hud = this.makeHud(hudType, {selection, dataSet, defaultImage, additionalDefaultImage});

		// for attach canvas
		this.canvasDom = createRef();

		// for expanding 
		this.state = {
			expanded : false
		};

		// for responsive app(reset expand state when viewport is changed)
		this.resizeObserver = new ThresholdObserver([MOBILE_SCREEN, TABLET_SCREEN], document.body.clientWidth);

		// event listeners
		this.toggleExpansion = this.toggleExpansion.bind(this);
		this.screenResize = debounce(this.screenResize.bind(this), 100);
		this.mobileScrollToggle = debounce(this.mobileScrollToggle.bind(this), 100);
		this.canvasScroll = e=>{
			e.preventDefault();
			let delta = Math.sign(getScrollDelta(e));
			this.hud.onWheel(delta);
			e.stopPropagation();
		}
	}
	makeSkinHud({selection, dataSet})
	{
		const hud = new SkinColorController(selection);
		hud.initializeRadio(0);
		hud.initializeSprites(dataSet.skinColor);
		return hud;
	}
	makeItemHud({selection, dataSet, defaultImage, additionalDefaultImage})
	{
		const hud = new ItemListController(selection, {defaultImage, additionalDefaultImage});
		hud.initializeRadio(dataSet.constructor.omittable ? -1 : 0);
		hud.initializeSprites(dataSet, defaultImage, additionalDefaultImage);
		return hud;
	}
	makeHud(type, stores)
	{
		if(type === "skinColor") return this.makeSkinHud(stores);
		return this.makeItemHud(stores);
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
		setTimeout(()=>{
			this.hud.toggleExpantion(this.state.expanded);
			this.swiper.update();
		}, 350);
	}
	render()
	{
		const inactiveTag = this.state.expanded ? "inactive" : "";
		return (
			<div className="selector">
				<div 
					className={`ui-icon left-button hover-interact ${inactiveTag}`} 
					onClick={()=>this.hud.slideLeft()}>
				</div>
				<div className="selector-border">
					<div className={`hidden ${this.state.expanded ? "expanded" : ""}`} style={{"display":"none"}} />
					<div className="selector-canvas" ref={this.canvasDom} />
				</div>
				<div 
					className={`ui-icon right-button hover-interact ${inactiveTag}`} 
					onClick={()=>this.hud.slideRight()}>
				</div>
				<div className="ui-icon expand-button" onClick={this.toggleExpansion}></div>
			</div>
		);
	}
}

export default ItemSelector;