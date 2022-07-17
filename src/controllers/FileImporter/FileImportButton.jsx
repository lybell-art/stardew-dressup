import { useContext } from "react";
import { observer } from "mobx-react-lite";
import { LangsContext } from "../../stores/Langs.js";

function FileImportButton( {text, onClick} )
{
	const langs = useContext(LangsContext);
	return <div className="file-import hover-interact" onClick={onClick} >{langs.getTextHTML(text)}</div>
}

export default observer(FileImportButton);