import React from "react";
import "content-visibility";

function ClothIcon({index, category, positioner, tag})
{
	const spritePosition = positioner(index);
	if(spritePosition === null) return null;

	const {x, y, sheet=category} = spritePosition;
	const position = `${-x}px ${-y}px`;
	const style = {backgroundPosition: position, WebkitMaskPosition: position, maskPosition: position};
	return (
		<div className={`cloth-item itemdata-${sheet} cloth-item-${tag}`} style={style}>
			{tag==="colored" && <div className="color-mask blender"></div>}
			{tag==="prismatic" && <div className="color-mask prismatic"></div>}
		</div>
	);
}


function ItemSelector({name, handleTo, dataSet})
{
	const omittable = dataSet.constructor.omittable;
	const itemMaker = (length)=>(
		Array.from({length}, (_,i)=>{
			const key = dataSet.getListItemKey(i);
			const uncolored = dataSet.getUncoloredSpriteFromIndex;
			const colored = dataSet.getColoredSpriteFromIndex;
			const prismatic = dataSet.getPrismaticSpriteFromIndex;

			return <content-visibility containIntrinsicSize="60px" key={key}><label className="cloth-item-box">
				<input 
					type="radio" 
					name={`${name}-cloth`} 
					defaultChecked={i === (omittable ? -1 : 0)}
					onChange={()=>handleTo(i)}
				/>
				<ClothIcon category={name} index={i} positioner={uncolored} tag="uncolored"/>
				<ClothIcon category={name} index={i} positioner={colored} tag="colored"/>
				<ClothIcon category={name} index={i} positioner={prismatic} tag="prismatic"/>
			</label></content-visibility>
		} )
	);

	console.log(dataSet.count);

	return (
		<div className="cloth-list">
			{omittable && <label className="cloth-item-box">
				<input 
					type="radio" 
					name={`${name}-cloth`} 
					defaultChecked={true}
					onChange={()=>handleTo(-1)}
				/>
			</label>}
			{itemMaker(dataSet.count)}
		</div>
	)
}


export default ItemSelector;