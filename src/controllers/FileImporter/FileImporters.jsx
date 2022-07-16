import characterStore from "../../stores/CharacterStore.js";

import TextureImporter from "./TextureImporter.jsx";

const getProps = characterStore.getProps.bind(characterStore);


// index adjustion
function adjustIndex(selection, count)
{
	selection.adjustSelect(count);
}

// body importer
function BodyTextureImporter()
{
	const {dataSet} = getProps("body");

	function makeTextureImporter(key)
	{
		return <TextureImporter store={dataSet} key={key}
			handler={ retex=>{
				store.setSpritesheet(retex, `body_${key}`);
			} } 
		text={`UI.import.body.${key}`}/>;
	}
	const keyList = ["male", "male_bald", "female", "female_bald"];

	return <>{keyList.map(makeTextureImporter)}</>;
}

// skin importer
function SkinImporter()
{
	const {selection, dataSet} = getProps("body");

	return <TextureImporter store={dataSet} 
		callback={({count})=>adjustIndex(selection, count)}
		handler={ (retex)=>{dataSet.setSkinColor(retex)} } 
		text="UI.import.skin"/>;
}

// hairstyle importer
function HairstyleTextureImporter()
{
	const {selection, dataSet} = getProps("hairstyle");
	const adjustHairstyleIdx = ({count})=>adjustIndex(selection, count);

	return <>
		<TextureImporter store={dataSet} callback={adjustHairstyleIdx} />
		<TextureImporter store={dataSet} callback={adjustHairstyleIdx}
			handler={ (retex)=>{dataSet.setAdditionalSheet({hairstyles2: retex.blobURL})} } 
			text="UI.import.additionalTexture"/>
	</>;
}

// clothes texture importer(hats, shirts, pants, accessary)
function ClothesTextureImporter({name})
{
	const {dataSet} = getProps(name);

	return <TextureImporter store={dataSet} />;
}

export {BodyTextureImporter, SkinImporter, HairstyleTextureImporter, ClothesTextureImporter};