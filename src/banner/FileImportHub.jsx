import { useContext } from "react";
import { observer } from "mobx-react-lite";

// stores
import { LangsContext } from "../stores/Langs.js";
import characterStore from "../stores/CharacterStore.js";

import {ConrollerTitle} from "../controllers/ClothesController.jsx";
import TextureImporter from "../controllers/FileImporter/TextureImporter.jsx";

// extract selection mobx box, dataset mobx box, default image url from name
const getProps = characterStore.getProps.bind(characterStore);


function FileImportHubItem({name, children})
{
	const langs = useContext(LangsContext);
	return <div className="import-hub-card">
		<ConrollerTitle name={name} />
		<div className="import-hub-card-list">
			{children}
		</div>
	</div>
}


const FileImportHubModal = observer( ()=>
{
	return <>
		<FileImportHubItem name="body">
			<TextureImporter />
		</FileImportHubItem>
	</>
} );


function FileImportHub()
{
	return <Dropdown 
		wrapperClass="import-hub-wrapper"
		buttonClass="ui-icon import-button" 
		listClass="howto-modal"
		type="modal"
	>
		<FileImportHubModal />
	</Dropdown>
}

export default FileImportHub;