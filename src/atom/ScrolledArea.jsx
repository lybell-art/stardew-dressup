import { useRef } from "react";
import { useSwiper } from "swiper/react";
import debounce from "lodash.debounce";

function ScrolledArea({className="", children})
{
	const areaRef = useRef(null);
	const swiper = useSwiper();

	function scrollEvent(e)
	{
		const elem = areaRef.current;
		
		const isTop = elem.scrollTop === 0;
		const isBottom = elem.scrollHeight - elem.scrollTop === elem.clientHeight;

//		console.log(swiper);

		if(isTop && e.deltaY < 0){
			if(swiper.animating) return;
			swiper.slidePrev(300);
			return;
		}
		if(isBottom && e.deltaY > 0){
			if(swiper.animating) return;
			swiper.slideNext(300);
			return;
		}
		e.stopPropagation();
	}


	return <div className={`scrolled-area ${className}`} 
		onWheel={debounce(scrollEvent, 100)} 
		ref={areaRef}>
		{children}
	</div>
}

export default ScrolledArea;