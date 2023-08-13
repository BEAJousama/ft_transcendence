"use client";
import { twMerge } from "tailwind-merge";

interface LandingPageSelectorProps {
	selectable: boolean;
	state: "login" | "register" | "2fa" | "complete";
	setState: (state: "login" | "register" | "2fa" | "complete") => void;
}

export default function LandingPageSelector({
	selectable,
	state,
	setState,
}: LandingPageSelectorProps) {
	return (
		<div
			className={twMerge(
				"overflow-hidden group relative h-fit w-fit rounded-xl shadow-lg shadow-secondary-700 transition-all duration-200 ease-out bg-secondary-500",
				!selectable && "opacity-50"
			)}
		>
			<div
				className={twMerge(
					"absolute h-10 bg-primary-600 transition-all duration-500 ease-out",
					state === "login" ? "left-0 w-24" : "left-24 w-28"
				)}
			/>
			<button
				className={twMerge(
					"relative overflow-hidden h-10 w-24 transition-all duration-500 ease-out",
					state === "login"
						? "font-semibold text-secondary-700"
						: selectable &&
								"text-secondary-100 before:ease before:absolute before:right-0 before:top-0 before:h-12 before:w-6 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-10 before:duration-700 hover:before:-translate-x-40"
				)}
				disabled={state === "login" || !selectable}
				onClick={() => setState("login")}
			>
				Login
			</button>
			<button
				className={twMerge(
					"relative overflow-hidden h-10 w-28 transition-all duration-500 ease-out",
					state === "register"
						? "font-semibold text-secondary-700"
						: selectable &&
								"text-secondary-100 before:ease before:absolute before:right-0 before:top-0 before:h-12 before:w-6 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-10 before:duration-700 hover:before:-translate-x-40"
				)}
				disabled={state === "register" || !selectable}
				onClick={() => setState("register")}
			>
				Register
			</button>
		</div>
	);
}
