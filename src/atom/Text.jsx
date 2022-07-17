import { useContext } from "react";
import { observer } from "mobx-react-lite";
import { LangsContext } from "../../stores/Langs.js";

function Text({text})
{
	const lang = useContext(LangsContext);
	return <>{lang.getText(text)}</>;
}

function TextElement({text})
{
	const lang = useContext(LangsContext);
	return <>{lang.getTextHTML(text)}</>;
}

export const Text = observer(Text);
export const TextElement = observer(TextElement);
