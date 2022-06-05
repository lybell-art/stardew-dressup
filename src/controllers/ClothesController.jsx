import { useContext } from "react";
import { observer } from "mobx-react-lite";

// stores
import clothStoreDict from "../stores/clothStoreDict.js";
import spriteSheetFileData from "../stores/SpriteSheetFileData.js";
import { LangsContext } from "../stores/Langs.js";

// sub-containers
import ItemSelector from "./ItemSelector.jsx";
import ColorSlider from "./ColorSlider.jsx";
import ObtainDescription from "./ObtainDescription.jsx";

const { hats, hairstyle, shirts, pants } = clothStoreDict;

// extract selection mobx box, dataset mobx box, default image url from name
function getProps(name)
{
	return {
		selection : clothStoreDict[name],
		dataSet : spriteSheetFileData[name],
		defaultImage : `assets/${name}.png`
	}
}

// title 
const ControllerTitle = observer( ({name})=>{
	const langs = useContext(LangsContext);

	return (
		<div className="itemHeader">
			<h2>{langs.getText(`title.${name}`)}</h2>
		</div>
	);
} );


const ClothesControllerBase = ({name, additionalDefaultImage={}, children})=>{
	const {selection, dataSet, defaultImage} = getProps(name);

	return (
	<div className={`clothesController clothesController-${name}`}>
		<ControllerTitle name={name} />
		<div className="itemMain">
			<ItemSelector name={name} 
				selection={selection}
				dataSet={dataSet}
				defaultImage={defaultImage}
				additionalDefaultImage={additionalDefaultImage}
			/>
			{children}
		</div>
	</div>
	)
};



const HatsController = ()=>{
	const name = "hats";
	const {selection} = getProps(name);

	return (
	<ClothesControllerBase name={name}>
		<ObtainDescription type={name} selection={selection} />
	</ClothesControllerBase>
	)
};

const HairstyleController = ()=>{
	const name = "hairstyle";
	const {selection} = getProps(name);

	return (
	<ClothesControllerBase name={name} additionalDefaultImage={ {hairstyles2:"assets/hairstyles2.png"} }>
		<ColorSlider type={name} selection={selection} />
	</ClothesControllerBase>
	)
};

const ClothesController = ({name})=>{
	const {selection} = getProps(name);

	return (
	<ClothesControllerBase name={name}>
		<ObtainDescription type={name} selection={selection} />
		<ColorSlider type={name} selection={selection} />
	</ClothesControllerBase>
	)
};

export {HatsController, HairstyleController, ClothesController};