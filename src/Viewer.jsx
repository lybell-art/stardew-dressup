import {useEffect, useState, useRef} from "react";

import ViewerCanvas from "./viewer/ViewerCanvas.jsx";
import characterStore from "./stores/CharacterStore.js";
import GenderSelector from "./viewer/GenderSelector.jsx";

function ViewerWrapper()
{
	const [shrinked, setShrinked] = useState(false);
	const io = useRef(null);
	const observeTargetRef = useRef(null);
	const observerRef = useRef(null);

	useEffect( ()=>{
		function callBack(entries) {
			const {isIntersecting} = entries[entries.length-1];
			if(isIntersecting) setShrinked(false);
			else setShrinked(true);
		}

		if(io.current === null) {
			io.current = new IntersectionObserver(callBack, {root:observeTargetRef.current});
			io.current.observe(observerRef.current);
		}

		return ()=>{
			if(io.current === null) return;
			io.current.unobserve(observerRef.current);
		}
	}, []);

	return (
		<div className="viewer-wrapper" ref={observeTargetRef}>
			<div className={`viewer-box ${shrinked ? "shrinked" : ""}`}>
				<ViewerCanvas characterStore={characterStore} />
				<div className="ui-icon left-turn-button hover-interact" onClick={()=>characterStore.turnLeft()} ></div>
				<div className="ui-icon right-turn-button hover-interact" onClick={()=>characterStore.turnRight()} ></div>
				<div className="ui-icon shuffle-button hover-interact" onClick={()=>characterStore.randomize()} ></div>
			</div>
			{!shrinked && <GenderSelector characterStore={characterStore} />}
			<div className="viewer-observer" ref={observerRef}/>
		</div>
	);
}

function Viewer()
{
	return <div className="viewer"><ViewerWrapper /></div>
}
export default Viewer;