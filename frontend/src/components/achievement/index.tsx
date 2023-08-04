"use client"


import Card from "../card";
import { twMerge } from "tailwind-merge";
import Image from "next/image";


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
			className=
			{`relative flex flex-col items-center justify-center 
        gap-3 overflow-hidden border-tertiary-500 bg-secondary-50 text-white shadow-2xl shadow-secondary-50`}
		>
			<div className="basis-2/3 flex justify-center">
				<img
					src={`/achievements/${image}`}
					alt="Achievement"
					className={twMerge("h-44 rounded-xl object-scale-down", disabled && "grayscale-[60%] blur-sm opacity-50")}
					loading="lazy"
				/>
			</div>
			<div className="flex basis-1/3 flex-col items-center gap-2">
				<div className=" text-sm font-bold">
					{title.charAt(0).toLocaleUpperCase() +
						title.slice(1).toLocaleLowerCase().replaceAll("_", " ")}
				</div>
				<div className="bottom-0 text-center  text-xs text-tertiary-200">
					{description}
				</div>
			</div>
		</Card>
	);
};

export default Achievement;
