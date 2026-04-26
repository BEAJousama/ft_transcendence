"use client";

import { Eye, EyeOff } from "lucide-react";
import { InputHTMLAttributes, RefObject, useState, ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	className?: string;
	label?: string;
	htmlType?: string;
	error?: string;
	value?: string;
	placeholder?: string;
	onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
	onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
	options?: {
		value: string;
		label: string;
	}[];
	pattern?: string;
	isError?: boolean;
	inputRef?: RefObject<HTMLInputElement>;
	MaxLength?: number;
	hidden?: boolean;
	disabled?: boolean;
	required?: boolean;
	name?: string;
	id?: string;
	type?: string;
	success?: boolean;
	defaultValue?: string;
}

const Input = ({
	inputRef,
	className,
	label,
	error,
	name,
	value,
	onChange,
	onKeyDown,
	onBlur,
	htmlType = "text",
	placeholder,
	options,
	pattern,
	MaxLength,
	id,
	isError,
	hidden,
	disabled,
	defaultValue,
	type = "text",
	success = false,
	required,
}: InputProps) => {
	const [showPassword, setShowPassword] = useState(false);
	return (
		<>
			{type !== "select" && (
				<div className={twMerge("relative w-full")}>
					<input
						type={
							htmlType === "password"
								? showPassword
									? "text"
									: "password"
								: htmlType
						}
						className={twMerge(
							`peer m-0 block h-[52px] w-full rounded-xl border border-white/[0.08] bg-secondary-800/80 bg-clip-padding px-3.5 py-3.5 text-[15px] font-medium leading-tight text-secondary-50
          transition ease-out placeholder:text-transparent focus:outline-none
          focus:border-primary-400/60 focus:text-secondary-50 focus:ring-1 focus:ring-primary-400/30 peer-focus:text-primary-400`,
							label &&
								`focus:pb-[0.5rem] focus:pt-[1.5rem] [&:not(:placeholder-shown)]:pb-[0.5rem] [&:not(:placeholder-shown)]:pt-[1.5rem]`,
							isError && `border-red-500/60 text-red-400 animate-[pulse_1s]`,
							value &&
								`disabled:cursor-not-allowed disabled:border-primary-700/40 disabled:text-primary-700`,
							!value && `disabled:cursor-not-allowed disabled:border-white/[0.06] disabled:text-secondary-400`,
							success &&
								`border-green-500/60 text-green-400 disabled:border-green-500/60 disabled:text-green-400`,
							className
						)}
						id={id}
						name={name}
						required={required}
						disabled={disabled}
						placeholder={""}
						value={value}
						onChange={onChange}
						onKeyDown={onKeyDown}
						pattern={pattern}
						maxLength={MaxLength}
						hidden={hidden}
						ref={inputRef}
						onBlur={onBlur}
					/>
					{htmlType === "password" && (
						<div
							className={twMerge(
								"absolute right-0 top-0 h-full flex items-center justify-center pr-3.5 cursor-pointer",
								error && "-top-3"
							)}
							onClick={() => setShowPassword(!showPassword)}
						>
							{!showPassword && (
								<EyeOff className="w-5 h-5 text-secondary-400 opacity-70" />
							)}
							{showPassword && <Eye className="w-5 h-5 text-primary-400" />}
						</div>
					)}
					{label && (
						<label
							htmlFor={id}
							className={twMerge(
								`pointer-events-none absolute left-0 top-0 origin-[0_0] border border-solid border-transparent px-3.5 py-3.5 transition-[opacity,_transform]
     ease-out peer-focus:-translate-y-2 peer-focus:translate-x-[0.15rem] peer-focus:scale-[0.85] peer-focus:text-primary-400 peer-[:not(:placeholder-shown)]:-translate-y-2
        peer-[:not(:placeholder-shown)]:translate-x-[0.15rem] peer-[:not(:placeholder-shown)]:scale-[0.85] motion-reduce:transition-none text-secondary-400 text-sm`,
								disabled && value && "text-primary-700",
								isError && "text-red-400",
								success && `text-green-400`
							)}
						>
							{label}
						</label>
					)}
					{error && (
						<p className="mt-1.5 text-xs text-red-400">
							<span className="font-medium">{error}</span>
						</p>
					)}
				</div>
			)}
			{type === "select" && (
				<div className="flex flex-col gap-2 w-full ">
					{label && (
						<label
							htmlFor="countries"
							className="block text-sm font-medium text-secondary-200"
						>
							{label}
						</label>
					)}
					<select
						id="countries"
						className={twMerge(
							"block w-full rounded-xl bg-secondary-800 border border-white/[0.08] text-secondary-50 px-4 py-3 text-sm focus:outline-none focus:border-primary-400/60 focus:ring-1 focus:ring-primary-400/30",
							className
						)}
						value={value}
						defaultValue={defaultValue}
						onChange={(e: any) => {
							onChange && onChange(e);
						}}
					>
						{options &&
							options.map((item, i) => {
								return (
									<option
										key={i}
										className="w-full px-4 py-2 border-b"
										value={item.value}
									>
										{item.label}
									</option>
								);
							})}
					</select>
				</div>
			)}
		</>
	);
};

export default Input;
