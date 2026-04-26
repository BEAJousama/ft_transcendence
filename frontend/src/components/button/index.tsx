"use client";

import { Children } from "react";
import { twMerge } from "tailwind-merge";

const Button = ({
	type = "primary",
	className,
	children,
	htmlType = "button",
	disabled,
	onClick,
	variant = "contained",
}: {
	type?: "primary" | "danger" | "success" | "cuation" | "secondary" | "simple";
	className?: string;
	htmlType?: "button" | "submit" | "reset";
	children: React.ReactNode;
	disabled?: boolean;
	onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
	variant?: "text" | "contained";
}) => {
	const array = Children.toArray(children).slice(0);
	const base =
		"transition-all duration-200 ease-out disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-900";

	const styles: Record<string, Record<string, string>> = {
		simple: {
			contained:
				"m-auto flex items-center rounded-xl bg-primary-400 px-4 py-2.5 text-sm font-semibold text-secondary-900 enabled:hover:bg-primary-300 enabled:hover:shadow-glow",
			text: "flex items-center rounded-xl bg-secondary-700 px-3 py-2.5 text-sm font-medium text-secondary-50 enabled:hover:bg-secondary-600",
		},
		primary: {
			contained:
				"flex items-center gap-2 rounded-xl bg-primary-400 px-5 py-2.5 text-sm font-semibold text-secondary-900 enabled:hover:bg-primary-300 enabled:hover:shadow-glow",
			text: "flex items-center gap-2 rounded-xl bg-secondary-700 px-5 py-2.5 text-sm font-medium text-secondary-50 enabled:hover:bg-secondary-600",
		},
		secondary: {
			contained:
				"flex items-center gap-2 rounded-xl border border-primary-400/50 bg-transparent px-5 py-2.5 text-sm font-semibold text-primary-400 enabled:hover:bg-primary-400 enabled:hover:text-secondary-900 enabled:hover:shadow-glow",
			text: "flex items-center gap-2 rounded-xl bg-secondary-700 px-5 py-2.5 text-sm font-medium text-secondary-50 enabled:hover:bg-secondary-600",
		},
		success: {
			contained:
				"flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white enabled:hover:bg-emerald-400",
			text: "",
		},
		danger: {
			contained:
				"flex items-center gap-2 rounded-xl bg-red-500/90 px-5 py-2.5 text-sm font-semibold text-white enabled:hover:bg-red-400",
			text: "",
		},
		cuation: {
			contained:
				"flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-secondary-900 enabled:hover:bg-amber-300",
			text: "",
		},
	};

	const style = styles[type]?.[variant] || styles.primary.contained;

	return (
		<button
			className={twMerge(
				base,
				style,
				className,
				array?.length === 1 && "justify-center"
			)}
			disabled={disabled}
			onClick={onClick}
			type={htmlType}
		>
			{children}
		</button>
	);
};

export default Button;
