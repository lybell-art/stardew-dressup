import { useContext } from "react";
import { observer } from "mobx-react-lite";

import Langs, { LangsContext } from "../stores/Langs.js";
import Dropdown from "../atom/Dropdown.jsx";
import BannerButton from "./BannerButton.jsx";


const LanguageList = observer( ()=>
{
	const langs = useContext(LangsContext);
	const allLangs = Langs.getAllLanguageList();

	function makeLangSelector(langCode)
	{
		const style = langCode === langs.currentLanguage ? "bold" : "";
		return <p className={style} key={langCode} onClick={ ()=>langs.changeLanguage(langCode) }>
			{langs.getText(`UI.language.${langCode}`)}
		</p>
	}

	return <>
		{allLangs.map(makeLangSelector)}
	</>;
} );

function LanguageSelector()
{
	return <Dropdown 
		wrapperClass="language-wrapper dropdown-wrapper-center"
		buttonClass="banner-button" 
		button={<BannerButton type="language" />}
		listClass="dropdown-list language-list"
		type="dropdown"
	>
		<LanguageList/>
	</Dropdown>
}

export {LanguageSelector, LanguageList};