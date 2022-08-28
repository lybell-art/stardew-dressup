import { useState } from "react";

import { Text, TextElement } from "../atom/Text.jsx";
import { clamp } from "../utils/utils.js";
import Dropdown from "../atom/Dropdown.jsx";
import BannerButton from "./BannerButton.jsx";

function HowToScene()
{
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
		<h2><Text text={`howto.title.${pageNo}`} /></h2>
		<p><TextElement text={`howto.desc.${pageNo}`} /></p>
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
		buttonClass="banner-button" 
		button={<BannerButton type="help" />}
		listClass="modal"
		type="modal"
	>
		<HowToScene />
	</Dropdown>
}

export {HowToScene, HowToButton};