function colorArrayToHex(arr)
{
	return (arr[0]<<16) + (arr[1]<<8) + arr[2];
}

function extractPixel(colorArray, index)
{
	return [
		colorArray[index * 4],
		colorArray[index * 4 + 1],
		colorArray[index * 4 + 2],
		colorArray[index * 4 + 3]
	];
}

function extractSkinColors(colorArray, width, height)
{
	const result = [];
	for(let y = 0; y < height; y++)
	{
		let tone=[];
		for(let x = 0; x<3; x++)
		{
			tone[x] = colorArrayToHex( extractPixel(colorArray, y*3 + x) );
		}
		const [dark, mid, light] = tone;
		result[y] = {light, mid, dark};
	}

	return result;
}

export { extractSkinColors };