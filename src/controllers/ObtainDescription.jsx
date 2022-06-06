import { useContext } from "react";
import { LangsContext } from "../stores/Langs.js";
import { observer } from "mobx-react-lite";

function ObtainDescription({type, selection})
{
	const langs = useContext(LangsContext);
	function getI18nDesc(index) {
		return langs.getText(`${type}.desc.${index}`);
	}

	return (
	<div className="desc box-with-title">
		<h3>{langs.getText("UI.howToObtain")}</h3>
		<p className="desc-content">{getI18nDesc(selection.value)}</p>
	</div>
	)
}

export default observer(ObtainDescription);