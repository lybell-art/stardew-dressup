import React from "react";

function ClothItem({category, x, y})
{
	const style = {backgroundPosition: `${-x}px ${-y}px`};
	return (
		<div className={`cloth-item itemdata-${category}`} style={style}></div>
	);
}

function ItemSelector({name, value, handleTo})
{
	const itemMaker = (length)=>(
		Array.from({length}, (_,i)=>(
			<label className="cloth-item-box" key={i}>
				<input 
					type="radio" 
					name={`${name}-cloth`} 
					defaultChecked={i === 0}
					onChange={()=>handleTo(i)}
				/>
				<ClothItem category={"hats"} x={0} y={0} />
			</label>
		) )
	);

	return (
		<div className="cloth-list">
			{itemMaker(5)}
		</div>
	)
}


export default ItemSelector;