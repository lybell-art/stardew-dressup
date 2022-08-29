function isMobileView(screenWidth)
{
	const TABLET_MIN_SCREEN_WIDTH = 768;
	return screenWidth < TABLET_MIN_SCREEN_WIDTH;
}

function canTouch()
{
	return !!('ontouchstart' in window || window.DocumentTouch && document instanceof window.DocumentTouch);
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

function easeOut(x)
{
	return 1 - Math.pow(1 - x, 5);
}

function extractFileName(fullname)
{
	let matcher = fullname.match(/(.*)\.([^\s.]+)$/);
	if(matcher === null) return [fullname,null];
	return [ matcher[1], matcher[2] ];
}

function hasParentElement(child, parent)
{
	if(parent === window) return true;
	if(parent === null) return false;

	let node = child;
	while(node.parentNode !== null){
		if(node === parent) return true;
		node = node.parentNode;
	}
	return false;
}

function hasParentClass(child, className)
{
	if(parent === null) return false;

	let node = child;
	while(node.parentNode !== null){
		if( [...node.classList].includes(className) ) return true;
		node = node.parentNode;
	}
	return false;
}

function randInt(from, to)
{
	return Math.floor( Math.random() * (to-from) + from );
}

export { isMobileView, canTouch, clamp, lerp, easeOut, extractFileName, hasParentElement, hasParentClass, randInt };