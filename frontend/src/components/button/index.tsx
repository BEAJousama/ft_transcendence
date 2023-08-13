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
	return (
		<>
			{type === "simple" && (
				<>
					<button
						className={twMerge(
							"transition disabled:opacity-80 disabled:grayscale-[20%] disabled:cursor-not-allowed",
							variant === "contained" &&
								"duration-400 m-auto flex items-center rounded bg-primary-500 p-2  font-bold text-secondary-500 transition ease-in-out enabled:hover:bg-secondary-200",
							variant === "text" &&
								"flex items-center rounded bg-white  font-semibold text-gray-800 enabled:hover:bg-secondary-200",
							className,
							array?.length === 1 && "!justify-center"
						)}
						disabled={disabled}
						onClick={onClick}
						type={htmlType}
					>
						{children}
					</button>
				</>
			)}
			{type === "primary" && (
				<>
					<button
						className={twMerge(
							"transition disabled:opacity-80 disabled:grayscale-[20%] disabled:cursor-not-allowed",
							variant === "contained" &&
								"duration-400 flex items-center gap-4 rounded bg-primary-500 px-4 py-2 font-bold text-secondary-500 transition ease-in-out enabled:hover:scale-105 enabled:hover:shadow-[0px_0px_6px] enabled:hover:shadow-primary-500 enabled:hover:ring-2 enabled:hover:ring-primary-500 enabled:hover:ring-opacity-40",
							variant === "text" &&
								"flex items-center gap-4 rounded bg-white px-4 py-2 font-semibold text-gray-800 enabled:hover:bg-gray-200",
							className,
							array?.length === 1 && "justify-center"
						)}
						disabled={disabled}
						onClick={onClick}
						type={htmlType}
					>
						{children}
					</button>
				</>
			)}
			{type === "secondary" && (
				<>
					<button
						className={twMerge(
							"transition disabled:opacity-80 disabled:grayscale-[20%] disabled:cursor-not-allowed",
							variant === "contained" &&
								"duration-400 flex items-center gap-4 rounded border-2 border-primary-500 bg-inherit px-4 py-2 font-bold text-primary-500 transition ease-in-out enabled:hover:scale-105 enabled:hover:bg-primary-500 enabled:hover:text-secondary-500 enabled:hover:shadow-[0px_0px_6px] enabled:hover:shadow-primary-500",
							variant === "text" &&
								"flex items-center gap-4 rounded bg-white px-4 py-2 font-semibold text-gray-800 enabled:hover:bg-gray-200",
							className,
							array?.length === 1 && "justify-center"
						)}
						disabled={disabled}
						onClick={onClick}
						type={htmlType}
					>
						{children}
					</button>
				</>
			)}

			{type === "success" && (
				<>
					<button
						className={twMerge(
							"transition disabled:opacity-80 disabled:grayscale-[20%] disabled:cursor-not-allowed",
							`flex items-center gap-4 rounded bg-green-500 px-4 py-2 font-bold text-white enabled:hover:bg-green-700`,
							className,
							disabled && "opacity-80 grayscale-[30%] cursor-not-allowed",
							array?.length === 1 && "justify-center"
						)}
						disabled={disabled}
						onClick={onClick}
						type={htmlType}
					>
						{children}
					</button>
				</>
			)}
			{type === "danger" && (
				<>
					<button
						className={twMerge(
							"transition disabled:opacity-80 disabled:grayscale-[20%] disabled:cursor-not-allowed",
							`flex items-center gap-4 rounded bg-red-500 px-4 py-2 font-bold text-white enabled:hover:bg-red-700`,
							className,
							disabled && "opacity-80 grayscale-[30%] cursor-not-allowed",
							array?.length === 1 && "justify-center"
						)}
						disabled={disabled}
						onClick={onClick}
						type={htmlType}
					>
						{children}
					</button>
				</>
			)}
			{type === "cuation" && (
				<>
					<button
						className={twMerge(
							"transition disabled:opacity-80 disabled:grayscale-[20%] disabled:cursor-not-allowed",
							`flex items-center gap-4 rounded bg-yellow-500 px-4 py-2 font-bold text-white enabled:hover:bg-yellow-700`,
							className,
							disabled && "opacity-80 grayscale-[30%] cursor-not-allowed",
							array?.length === 1 && "justify-center"
						)}
						disabled={disabled}
						onClick={onClick}
						type={htmlType}
					>
						{children}
					</button>
				</>
			)}
		</>
	);
};

export default Button;
