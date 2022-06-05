import { colorArrayToHex, getPrismaticColor } from "./utils.js";
import { Container, filters } from "pixi.js";

class tintedContainer extends Container
{
	constructor(colorDataStore=null)
	{
		super();
		this.colorFilter = new filters.ColorMatrixFilter();
		this.filters = [this.colorFilter];
		this.reflectTarget = colorDataStore;
	}
	tint(rgb)
	{
		this.colorFilter.tint(rgb);
	}
	reset()
	{
		this.colorFilter.reset();
	}
	autoTint()
	{
		if(this.reflectTarget === null) return;
		this.tint( colorArrayToHex(this.reflectTarget.color) );
	}
}

class prismaticContainer extends tintedContainer
{
	constructor()
	{
		super();
		this.elapsedTime = 0;
		this.tint(getPrismaticColor(0));
	}
	progress(deltaTime)
	{
		const CYCLE = 3000;
		this.elapsedTime = (this.elapsedTime + deltaTime) % CYCLE;
		const lerpPercent = this.elapsedTime / CYCLE;
		this.tint(getPrismaticColor(lerpPercent));
	}
}

export { tintedContainer, prismaticContainer };