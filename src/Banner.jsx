import {LangsProvider} from "./stores/Langs.js";
import LanguageSelector from "./banner/LanguageSelector.jsx";
import HowToButton from "./banner/HowToButton.jsx";
import FileImportHub from "./banner/FileImportHub.jsx";

function Banner()
{
	return (
		<LangsProvider>
			<LanguageSelector />
			<HowToButton />
			<FileImportHub />
		</LangsProvider>
	);
}

export default Banner;