import {useState} from "react";

function GenderSelector({characterStore})
{
	let [gender, setGender] = useState(characterStore.isMale);

	function selectGender(isMale)
	{
		characterStore.setGender(isMale ? "male" : "female");
		setGender(isMale);
	}

	return <div className="gender-select-wrapper">
		<div className={`ui-icon male-button hover-interact ${gender ? "selected" : ""}`} onClick={()=>selectGender(true)} ></div>
		<div className={`ui-icon female-button hover-interact ${!gender ? "selected" : ""}`} onClick={()=>selectGender(false)} ></div>
	</div>
}

export default GenderSelector;