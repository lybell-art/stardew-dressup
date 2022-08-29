import { colorArrayToHex, hexToColorArray } from "./colors.js";

function replaceColorsFromBuffer(bitmap, replaceMap)
{
	let replaced = new Uint8Array(bitmap);
	let map = new Map(replaceMap);
	for(let i=0; i<replaced.length; i+=4)
	{
		let color = colorArrayToHex( [replaced[i+0], replaced[i+1], replaced[i+2]] );
		if(map.has(color))
		{
			let [r, g, b] = hexToColorArray( map.get(color) );
			replaced[i+0] = r;
			replaced[i+1] = g;
			replaced[i+2] = b;
		}
	}

	return replaced;
}

export { replaceColorsFromBuffer };