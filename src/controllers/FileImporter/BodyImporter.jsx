import { useContext } from "react";
import { observer } from "mobx-react-lite";
import { LangsContext } from "../../stores/Langs.js";

import Dropdown from "../../atom/Dropdown.jsx";
import {BodyTextureImporter} from "./FileImporters.jsx";

const BodyImporterTitle=observer( ()=>
{
	const langs = useContext(LangsContext);
	return <p className="file-import">{langs.getTextHTML("UI.import.body")}</p>
} );

function BodyImporter()
{
	return <Dropdown
		button={<BodyImporterTitle />}
		wrapperClass="dropdown-wrapper-center"
		type="dropdown"
	>
		<BodyTextureImporter />
	</Dropdown>
}

export default BodyImporter;