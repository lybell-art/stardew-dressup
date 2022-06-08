function isMobileView(screenWidth)
{
	const TABLET_MIN_SCREEN_WIDTH = 768;
	return screenWidth < TABLET_MIN_SCREEN_WIDTH;
}

class ThresholdObserver
{
	constructor(threshold, _default=0)
	{
		this.prev = _default;
		this.threshold = threshold;
	}
	checkEach(current, threshold)
	{
		if( (this.prev >= threshold) && (current<threshold) ) return -1;
		if( (this.prev <= threshold) && (current>threshold) ) return 1;
		return 0;
	}
	update(current, callback)
	{
		if(typeof this.threshold === "number")
		{
			const res=this.checkEach(current, this.threshold);
			if(res === 1) callback(1);
			else if(res === -1) callback(0);
		}
		if(Array.isArray(this.threshold))
		{
			for(let i=0; i<this.threshold.length; i++)
			{
				const res=this.checkEach(current, this.threshold[i]);
				if(res === 1) callback( (i<<1) + 1 );
				else if(res === -1) callback( (i<<1) + 0 );
			}
		}
		this.prev = current;
	}
}

function clamp(value, min, max)
{
	if(min > value) return min;
	if(max < value) return max;
	return value;
}

function lerp(a, b, v)
{
	return a*(1-v) + b*v;
}



// stardew valley using HSL color system
// from decompiled stardew valley code
function QQHtoRGB(q1, q2, hue)
{
	hue = hue % 360 + (hue < 0 ? 360 : 0);

	if (hue < 60.0) return q1 + (q2 - q1) * hue / 60.0;
	if (hue < 180.0) return q2;
	if (hue < 240.0) return q1 + (q2 - q1) * (240.0 - hue) / 60.0;
	return q1;
}

function HSLtoRGB(hue, saturation, lightness)
{
	const S = saturation/100;
	const L = lightness/100;

	const P2 = (!(L <= 0.5)) ? (L + S - L * S) : (L * (1.0 + S));
	const P = 2.0 * L - P2;

	let percentRGB;
	if (saturation === 0) percentRGB = [L, L, L];
	else percentRGB = [120, 0, -120].map( slider=>QQHtoRGB(P, P2, hue+slider) );

	return percentRGB.map(value=>Math.round(value*255) );
}

function colorArrayToHex(arr)
{
	return (arr[0]<<16) + (arr[1]<<8) + arr[2];
}

function getRedToHex(hex)
{
	return hex>>16;
}
function getGreenToHex(hex)
{
	return (hex & 0xff<<8) >> 8;
}
function getBlueToHex(hex)
{
	return hex & 0xff;
}

function hexToColorArray(hex)
{
	return [(hex>>16), ( (hex & 0xff<<8) >> 8), ( hex & 0xff )];
}

function lerpColor(a, b, v)
{
	let red = lerp( getRedToHex(a), getRedToHex(b), v );
	let green = lerp( getGreenToHex(a), getGreenToHex(b), v );
	let blue = lerp( getBlueToHex(a), getBlueToHex(b), v );

	return colorArrayToHex([red, green, blue]);
}

function getPrismaticColor(percent)
{
	const prismaticArray = [0xff0000, 0xff7800, 0xffd900, 0x00ff00, 0x00ffff, 0xee82ee];
	const lerp = (percent * 6) % 1;
	for(let i=0; i<6; i++)
	{
		if(percent < ((i+1)/6) ) return lerpColor(prismaticArray[i%6], prismaticArray[(i+1)%6], lerp);
	}
}

function easeOut(x)
{
	return 1 - Math.pow(1 - x, 5);
}

export { isMobileView, ThresholdObserver, HSLtoRGB, colorArrayToHex, getPrismaticColor, clamp, lerp, easeOut };