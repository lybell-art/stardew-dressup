import {useState} from "react";

function Dropdown({button=null, children, buttonClass="", listClass="", wrapperClass=""})
{
	const [isOpened, open] = useState(false);
	const hidden = !isOpened ? "hidden" : "";

	return <div className={`dropdown-wrapper ${wrapperClass}`}>
		<div className={`${buttonClass} hover-interact`} onClick={ ()=>open(prev=>!prev) }>
			{button}
		</div>
		<div className={`dropdown-list ${listClass} ${hidden}`}>{children}</div>
	</div>
}

export default Dropdown;