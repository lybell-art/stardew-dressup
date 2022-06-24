import {createRoot} from "react-dom/client";
import { setReaders } from "@xnb-js/core";
import { LightweightTexture2DReader as Texture2DReader } from "@xnb-js/readers";

import Langs, {LangsProvider} from "./stores/Langs.js";
import Viewer from "./Viewer.jsx";
import Controller from "./Controller.jsx";
import {HatsController, HairstyleController, ClothesController} from "./controllers/ClothesController.jsx";

function App()
{
	return (
		<LangsProvider>
			<Viewer />
			<Controller ids={["hats", "hairstyle", "shirts", "pants"]}>
				<HatsController/>
				<HairstyleController />
				<ClothesController name="shirts" />
				<ClothesController name="pants" />
			</Controller>
		</LangsProvider>
	);
}


export default function render()
{
	setReaders({Texture2DReader});

	console.log("pixi!");
	const container = document.getElementById("app");
	const root = createRoot(container);
	root.render(<App />);
}

