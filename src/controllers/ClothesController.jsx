import React from "react";
import { observer } from "mobx-react-lite";

import { LangsContext } from "../stores/Langs.js";
import ItemSelector from "./ItemSelector.jsx";
//import ColorSlider from "./ColorSlider.jsx";
import ObtainDescription from "./ObtainDescription.jsx";

const ClothesControllerBase = ({name, selection, dataSet, children})=>{
	const langs = React.useContext(LangsContext);

	return (
	<div className="clothesController">
		<div className="itemHeader">
			<h2>{langs.getText(`title.${name}`)}</h2>
		</div>
		<div className="itemMain">
			<ItemSelector name={name} dataSet={dataSet} handleTo={(i)=>{selection.changeSelect(i)}} />
			{children}
		</div>
	</div>
	)
};

const HatsController = observer( ({name, selection, dataSet})=>{
	return (
	<ClothesControllerBase name={name} selection={selection} dataSet={dataSet}>
		<ObtainDescription type={name} selection={selection} />
	</ClothesControllerBase>
	)
} );

const HairstyleController = observer( ({name, selection, dataSet})=>{
	return (
	<ClothesControllerBase name={name} selection={selection} dataSet={dataSet}>
		<p></p>
	</ClothesControllerBase>
	)
} );

const ClothesController = observer( ({name, selection, dataSet})=>{
	return (
	<ClothesControllerBase name={name} selection={selection} dataSet={dataSet}>
		<ObtainDescription type={name} selection={selection} />
	</ClothesControllerBase>
	)
} );

export {HatsController, HairstyleController, ClothesController};