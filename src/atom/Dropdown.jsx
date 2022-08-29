import { useState, useEffect, useRef } from "react";
import {hasParentElement} from "../utils/utils.js";

/** @api
 *
 * button:(String / React.Component) String or tags for the toggle button
 * children:(Array[React.Component]) List of tags to be included in the modal/dropdown
 * 
 * buttonClass:(String) Button's class(style)
 * listClass:(String) Modal's class(style)
 * wrapperClass:(String) dropdown container's class(style)
 * 
 * closeOutside:(Boolean) Whether the modal should be closed when you click the area outside when it is open.
 * hasModalBG:(Boolean) Whether the black semi-transparent background is displayed when the modal is open.
 *
 */

function Dropdown( {
	button=null, 
	children, 
	buttonClass="", 
	listClass="dropdown-list", 
	wrapperClass="", 
	type="dropdown",
	closeOutside=true, 
	hasModalBG,
	hasCloseButton
} )
{
	// set default value
	if(type === "modal")
	{
		hasModalBG = hasModalBG ?? true;
		hasCloseButton = hasCloseButton ?? true;
	}
	else
	{
		hasModalBG = hasModalBG ?? false;
		hasCloseButton = hasCloseButton ?? false;
	}


	let [isOpened, open] = useState(false);
	let wrapperRef = useRef(null);
	
	useEffect( ()=>{
		if(!closeOutside) return;

		const clickFunc = function(e){
			if( !( hasParentElement( e.target, wrapperRef.current ) ) ){
				open(false);
			}
		};
		if(!isOpened) return;
		document.addEventListener('click', clickFunc);
		return ()=>{
			document.removeEventListener('click', clickFunc);
		}
	}, [isOpened]);

	const shown = isOpened ? "active" : "";
	const hidden = isOpened ? "" : "inactive";
	return <div className={`dropdown-wrapper ${wrapperClass}`} ref={wrapperRef}>
		<div className={`${buttonClass} hover-interact`} onClick={()=>open(p=>!p)}>
			{button}
		</div>
		{hasModalBG && <div className={`modal-bg ${shown}`} onClick={()=>open(false)}></div>}
		<div className={`${listClass} ${hidden}`}>
			{hasCloseButton && <div className="ui-icon close-button modal-close hover-interact" onClick={()=>open(false)}></div>}
			{children}
		</div>
	</div>
}

export default Dropdown;