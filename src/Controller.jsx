import { useRef } from "react";
import { Pagination } from "swiper";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import { hasParentClass } from "./utils/utils.js";

function renderCustomMaker(names)
{
	function renderBullet(name, active) {
		return (
`<div class="nav-icon ${active ? "swiper-pagination-bullet-active" : ""}">
	<div class="ui-icon ${name}-icon"></div>
	<p class="bullet-caption">${name}</p>
</div>` );
	}

	return function renderCustom(swiper, index, total) {
		return names.map( (name,i)=>renderBullet(name, i === index-1) ).join("\n");
	};
}

function _wheelSwipe(swiper)
{
	return (e)=>{
		if(hasParentClass(e.target, "scrolled-area")) return;
		if(swiper.animating) return;
		if(e.deltaY < 0) swiper.slidePrev(300);
		else if(e.deltaY > 0) swiper.slideNext(300);
	};
}

function Controller({ids, children})
{
	const swiper = useSwiper();
	let wheelSwipe = useRef(null);

	return <Swiper
		slidesPerView={1}
		spaceBetween={10}
		pagination={{
			clickable:true,
			horizontalClass:"nav-bar",
			verticalClass:"nav-bar",
			bulletClass:"nav-icon",
			type:"custom",
			renderCustom: renderCustomMaker(ids)
		}}

		breakpoints={ {
			1366: {
				slidesPerView:"auto",
				spaceBetween:20,
				direction:"vertical"
			}
		} }

		noSwipingSelector="input, canvas"
		autoHeight={true}

		className="controller"
		modules={[Pagination]}
		onSwiper={(swiper) => {
			wheelSwipe.current = _wheelSwipe(swiper);
			swiper.el.addEventListener('wheel', wheelSwipe.current);
		}}
		onDestroy={(swiper) => {
			swiper.el.removeEventListener('wheel', wheelSwipe.current);
		}}
	>
		{ children.map( (child, idx)=><SwiperSlide key={ids[idx]}>{child}</SwiperSlide> ) }
	</Swiper>
}

export default Controller;