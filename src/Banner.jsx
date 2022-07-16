import {LangsProvider} from "./stores/Langs.js";
import LanguageSelector from "./banner/LanguageSelector.jsx";
import HowToButton from "./banner/HowToButton.jsx";

function Banner()
{
	return (
		<LangsProvider>
			<LanguageSelector />
			<HowToButton />
		</LangsProvider>
	);
}

export default Banner;