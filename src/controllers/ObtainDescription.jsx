import { useContext } from "react";
import { observer } from "mobx-react-lite";
import { Text } from "../atom/Text.jsx";

function ObtainDescription({type, selection})
{
	return <div className="description box-with-title">
		<h3><Text text="UI.howToObtain" /></h3>
		<p className="description-content"><Text text={`${type}.desc.${selection.value}`} /></p>
	</div>;
}

export default observer(ObtainDescription);