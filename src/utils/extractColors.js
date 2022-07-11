import { colorArrayToHex } from "./utils.js";

function extractPixel(colorArray, index)
{
	return [
		colorArray[index * 4],
		colorArray[index * 4 + 1],
		colorArray[index * 4 + 2],
		colorArray[index * 4 + 3]
	];
}

function extractSleeveColors(colorArray, width, height)
{
	function getPixelIndex(index)
	{
		let x = (index % 16) * 8;
		let y = Math.floor(index / 16) * 32;
		return y * width + x;
	}

	function extractSleeveColor(index, yOffset=0)
	{
		const pixelIdx = getPixelIndex(shirtIdx) + yOffset;
		const dyePixelIdx = pixelIdx + 128;

		let [,,,a] = extractPixel(colorArray, dyePixelIdx);
		if(a > 0) {
			return {
				color:colorArrayToHex( extractPixel(colorArray, dyePixelIdx) ),
				dyeable:1
			};
		}
		return {
			color:colorArrayToHex( extractPixel(colorArray, pixelIdx) ),
			dyeable:0
		};
	}

	const result = [];
	let shirtIdx = 0;
	while(getPixelIndex(shirtIdx) * 4 < colorArray.length) {
		let {color:light, dyeable:l} = extractSleeveColor(shirtIdx, 2*width);
		let {color:mid, dyeable:m} = extractSleeveColor(shirtIdx, 3*width);
		let {color:dark, dyeable:d} = extractSleeveColor(shirtIdx, 4*width);

		result[shirtIdx] = {
			light, mid, dark,
			dyeable:( (l<<2) | (m<<1) | (d<<0) )
		};
		shirtIdx++;
	}
	return result;
}

function extractBodyColors(colorArray)
{
	const extractHex = idx=>colorArrayToHex( extractPixel(colorArray, idx) );
	return {
		sleeve:[258, 257, 256].map(extractHex),
		skin:[262, 261, 260].map(extractHex),
		eye:[277, 276].map(extractHex)
	};
}


function makeDefaultBodyColor()
{
	return {
		sleeve:[0x8e1f0c, 0x701718, 0x4a0c06],
		skin:[0xf9ae89, 0xe06b65, 0x6b003a],
		eye:[0x682b0f, 0x2d1206]
	}
}

export { extractSleeveColors, extractBodyColors };