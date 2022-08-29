import debounce from "lodash.debounce";
import {ThresholdObserver} from "../utils/ThresholdObserver.js";

class ResizeEventEmitter extends EventTarget
{
	constructor(breakPoint, offset=0)
	{
		super();
		this.breakPoint = Array.isArray(breakPoint) ? [...breakPoint] : [breakPoint];
		this.resizeObserver = new ThresholdObserver(breakPoint, document.body.clientWidth, offset);
		this.update = debounce(this.update.bind(this), 100);
	}
	run()
	{
		window.addEventListener('resize', this.update);
	}
	destroy()
	{
		window.removeEventListener('resize', this.update);
	}
	update()
	{
		this.resizeObserver.update(document.body.clientWidth, (e)=>{
			const [breakPoint, inOut] = [ this.breakPoint[e >> 1], !!(e & 1)]
			this.dispatchEvent( new CustomEvent("change", {detail:{breakPoint}} ) );
			this.dispatchEvent( new CustomEvent(inOut ? "changeOver" : "changeBelow", {detail:{breakPoint}} ) );
		});
	}
}

const resizeEventEmitter = new ResizeEventEmitter([768, 1366]);

export default resizeEventEmitter;