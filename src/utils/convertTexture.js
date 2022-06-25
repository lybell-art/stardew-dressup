import {BaseTexture} from "pixi.js";

function convertTextureMap(urlDict)
{
	const textureDict = {};
	for(let [key, value] of Object.entries(urlDict))
	{
		textureDict[key] = new BaseTexture(value);
	}
	return textureDict;
}

export {convertTextureMap};