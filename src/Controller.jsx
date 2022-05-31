import React from "react";
import {HatsController, HairstyleController, ClothesController} from "./controllers/ClothesController.jsx";
import clothStoreDict from "./stores/clothStoreDict.js";
import {HatsLogic, HairstyleLogic, ShirtsLogic, PantsLogic} from "./controllers/ClothLogics.js";

const { hats, hairstyle, shirts, pants } = clothStoreDict;

const Controller = ()=>{
	return (
	<div className="controller">
		<h2>This is Controller!</h2>
		<HatsController name="hats" selection={hats} logic={HatsLogic}/>
		<HairstyleController name="hairstyle" selection={hairstyle} logic={HairstyleLogic}/>
		<ClothesController name="shirts" selection={shirts} logic={ShirtsLogic}/>
		<ClothesController name="pants" selection={pants} logic={PantsLogic}/>
	</div>
	)
}

export default Controller;