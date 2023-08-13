"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { twMerge } from "tailwind-merge";
import { useSwipeable } from "react-swipeable";

const ChevronFirst = dynamic(() => import("lucide-react").then((mod) => mod.ChevronFirst), {
	ssr: false,
});
const ChevronLast = dynamic(() => import("lucide-react").then((mod) => mod.ChevronLast), {
	ssr: false,
});
interface CarouselProps {
	children: React.ReactNode[];
	className?: string;
	slide?: number;
	autoSlide?: boolean;
	autoSlideInterval?: number;
	swipeable?: boolean;
	chevrons?: boolean;
}

const Carousel = ({
	children,
	className = "",
	slide = 0,
	autoSlide = false,
	autoSlideInterval = 3000,
	swipeable = true,
	chevrons = true,
}: CarouselProps) => {
	const slides = React.Children.toArray(children);

	const [curr, setCurr] = useState(slide);

	const prev = () => setCurr((curr) => (curr === 0 ? slides.length - 1 : curr - 1));

	const next = () => setCurr((curr) => (curr === slides.length - 1 ? 0 : curr + 1));

	const handleSwipeLeft = () => {
		if (swipeable) next();
	};

	const handleSwipeRight = () => {
		if (swipeable) prev();
	};

	const handlers = useSwipeable({
		onSwipedLeft: handleSwipeLeft,
		onSwipedRight: handleSwipeRight,
	});

	useEffect(() => {
		if (!autoSlide) return;
		const slideInterval = setInterval(next, autoSlideInterval);
		return () => clearInterval(slideInterval);
	}, []);

	useEffect(() => {
		setCurr(slide < slides.length && slide >= 0 ? slide : 0);
	}, [slide]);

	return (
		<div
			className={twMerge(`relative overflow-hidden`, className)}
			{...(swipeable ? handlers : {})}
		>
			<div
				className="flex transition-transform ease-out duration-500"
				style={{ transform: `translateX(-${curr * 100}%)` }}
			>
				{slides.map((slide, i) => (
					<div key={i} className="w-full grid place-items-center shrink-0">
						{slide}
					</div>
				))}
			</div>
			{chevrons && (
				<>
					<button
						onClick={prev}
						className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all pl-1.5 hover:pl-1 opacity-70 hover:opacity-100 text-secondary-700`}
					>
						<ChevronFirst size={34} />
					</button>
					<button
						onClick={next}
						className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-all pr-1.5 hover:pr-1 opacity-70 hover:opacity-100 text-secondary-700`}
					>
						<ChevronLast size={34} />
					</button>
				</>
			)}
		</div>
	);
};

export default Carousel;
