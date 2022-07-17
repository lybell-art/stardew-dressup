import Dropdown from "../../atom/Dropdown.jsx";
import {TextElement} from "../../atom/Text.jsx";
import {BodyTextureImporter} from "./FileImporters.jsx";

function BodyImporter()
{
	return <Dropdown
		button={<p className="file-import"><TextElement text="UI.import.body" /></p>}
		wrapperClass="dropdown-wrapper-center"
		type="dropdown"
	>
		<BodyTextureImporter />
	</Dropdown>
}

export default BodyImporter;