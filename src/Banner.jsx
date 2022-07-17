import {LangsProvider} from "./stores/Langs.js";
import PCBanner from "./banner/PCBanner.jsx";
import MobileBanner from "./banner/MobileBanner.jsx";

function Banner()
{
	return (
		<LangsProvider>
			<PCBanner />
			<MobileBanner />
		</LangsProvider>
	);
}

export default Banner;