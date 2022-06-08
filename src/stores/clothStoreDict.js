import ClothStoreBox from "./ClothStoreBox.js";

const clothStoreDict = {
	hats : new ClothStoreBox( {value:-1} ),
	hairstyle : new ClothStoreBox( {hue:4, saturation:74, brightness:75} ),
	shirts : new ClothStoreBox(),
	pants : new ClothStoreBox( {hue:61, saturation:74, brightness:71} )
};

export default clothStoreDict;