function HamburgerButton({className, isActivated, onClick})
{
	return <div className={`hamburger-button ${className} ${isActivated ? "activated" : ""}`} onClick={onClick}>
		{new Array(11).fill(0).map((_,i)=><div key={i}/>)}
	</div>
}

export default HamburgerButton;