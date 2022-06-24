import { Component, Fragment, createRef } from "react";
import { Pagination, Mousewheel } from "swiper";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";

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

function Controller({ids, children})
{
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
		mousewheel={ true }

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
		modules={[Pagination, Mousewheel]}
	>
		{ children.map( (child, idx)=><SwiperSlide key={ids[idx]}>{child}</SwiperSlide> ) }
	</Swiper>
}

export default Controller;