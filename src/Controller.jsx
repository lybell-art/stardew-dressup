import React from "react";
import {HatsController, HairstyleController, ClothesController} from "./controllers/ClothesController.jsx";
import clothStoreDict from "./stores/clothStoreDict.js";
import spriteSheetFileData from "./stores/SpriteSheetFileData.js";

const { hats, hairstyle, shirts, pants } = clothStoreDict;

const Controller = ()=>{
	return (
	<div className="controller">
		<h2>This is Controller!</h2>
		<HatsController name="hats" selection={hats} dataSet={spriteSheetFileData.hats}/>
		<HairstyleController name="hairstyle" selection={hairstyle} dataSet={spriteSheetFileData.hairstyle}/>
		<ClothesController name="shirts" selection={shirts} dataSet={spriteSheetFileData.shirts}/>
		<ClothesController name="pants" selection={pants} dataSet={spriteSheetFileData.pants}/>
	</div>
	)
}

export default Controller;