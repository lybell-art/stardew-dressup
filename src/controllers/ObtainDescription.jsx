import React from "react";
import { LangsContext } from "../stores/Langs.js";
import { observer } from "mobx-react-lite";

function ObtainDescription({type, selection})
{
	const langs = React.useContext(LangsContext);
	function getI18nDesc(index) {
		return langs.getText(`${type}.desc.${index}`);
	}

	return (
	<div className="desc">
		<p>How To Obtain</p>
		<p>{getI18nDesc(selection.value)}</p>
	</div>
	)
}

export default observer(ObtainDescription);