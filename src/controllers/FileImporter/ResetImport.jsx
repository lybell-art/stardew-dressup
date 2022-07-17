import { useContext } from "react";
import { observer } from "mobx-react-lite";
import { LangsContext } from "../../stores/Langs.js";

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

const ResetImportButton = observer( ({name})=>
{
	const langs = useContext(LangsContext);

	const resetFunc = getResetFunc(name);
	return <div className="reset-button hover-interact" onClick={resetFunc}>
		<span className="ui-icon reset-icon-white inline"></span>
		{langs.getText("UI.import.reset")}
	</div>
} );

const ResetAllButton = observer( ()=>
{
	const langs = useContext(LangsContext);

	return <div className="reset-button hover-interact" onClick={()=>characterStore.resetAll()}>
		<span className="ui-icon reset-icon-white inline"></span>
		{langs.getText("UI.import.resetAll")}
	</div>
} );

export {ResetImportIcon, ResetImportButton, ResetAllButton};