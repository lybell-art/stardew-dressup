import { useState, useContext } from "react";
import { observer } from "mobx-react-lite";

import { LangsContext } from "../stores/Langs.js";
import { clamp } from "../utils/utils.js";
import Dropdown from "../atom/Dropdown.jsx";

function HowToScene()
{
	let lang = useContext(LangsContext);
	const [START, END] = [1, 7];

	let [pageNo, setPage] = useState(1);

	function before()
	{
		setPage(pageNo=>clamp(pageNo-1, START, END));
	}
	function after()
	{
		setPage(pageNo=>clamp(pageNo+1, START, END));
	}

	const leftStyle = pageNo === START ? "gray" : "hover-interact";
	const rightStyle = pageNo === END ? "gray" : "hover-interact";

	return <>
		<h2>{lang.getText(`howto.title.${pageNo}`)}</h2>
		<p>{lang.getTextHTML(`howto.desc.${pageNo}`)}</p>
		<div className="howto-nav">
			<div className={`ui-icon left-button ${leftStyle}`} onClick={before}></div>
			<div className={`ui-icon right-button ${rightStyle}`} onClick={after}></div>
		</div>
	</>
}


function HowToButton()
{
	return <Dropdown 
		wrapperClass="howto-wrapper"
		buttonClass="ui-icon help-button" 
		listClass="howto-modal"
		type="modal"
	>
		<HowToScene />
	</Dropdown>
}

export default HowToButton;