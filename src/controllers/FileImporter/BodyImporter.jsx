import { useContext } from "react";
import { observer } from "mobx-react-lite";
import { LangsContext } from "../../stores/Langs.js";

import Dropdown from "../../atom/Dropdown.jsx";
import TextureImporter from "./TextureImporter.jsx";

const BodyImporterTitle=observer( ()=>
{
	const langs = useContext(LangsContext);
	return <div>{langs.getText("UI.import.body")}</div>
} );

function BodyImporter({store})
{
	function makeTextureImporter(key)
	{
		return <TextureImporter store={store} key={key}
			handler={ retex=>{
				store.setSpritesheet(retex, `body_${key}`);
			} } 
		text={`UI.import.body.${key}`}/>
	}
	const keyList = ["male", "male_bald", "female", "female_bald"];

	return <Dropdown
		button={<BodyImporterTitle />}
	>
		{keyList.map(makeTextureImporter)}
	</Dropdown>
}

export default observer(BodyImporter);