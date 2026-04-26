"use client"

import Card from "../card";
import { twMerge } from "tailwind-merge";

const Achievement = ({
	title,
	description,
	disabled,
	image,
}: {
	title: string;
	description: string;
	disabled?: boolean;
	image: string;
}) => {
	return (
		<Card
			className="relative flex flex-col items-center justify-center gap-3 overflow-hidden border border-white/[0.06] bg-secondary-700 text-secondary-50 shadow-xl shadow-black/20"
		>
			<div className="basis-2/3 flex justify-center">
				<img
					src={`/achievements/${image}`}
					alt="Achievement"
					className={twMerge("h-44 rounded-xl object-scale-down", disabled && "grayscale-[60%] blur-sm opacity-40")}
					loading="lazy"
				/>
			</div>
			<div className="flex basis-1/3 flex-col items-center gap-1.5">
				<div className="text-sm font-semibold tracking-tight">
					{title.charAt(0).toLocaleUpperCase() +
						title.slice(1).toLocaleLowerCase().replaceAll("_", " ")}
				</div>
				<div className="bottom-0 text-center text-xs text-secondary-300 leading-relaxed">
					{description}
				</div>
			</div>
		</Card>
	);
};

export default Achievement;
