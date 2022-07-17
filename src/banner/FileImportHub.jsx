import Dropdown from "../atom/Dropdown.jsx";
import {ControllerTitle} from "../controllers/ClothesController.jsx";
import {BodyTextureImporter, SkinImporter, HairstyleTextureImporter, ClothesTextureImporter} from "../controllers/FileImporter/FileImporters.jsx";
import {ResetImportButton, ResetAllButton} from "../controllers/FileImporter/ResetImport.jsx";

function FileImportHubItem({name, children})
{
	return <div className="import-hub-card">
		<ControllerTitle name={name} />
		<div className="import-hub-card-items">
			{children}
		</div>
		<ResetImportButton name={name} />
	</div>
}

function FileImportHubModal()
{
	return <div className="import-hub-list">
		<FileImportHubItem name="body">
			<BodyTextureImporter />
		</FileImportHubItem>
		<FileImportHubItem name="skin">
			<SkinImporter />
		</FileImportHubItem>
		<FileImportHubItem name="hats">
			<ClothesTextureImporter name="hats"/>
		</FileImportHubItem>
		<FileImportHubItem name="hairstyle">
			<HairstyleTextureImporter />
		</FileImportHubItem>
		<FileImportHubItem name="shirts">
			<ClothesTextureImporter name="shirts"/>
		</FileImportHubItem>
		<FileImportHubItem name="pants">
			<ClothesTextureImporter name="pants"/>
		</FileImportHubItem>
	</div>
}


function FileImportHub()
{
	return <Dropdown 
		wrapperClass="import-hub-wrapper"
		buttonClass="ui-icon import-button" 
		listClass="modal scrolling-modal"
		type="modal"
	>
		<FileImportHubModal />
		<ResetAllButton />
	</Dropdown>
}

export {FileImportHubModal, FileImportHub};