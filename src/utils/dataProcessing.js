/* extract hats data */
function hatsJsonProcessing(data)
{
	let result = [];
	let index = 0;
	for(let value of Object.values(data) )
	{
		let [,,hairDrawType, ignoreHairstyleOffset] = value.split("/");
		if(hairDrawType == "true") hairDrawType = 0;
		else if(hairDrawType == "false") hairDrawType = 1;
		else hairDrawType = 2;

		ignoreHairstyleOffset = (ignoreHairstyleOffset === "true");

		result[index++] = {hairDrawType, ignoreHairstyleOffset};
	}

	return result;
}

/* extract hairstyle data */
function hairstyleJsonProcessing(data)
{
	let result = {};
	for(let [key, value] of Object.entries(data) )
	{
		let [sheet, tileX, tileY, useUniqueLeft, coveredHair, isBald] = value.split("/");
		[tileX, tileY] = [+tileX, +tileY];
		useUniqueLeft = (useUniqueLeft === "true");
		isBald = (isBald === "true");
		coveredHair = (coveredHair === "-1") ? +key : +coveredHair;
		result[key] = {sheet, tileX, tileY, useUniqueLeft, coveredHair, isBald};
	}

	return result;
}

/* extract shirts&pants data */
function extractRealCloth(data)
{
	const dataEntries = Object.entries(data);
	const alreadyChecked = new Set();

	let shirtsAvaliableIndex = dataEntries
		.filter( ([key])=>+key >= 1000 )
		.map( ([key, value])=>{
			let [,,,man, woman] = value.split("/");
			[man, woman] = [+man, +woman];
			alreadyChecked.add(man);
			if(woman !== -1) alreadyChecked.add(woman);

			return +key;
		});
	let pantsAvaliableIndex = dataEntries
		.filter( ([key])=>{
			key = +key;
			return key<1000 && key >= 0 && key !== 14;
		})
		.map( ([key])=>+key);

	const additionalShirts = Array.from({length:300}, (_,i)=>i)
		.filter(i=>!alreadyChecked.has(i))
		.map(i=>i+1000);

	additionalShirts.push(1041); // can exist
	
	shirtsAvaliableIndex=shirtsAvaliableIndex.concat(additionalShirts);
	shirtsAvaliableIndex.sort((a,b)=>a-b);

	return [shirtsAvaliableIndex, pantsAvaliableIndex];
}

function extractClothData(str)
{
	let [,,,male, female,,color, dyeable,, additional] = str.split("/");
	[male, female] = [+male, +female];
	if(female === -1) female = male;
	color = color.split(" ").map(value=>+value);

	dyeable = dyeable === "true";
	prismatic = additional === "Prismatic";
	sleeveless = additional === "Sleeveless";

	return {name, male, female, color, dyeable, sleeveless, prismatic};
}

function clothesJsonProcessing(data)
{
	const [shirtsAvaliableIndex, pantsAvaliableIndex] = extractRealCloth(data);

	const shirtData = shirtsAvaliableIndex.map((i)=>{
		const index = data[i] !== undefined ? i : -2;

		let {male, female, color, dyeable, prismatic} = extractClothData(data[index]);
		if(index === -2) [male, female] = [i-1000, i-1000];
		let name = `shirts.name.${index !== -2 ? index-1000 : "default"}`;

		return {name, male, female, color, dyeable, sleeveless, prismatic};
	});

	const pantsData = pantsAvaliableIndex.map((i)=>{
		const index = data[i] !== undefined ? i : -1;

		let {male:sheetIndex, color, dyeable, prismatic} = extractClothData(data[index]);
		let name = `pants.name.${index}`;

		return {name, sheetIndex, color, dyeable, prismatic};
	});

	return [shirtData, pantsData];
}

export {hatsJsonProcessing, hairstyleJsonProcessing, clothesJsonProcessing}