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

	return percentRGB.map(value=>value*255);
}

export { HSLtoRGB };