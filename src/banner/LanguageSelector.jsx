import { useState, useContext } from "react";
import Langs, { LangsContext } from "../stores/Langs.js";
import { observer } from "mobx-react-lite";

const LanguageList = observer( ({isOpened})=>
{
	const langs = useContext(LangsContext);
	const allLangs = Langs.getAllLanguageList();

	return (
		<div className={`language-list ${!isOpened ? "hidden" : ""}`}>
			{ allLangs.map(langCode => <p key={langCode} onClick={()=>{
				langs.changeLanguage(langCode);
			}}>
				{langs.getText(`UI.language.${langCode}`)}
			</p>) }
		</div>
	);
} );

function LanguageSelector()
{
	const [isOpened, open] = useState(false);

	return (
		<div className="language-wrapper">
			<div className="ui-icon language-button hover-interact" onClick={()=>open(prev=>!prev)}></div>
			<LanguageList isOpened={isOpened}/>
		</div>
	);
}

export default LanguageSelector;