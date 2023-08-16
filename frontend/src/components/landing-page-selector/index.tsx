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
		<div className="overflow-hidden group relative h-fit w-fit rounded-xl shadow-lg shadow-secondary-700 transition-all duration-200 ease-out bg-secondary-500">
			<div
				className={twMerge(
					"absolute h-10 bg-primary-600 transition-all duration-500 ease-out",
					state === "register" || state === "complete" ? "left-24 w-28" : "left-0 w-24"
				)}
			/>
			<button
				className={twMerge(
					"relative overflow-hidden h-10 w-24 transition-all duration-500 ease-out text-secondary-100",
					state === "login" || state === "2fa"
						? "font-semibold text-secondary-700"
						: selectable
						? "hover:bg-white hover:bg-opacity-10"
						: "opacity-50"
				)}
				disabled={state === "login" || !selectable}
				onClick={() => setState("login")}
			>
				Login
			</button>
			<button
				className={twMerge(
					"relative overflow-hidden h-10 w-28 transition-all duration-500 ease-out text-secondary-100",
					state === "register" || state === "complete"
						? "font-semibold text-secondary-700"
						: selectable
						? "hover:bg-white hover:bg-opacity-10"
						: "opacity-50"
				)}
				disabled={state === "register" || !selectable}
				onClick={() => setState("register")}
			>
				Register
			</button>
		</div>
	);
}
