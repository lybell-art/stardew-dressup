import {LanguageSelector} from "./LanguageSelector.jsx";
import {HowToButton} from "./HowToButton.jsx";
import {FileImportHub} from "./FileImportHub.jsx";

export default function PCBanner()
{
	return <div className="pc-banner">
		<LanguageSelector />
		<HowToButton />
		<FileImportHub />
	</div>
}