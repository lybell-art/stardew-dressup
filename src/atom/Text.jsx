import { useContext } from "react";
import { observer } from "mobx-react-lite";
import { LangsContext } from "../stores/Langs.js";

function _Text({text})
{
	const lang = useContext(LangsContext);
	return <>{lang.getText(text)}</>;
}

function _TextElement({text})
{
	const lang = useContext(LangsContext);
	return <>{lang.getTextHTML(text)}</>;
}

const Text = observer(_Text);
const TextElement = observer(_TextElement);

export {Text, TextElement};
