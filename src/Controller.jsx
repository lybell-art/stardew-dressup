import {HatsController, HairstyleController, ClothesController} from "./controllers/ClothesController.jsx";

const Controller = ()=>{
	return (
	<div className="controller">
		<HatsController />
		<HairstyleController />
		<ClothesController name="shirts" />
		<ClothesController name="pants" />
	</div>
	)
}

export default Controller;