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
		<div className="group relative h-fit w-fit overflow-hidden rounded-xl border border-white/[0.08] bg-secondary-700 shadow-lg shadow-black/20 transition-all duration-200 ease-out">
			<div
				className={twMerge(
					"absolute h-10 bg-primary-400 transition-all duration-500 ease-out",
					state === "register" || state === "complete" ? "left-24 w-28" : "left-0 w-24"
				)}
			/>
			<button
				className={twMerge(
					"relative h-10 w-24 overflow-hidden transition-all duration-500 ease-out text-secondary-100 text-sm font-medium",
					state === "login" || state === "2fa"
						? "font-semibold text-secondary-900"
						: selectable
						? "hover:bg-secondary-600"
						: "opacity-50"
				)}
				disabled={state === "login" || !selectable}
				onClick={() => setState("login")}
			>
				Login
			</button>
			<button
				className={twMerge(
					"relative h-10 w-28 overflow-hidden transition-all duration-500 ease-out text-secondary-100 text-sm font-medium",
					state === "register" || state === "complete"
						? "font-semibold text-secondary-900"
						: selectable
						? "hover:bg-secondary-600"
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
