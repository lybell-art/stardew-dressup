import { useRef } from "react";
import { bufferToXnb, xnbDataToContent } from "@xnb-js/core";

function FileImporter({store})
{
	const fileDom = useRef();
	async function handleFile(e)
	{
		if(!fileDom.current) return;
		const file = fileDom.current.files[0];
		if(!file) return;
		const [,extension] = extractFileName(file.name);

		const buffer = await file.arrayBuffer();

		if(extension === "png")
		{
			const bufferReader = new DataView(buffer, 16, 8);
			const blobURL = URL.createObjectURL(file);
			const width = bufferReader.getInt32(0); // png uses big endian
			const height = bufferReader.getInt32(4); // png uses big endian
			store.setFile(blobURL, width, height);
		}
		else
		{
			try
			{
				const xnbData = bufferToXnb(buffer);
				const { width, height } = xnbData.content.export;
				const {content} = xnbDataToContent(xnbData);
				const blobURL = URL.createObjectURL(content);

				store.setFile(blobURL, width, height);
			}
			catch
			{
				alert("Not a proper xnb file!\nThis xnb file does not contain any texture data.");
			}
		}
	}

	return <>
		<div className="file-import" onClick={()=>fileDom.current.click()} >Import File!</div>
		<input type="file" 
			style={{"display":"none"}} 
			accept="image/*, .xnb" 
			onChange={handleFile}
			ref={fileDom} 
		/>
	</>
}

export default FileImporter;