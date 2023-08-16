"use client";
import { useEffect, useRef, useState, useContext } from "react";
import axios from "axios";
import { Button, Input } from "@/components";
import { twMerge } from "tailwind-merge";
import { AppContext } from "@/context/app.context";

const TwoFactorAuth = ({ tfaOk }: { tfaOk: () => void }) => {
	const { updateUser, updateAccessToken } = useContext(AppContext);
	const [code, setCode] = useState<string>("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [inputsError, setInputsError] = useState(false);

	const inputsRef = [
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
	];

	useEffect(() => {
		setTimeout(() => {
			inputsRef[0].current?.focus();
		}, 1350);
	}, []);

	useEffect(() => {
		if (code.length === 6) {
			inputsRef[5].current?.blur();
			handleCodeSubmit();
		}
	}, [code]);

	const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Backspace" || event.key === "Delete") {
			event.preventDefault();

			if (index > 0 && !code[index]) inputsRef[index - 1].current?.focus();
			setCode((prev) => {
				let newCode = prev.split("");
				if (newCode[index]) newCode[index] = "";
				else if (newCode[index - 1]) newCode[index - 1] = "";
				return newCode.join("");
			});
		}
	};

	const handleInputChange = (index: number, value: string) => {
		if (/^[0-9]$/.test(value)) {
			if (value.length === 1) {
				if (code.length < 5) inputsRef[code.length + 1].current?.focus();
				setCode((prev) => {
					let newCode = prev.split("");
					newCode[index] = value;
					return newCode.join("");
				});
			}
		}
	};

	const handleCodeSubmit = async () => {
		try {
			setLoading(true);
			await axios.post(
				`${process.env.NEXT_PUBLIC_BACK_END_URL}api/auth/2fa/verify`,
				{ code },
				{
					withCredentials: true,
				}
			);
			setError("");
			setSuccess(true);
			updateAccessToken();
			await updateUser();
			tfaOk();
		} catch (_e: any) {
			if (_e.response?.data.message) setError(_e.response.data.message);
			else setError("Something went wrong...");
			setInputsError(true);
			setLoading(false);
			setTimeout(() => {
				setInputsError(false);
				inputsRef[5].current?.focus();
			}, 1000);
		}
	};

	return (
		<div className="grid place-items-center justify-center w-full h-full">
			<div className="flex flex-col items-center justify-center w-full max-w-sm md:max-w-md lg:max-w-lg gap-4 px-16 py-12 text-white">
				<div className="flex flex-col items-center gap-2 text-center">
					<h1 className="text-2xl">Two-Factor Authentication</h1>
					<p className=" text-tertiary-200">
						Enter 6-digit code from your two factor authenticator App
					</p>
				</div>
				<div
					className="flex gap-1 md:gap-2"
					onPaste={(event) => {
						event.preventDefault();
						const pastedData = event.clipboardData.getData("Text");
						setCode(pastedData);
					}}
				>
					{[...Array(6)].map((_, i) => (
						<Input
							key={i}
							isError={inputsError}
							className={twMerge("text-center", loading && "animate-pulse")}
							MaxLength={1}
							inputRef={inputsRef[i]}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
								handleInputChange(i, e.target.value);
							}}
							onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
								handleKeyDown(i, e);
							}}
							value={code[i] || ""}
							disabled={loading}
							success={success}
						/>
					))}
				</div>
				{error && (
					<p className="text-xs text-red-600 dark:text-red-500 font-medium">{error}</p>
				)}
				<Button
					className={twMerge(
						"w-full justify-center",
						success && "bg-green-700 text-white disabled:cursor-wait"
					)}
					onClick={handleCodeSubmit}
					disabled={loading || code.length !== 6 || inputsError}
				>
					Submit
				</Button>
				<Button
					variant="text"
					disabled={loading || code.length === 0}
					className="w-full justify-center"
					onClick={() => {
						setCode("");
						setError("");
						inputsRef[0].current?.focus();
					}}
				>
					Reset
				</Button>
			</div>
		</div>
	);
};

export default TwoFactorAuth;
