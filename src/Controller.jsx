import {HatsController, HairstyleController, ClothesController} from "./controllers/ClothesController.jsx";

const Controller = ()=>{
	return (
	<div className="controller">
		<h2>This is Controller!</h2>
		<HatsController />
		<HairstyleController />
		<ClothesController name="shirts" />
		<ClothesController name="pants" />
	</div>
	)
}

export default Controller;