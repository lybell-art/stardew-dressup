import { useContext } from "react";
import { Text } from "../../atom/Text.jsx";

import characterStore from "../../stores/CharacterStore.js";

const getProps = characterStore.getProps.bind(characterStore);

function ResetImportIcon({store})
{
	return <div className="ui-icon reset-icon hover-interact" onClick={()=>store.resetData()}></div>
}

function getResetFunc(name)
{
	if(name === "skin") {
		const {dataSet} = getProps("body");
		return dataSet.resetSkin.bind(dataSet);
	}
	if(name === "body") {
		const {dataSet} = getProps("body");
		return dataSet.resetBody.bind(dataSet);
	}
	const {dataSet} = getProps(name);
	return dataSet.resetData.bind(dataSet);
}


function ResetImportButton({name})
{
	const resetFunc = getResetFunc(name);
	return <div className="reset-button hover-interact" onClick={resetFunc}>
		<span className="ui-icon reset-icon-white inline"></span>
		<Text text="UI.import.reset" />
	</div>
}

function ResetAllButton()
{
	return <div className="reset-button hover-interact" onClick={()=>characterStore.resetAll()}>
		<span className="ui-icon reset-icon-white inline"></span>
		<Text text="UI.import.resetAll" />
	</div>
}

export {ResetImportIcon, ResetImportButton, ResetAllButton};