import {lerp, clamp, randInt} from "./utils.js";

// stardew valley using HSB color system
// from https://www.30secondsofcode.org/js/s/hsb-to-rgb
function HSBtoRGB(hue, saturation, brightness)
{
	const S = saturation/100;
	const B = brightness/100;

	const k = n=> (n + hue/60) % 6;
	const f = n=> B * (1 - S * Math.max(0, Math.min(k(n), 4 - k(n), 1)));

	return [5,3,1].map(i=>Math.floor(255 * f(i)));
}

function HSBToString(hue, saturation, brightness)
{
	const rgb = HSBtoRGB(hue, saturation, brightness);
	return `RGB(${rgb.join(", ")})`;
}

// from stardew valley decompiled code
function RGBtoHSB(red, green, blue)
{
	const [r, g, b] = [red, green, blue].map( e=>e/255 );

	const min = Math.min(r, g, b);
	const max = Math.max(r, g, b);
	const delta = max - min;

	let hue;
	let saturation = delta / max * 100;
	let brightness = max * 100;
    if(delta === 0) return [0, 0, Math.floor(brightness)];
    
	if (r === max) hue = (g - b) / delta;
	else if(g === max) hue = 2 + (b - r) / delta;
	else hue = 4 + (r - g) / delta;
    
	hue *= 60;
	if(hue < 0) hue += 360;

	return [hue, saturation, brightness].map( e=>Math.floor(e) );
}

function colorArrayToHex(arr)
{
	return (arr[0]<<16) + (arr[1]<<8) + arr[2];
}

function getRedToHex(hex)
{
	return hex >> 16;
}

function getGreenToHex(hex)
{
	return (hex >> 8) & 0xff;
}
function getBlueToHex(hex)
{
	return hex & 0xff;
}

function hexToColorArray(hex)
{
	return [(hex>>16), ( (hex >> 8) & 0xff ), ( hex & 0xff )];
}

function multiplyColor(hex1, hex2)
{
	const color1 = typeof hex1 === "number" ? hexToColorArray(hex1) : hex1;
	const color2 = typeof hex2 === "number" ? hexToColorArray(hex2) : hex2;
	const multiplied = color1.map( (col, i)=>Math.round( (col/255) * (color2[i]/255) * 255) )

	return colorArrayToHex(multiplied);
}

// stardew valley using this change brightness logic
// from decompiled stardew valley code : FarmerRenderer.changeBrightness()
function changeBrightness(color, brightness)
{
	const c = typeof color === "number" ? hexToColorArray(color) : color;
	const blueBrightness = Math.floor( (brightness > 0) ? (brightness * 5 / 6) : (brightness * 8 / 7) );

	const red = clamp(c[0] + brightness, 0, 255);
	const green = clamp(c[1] + brightness, 0, 255);
	const blue = clamp(c[2] + blueBrightness, 0, 255);

	return (red << 16) + (green << 8) + blue;
}

function lerpColor(a, b, v)
{
	let red = lerp( getRedToHex(a), getRedToHex(b), v );
	let green = lerp( getGreenToHex(a), getGreenToHex(b), v );
	let blue = lerp( getBlueToHex(a), getBlueToHex(b), v );

	return (red << 16) + (green << 8) + blue;
}

function getPrismaticColor(percent)
{
	const prismaticArray = [0xff0000, 0xff7800, 0xffd900, 0x00ff00, 0x00ffff, 0xee82ee];
	const lerp = (percent * 6) % 1;
	const part = Math.floor(percent * 6);
	return lerpColor(prismaticArray[part%6], prismaticArray[(part+1)%6], lerp);
}

function getRandomClothesColor(darken=false)
{
	let rgb=Array.from({length:3}, ()=>randInt(25, 255));
	if(darken) rgb = rgb.map( e=> Math.floor(e/2) );
	rgb = rgb.map( e=> {
		if(Math.random() < 0.5) return e;
		return randInt(15, 50);
	} );
	return RGBtoHSB(...rgb);
}

export {HSBtoRGB, HSBToString, RGBtoHSB, colorArrayToHex, hexToColorArray, multiplyColor, changeBrightness, lerpColor, getPrismaticColor, getRandomClothesColor};