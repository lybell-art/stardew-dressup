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

// extract selection mobx box, dataset mobx box, default image url from name
const getProps = characterStore.getProps.bind(characterStore);

// title 
const ControllerTitle = observer( ({name})=>{
	const langs = useContext(LangsContext);
	return <h2>{langs.getText(`title.${name}`)}</h2>;
} );


const ClothesControllerBase = ({name, additionalDefaultImage={}, children})=>{
	const {selection, dataSet, defaultImage} = getProps(name);
	const swiper = useSwiper();

	return (
	<div className={`controller-item controller-item-${name}`}>
		<div className="controller-header">
			<ControllerTitle name={name} />
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

	return (
	<ClothesControllerBase name={name}>
		<ColorSlider type={name} selection={selection} />
	</ClothesControllerBase>
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
		<ColorSlider type={name} selection={selection} />
		<ObtainDescription type={name} selection={selection} />
	</ClothesControllerBase>
	)
};

export {BodyController, HatsController, HairstyleController, ClothesController};