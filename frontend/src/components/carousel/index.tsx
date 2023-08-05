"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import {
	TbSquareRoundedChevronRightFilled,
	TbSquareRoundedChevronLeftFilled,
} from "react-icons/tb";
import { twMerge } from "tailwind-merge";

interface CarouselProps {
	children: React.ReactNode[];
	className?: string;
	slide?: number;
	autoSlide?: boolean;
	autoSlideInterval?: number;
	swipeable?: boolean;
	chevrons?: boolean;
	indicators?: boolean;
}

const Carousel = ({
	children,
	className = "",
	slide = 0,
	autoSlide = false,
	autoSlideInterval = 3000,
	swipeable = true,
	chevrons = true,
	indicators = true,
}: CarouselProps) => {
	const slides = React.Children.toArray(children);

	const [curr, setCurr] = useState(slide);

	const prev = () => setCurr((curr) => (curr === 0 ? slides.length - 1 : curr - 1));

	const next = () => setCurr((curr) => (curr === slides.length - 1 ? 0 : curr + 1));

	const handlers = useSwipeable({
		onSwipedLeft: () => next(),
		onSwipedRight: () => prev(),
		trackMouse: true,
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
		<div className={`relative overflow-hidden ${className}`} {...(swipeable ? handlers : {})}>
			<div
				className="flex transition-transform ease-out duration-500"
				style={{ transform: `translateX(-${curr * 100}%)` }}
			>
				{slides.map((slide, i) => (
					<div
						key={i}
						className={twMerge(
							"w-full shrink-0 ease transition-all duration-300",
							curr !== i && "blur-sm opacity-20"
						)}
					>
						{slide}
					</div>
				))}
			</div>
			{chevrons && (
				<div className="absolute inset-0 flex items-center justify-between p-4">
					<button
						onClick={prev}
						className={`transition-all pl-1.5 hover:pl-1 opacity-70 hover:opacity-100 color-secondary-700`}
					>
						<TbSquareRoundedChevronLeftFilled size={34} />
					</button>
					<button
						onClick={next}
						className={`transition-all pr-1.5 hover:pr-1 opacity-70 hover:opacity-100 color-secondary-700`}
					>
						<TbSquareRoundedChevronRightFilled size={34} />
					</button>
				</div>
			)}
			{indicators && (
				<div className="absolute bottom-4 right-0 left-0">
					<div className="flex items-center justify-center gap-2">
						{slides.map((_, i) => (
							<div
								className={`
              transition-all w-2 h-2 bg-secondary-600 rounded-full
              ${curr === i && "bg-primary-300"}
            `}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default Carousel;
