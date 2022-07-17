import {useState} from "react";

import { Text } from "../atom/Text.jsx";
import HamburgerButton from "../atom/HamburgerButton.jsx";

import { LanguageList } from "./LanguageSelector.jsx";
import { HowToScene } from "./HowToButton.jsx";
import { FileImportHubModal } from "./FileImportHub.jsx";
import { ResetAllButton } from "../controllers/FileImporter/ResetImport.jsx";

function MobileBanner()
{
	let [openedModal, openModal] = useState("none");
	let [isOpenedLanguage, openLanguage] = useState(false);

	const menuStyle = openedModal === "menu" ? "" : "inactive";
	const howtoModalStyle = openedModal === "howto" ? "" : "inactive";
	const importModalStyle = openedModal === "import" ? "" : "inactive";
	const modalBGStyle = (openedModal === "howto" || openedModal === "import") ? "" : "inactive";
	const languageListStyle = isOpenedLanguage ? "" : "inactive";

	function toggleMenu()
	{
		openModal(prev=>{
			if(prev === "none") return "menu";
			else return "none";
		});
	}

	return <div className="mobile-banner">
		<HamburgerButton className="mobile-menu-button hover-interact" isActivated={openedModal === "menu"} onClick={toggleMenu} />

		<div className={`modal-bg mobile-menu-modal-bg ${menuStyle}`} onClick={()=>openModal("none")}></div>
		<div className={`mobile-menu-list ${menuStyle}`}>
			<h2 className="hover-interact" onClick={()=>openLanguage(e=>!e)}>
				<span className="ui-icon language-button inline"></span>
				&nbsp;
				<Text text="UI.aside.language" />
			</h2>
			<div className={`dropdown-list language-list ${languageListStyle}`}>
				<LanguageList/>
			</div>
			<h2 className="hover-interact" onClick={()=>openModal("howto")}>
				<span className="ui-icon help-button inline"></span>
				&nbsp;
				<Text text="UI.aside.help" />
			</h2>
			<h2 className="hover-interact" onClick={()=>openModal("import")}>
				<span className="ui-icon import-button inline"></span>
				&nbsp;
				<Text text="UI.aside.import" />
			</h2>
		</div>

		<div className={`modal-bg ${modalBGStyle}`} onClick={()=>openModal("none")}></div>
		<div className={`modal ${howtoModalStyle}`}>
			<div className="ui-icon close-button modal-close hover-interact" onClick={()=>openModal("none")}></div>
			<HowToScene />
		</div>
		<div className={`modal scrolling-modal ${importModalStyle}`}>
			<div className="ui-icon close-button modal-close hover-interact" onClick={()=>openModal("none")}></div>
			<FileImportHubModal />
			<ResetAllButton />
		</div>
	</div>
}

export default MobileBanner;