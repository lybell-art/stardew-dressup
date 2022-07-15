import { useContext } from "react";
import { observer } from "mobx-react-lite";
import { LangsContext } from "../../stores/Langs.js";

function FileImportButton( {text, onClick} )
{
	const langs = useContext(LangsContext);
	return <div className="file-import" onClick={onClick} >{langs.getText(text)}</div>
}

export default observer(FileImportButton);