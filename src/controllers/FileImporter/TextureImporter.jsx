import { useRef } from "react";
import { bufferToXnb, xnbDataToContent } from "../../libs/xnb.js";
import { decode } from "fast-png";

import { extractFileName } from "../../utils/utils.js";
import FileImportButton from "./FileImportButton.jsx";


function TextureImporter({ store, handler=(retex)=>{store.setSpritesheet(retex)}, text="UI.import.texture" })
{
	const fileDom = useRef();
	async function handleFile(e)
	{
		if(!fileDom.current) return;
		const file = fileDom.current.files[0];
		if(!file) return;
		const [,extension] = extractFileName(file.name);

		const buffer = await file.arrayBuffer();

		// png retexture
		if(extension === "png")
		{
			const {width, height, data} = await decode(buffer);
			const blobURL = URL.createObjectURL(file);
			handler({width, height, data, blobURL});
			return;
		}

		// xnb retexture
		try
		{
			const xnbData = await bufferToXnb(buffer);
			const { width, height, data } = xnbData.content.export;
			const {content} = await xnbDataToContent(xnbData);
			const blobURL = URL.createObjectURL(content);

			handler({width, height, data, blobURL});
		}
		catch(e)
		{
			alert("Not a proper xnb file!\nThis xnb file does not contain any texture data.");
			console.error(e);
		}
	}


	return <>
		<FileImportButton text={text} onClick={()=>fileDom.current.click()} />
		<input type="file" 
			style={{"display":"none"}} 
			accept=".png, .xnb" 
			onChange={handleFile}
			ref={fileDom} 
		/>
	</>
}

export default TextureImporter;