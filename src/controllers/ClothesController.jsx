import { useSwiper } from "swiper/react";

// text
import { Text } from "../atom/Text.jsx";

// stores
import characterStore from "../stores/CharacterStore.js";
import { LangsContext } from "../stores/Langs.js";

// sub-containers
import ItemSelector from "./ItemSelector.jsx";
import ColorSlider from "./ColorSlider.jsx";
import ObtainDescription from "./ObtainDescription.jsx";

// file-importers
import {SkinImporter, HairstyleTextureImporter, ClothesTextureImporter} from "./FileImporter/FileImporters.jsx";
import {ResetImportIcon} from "./FileImporter/ResetImport.jsx";
import BodyImporter from "./FileImporter/BodyImporter.jsx";

// extract selection mobx box, dataset mobx box, default image url from name
const getProps = characterStore.getProps.bind(characterStore);

// title 
function ControllerTitle({name})
{
	return <h2>
		<span className={`ui-icon ${name}-icon inline`}></span>
		<span> </span>
		<Text text={`title.${name}`} />
	</h2>
}

const ClothesControllerBase = ({name, additionalDefaultImage={}, importers, children})=>{
	const {selection, dataSet, defaultImage} = getProps(name);
	const swiper = useSwiper();

	return (
	<div className={`controller-item controller-item-${name}`}>
		<div className="controller-header">
			<ControllerTitle name={name} />
			<div className="file-importer-wrapper">
				{importers}
				<ResetImportIcon store={dataSet} />
			</div>
		</div>
		<ItemSelector name={name} 
			selection={selection}
			dataSet={dataSet}
			defaultImage={defaultImage}
			additionalDefaultImage={additionalDefaultImage}
			swiper={swiper}
			hudType={name === "body" ? "skinColor" : "itemList"}
		/>
		<div className="controller-sub">{children}</div>
	</div>
	)
};


const BodyController = ()=>{
	const name = "body";
	const {selection} = getProps(name);

	function adjustIndex({count})
	{
		selection.adjustSelect(count);
	}

	return (
	<ClothesControllerBase name={name}
		importers={<>
			<BodyImporter />
			<SkinImporter />
		</>}
	>
		<ColorSlider type={name} selection={selection} />
	</ClothesControllerBase>
	)
};

const HatsController = ()=>{
	const name = "hats";
	const {selection} = getProps(name);

	return (
	<ClothesControllerBase name={name} importers={<ClothesTextureImporter name={name}/>}>
		<ObtainDescription type={name} selection={selection} />
	</ClothesControllerBase>
	)
};

const HairstyleController = ()=>{
	const name = "hairstyle";
	const {selection} = getProps(name);

	return (
	<ClothesControllerBase 
		name={name} 
		additionalDefaultImage={ {hairstyles2:"assets/hairstyles2.png"} }
		importers={ <HairstyleTextureImporter /> }
	>
		<ColorSlider type={name} selection={selection} />
	</ClothesControllerBase>
	)
};

const ClothesController = ({name})=>{
	const {selection} = getProps(name);

	return (
	<ClothesControllerBase name={name} importers={<ClothesTextureImporter name={name}/>}>
		<ColorSlider type={name} selection={selection} />
		<ObtainDescription type={name} selection={selection} />
	</ClothesControllerBase>
	)
};

export {ControllerTitle, BodyController, HatsController, HairstyleController, ClothesController};