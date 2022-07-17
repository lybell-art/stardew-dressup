import { useContext } from "react";
import { observer } from "mobx-react-lite";
import { Text } from "../atom/Text.jsx";
import ScrolledArea from "../atom/ScrolledArea.jsx";

function ObtainDescription({type, selection})
{
	return <div className="description box-with-title">
		<h3><Text text="UI.howToObtain" /></h3>
		<ScrolledArea className="description-content">
			<p><Text text={`${type}.desc.${selection.value}`} /></p>
		</ScrolledArea>
	</div>;
}

export default observer(ObtainDescription);