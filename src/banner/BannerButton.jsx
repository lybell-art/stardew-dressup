import { Text } from "../atom/Text.jsx";

function BannerButton({type})
{
	return <>
		<div className={`ui-icon ${type}-button`} />
		<p className="button-caption"><Text text={`UI.aside.${type}.short`} /></p>
	</>
}

export default BannerButton;