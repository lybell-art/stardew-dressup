import { observer } from "mobx-react-lite";

const _Viewer = ( { selection } )=>{
	const { hats, hairstyle, shirts, pants } = selection;
	return (
	<div className="viewer">
		<div className="viewer-wrapper">
			<h2>This is Viewer!</h2>
			<p>Hats : {hats.value}</p>
			<p>Hairstyle : {hairstyle.value}</p>
			<p>Shirts : {shirts.value}</p>
			<p>Pants : {pants.value}</p>
		</div>
	</div>
	)
}

const Viewer = observer(_Viewer);
export default Viewer;