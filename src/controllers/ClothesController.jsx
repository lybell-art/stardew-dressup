import { useContext } from "react";
import { observer } from "mobx-react-lite";
import { useSwiper } from "swiper/react";

// stores
import characterStore from "../stores/CharacterStore.js";
import { LangsContext } from "../stores/Langs.js";

// sub-containers
import ItemSelector from "./ItemSelector.jsx";
import ColorSlider from "./ColorSlider.jsx";
import ObtainDescription from "./ObtainDescription.jsx";

// file-importers
import TextureImporter from "./FileImporter/TextureImporter.jsx";
import BodyImporter from "./FileImporter/BodyImporter.jsx";

// extract selection mobx box, dataset mobx box, default image url from name
const getProps = characterStore.getProps.bind(characterStore);

// title 
const ControllerTitle = observer( ({name})=>{
	const langs = useContext(LangsContext);
	return <h2><span className={`ui-icon ${name}-icon inline`}></span>{langs.getText(`title.${name}`)}</h2>;
} );


const ClothesControllerBase = ({name, additionalDefaultImage={}, importers, children})=>{
	const {selection, dataSet, defaultImage} = getProps(name);
	const swiper = useSwiper();

	return (
	<div className={`controller-item controller-item-${name}`}>
		<div className="controller-header">
			<ControllerTitle name={name} />
			<div className="file-importer-wrapper">
				{importers}
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
	const {selection, dataSet} = getProps(name);

	function adjustIndex({count})
	{
		selection.adjustSelect(count);
	}

	return (
	<ClothesControllerBase name={name}
		importers={<>
			<BodyImporter store={dataSet} />
			<TextureImporter store={dataSet} callback={adjustIndex}
				handler={ (retex)=>{dataSet.setSkinColor(retex)} } 
				text="UI.import.skin"/>
		</>}
	>
		<ColorSlider type={name} selection={selection} />
	</ClothesControllerBase>
	)
};

const HatsController = ()=>{
	const name = "hats";
	const {selection, dataSet} = getProps(name);

	return (
	<ClothesControllerBase name={name}
		importers={<TextureImporter store={dataSet} />}
	>
		<ObtainDescription type={name} selection={selection} />
	</ClothesControllerBase>
	)
};

const HairstyleController = ()=>{
	const name = "hairstyle";
	const {selection, dataSet} = getProps(name);

	function adjustIndex({count})
	{
		selection.adjustSelect(count);
	}

	return (
	<ClothesControllerBase name={name} additionalDefaultImage={ {hairstyles2:"assets/hairstyles2.png"} }
		importers={<>
			<TextureImporter store={dataSet} callback={adjustIndex} />
			<TextureImporter store={dataSet} callback={adjustIndex}
				handler={ (retex)=>{dataSet.setAdditionalSheet({hairstyles2: retex.blobURL})} } 
				text="UI.import.additionalTexture"/>
		</>}
	>
		<ColorSlider type={name} selection={selection} />
	</ClothesControllerBase>
	)
};

const ClothesController = ({name})=>{
	const {selection, dataSet} = getProps(name);

	return (
	<ClothesControllerBase name={name}
		importers={<TextureImporter store={dataSet} />}
	>
		<ColorSlider type={name} selection={selection} />
		<ObtainDescription type={name} selection={selection} />
	</ClothesControllerBase>
	)
};

export {ControllerTitle, BodyController, HatsController, HairstyleController, ClothesController};