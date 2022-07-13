import {createRoot} from "react-dom/client";
import { setReaders } from "@xnb-js/core";
import { LightweightTexture2DReader as Texture2DReader } from "@xnb-js/readers";

import {LangsProvider} from "./stores/Langs.js";
import Viewer from "./Viewer.jsx";
import Controller from "./Controller.jsx";
import Banner from "./Banner.jsx";
import {BodyController, HatsController, HairstyleController, ClothesController} from "./controllers/ClothesController.jsx";

function App()
{
	return (
		<LangsProvider>
			<Viewer />
			<Controller ids={["body", "hats", "hairstyle", "shirts", "pants"]}>
				<BodyController/>
				<HatsController/>
				<HairstyleController />
				<ClothesController name="shirts" />
				<ClothesController name="pants" />
			</Controller>
		</LangsProvider>
	);
}


function renderComponent(component, containerID)
{
	const container = document.getElementById(containerID);
	const root = createRoot(container);
	root.render(component);
}

export default function render()
{
	setReaders({Texture2DReader});

	renderComponent(<App />, "app");
	renderComponent(<Banner />, "banner");
}

