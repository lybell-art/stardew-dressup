import {LangsProvider} from "./stores/Langs.js";
import LanguageSelector from "./banner/LanguageSelector.jsx";

function Banner()
{
	return (
		<LangsProvider>
			<LanguageSelector />
		</LangsProvider>
	);
}

export default Banner;