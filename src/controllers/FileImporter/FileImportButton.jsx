import { useContext } from "react";
import { TextElement } from "../../atom/Text.jsx";

function FileImportButton( {text, onClick} )
{
	return <div className="file-import hover-interact" onClick={onClick} >
		<TextElement text={text} />
	</div>
}

export default FileImportButton;