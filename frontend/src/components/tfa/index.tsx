"use client";
import axios from "axios";
import { Button, Card, Input } from "..";
import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../context/app.context";
import { redirect, useRouter } from "next/navigation";
import { toast } from "react-toastify";

const TwoFactorAuth = () => {
	const { fetchUser, setAuthenticated } = useContext(AppContext);
	const [code, setCode] = useState("");
	const router = useRouter();
	const [error, setError] = useState("");

	const inputsRef = [
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
	];

	const handleInputChange = (index: number, value: string) => {
		setCode((prev) => {
			const newCode = prev.slice(0, index) + "" + prev.slice(index + 1);
			return newCode;
		});
		if (value.length === 1) {
			setCode((prev) => {
				const newCode = prev.slice(0, index) + value + prev.slice(index + 1);
				return newCode;
			});
			if (inputsRef && inputsRef[index + 1]) {
				inputsRef[index + 1].current?.focus();
			}
		}
	};

	return (
		<div className="grid place-items-center justify-center w-full h-full">
			<div
				className="flex flex-col items-center justify-center w-full max-w-sm md:max-w-md lg:max-w-lg gap-4 px-16 py-12 text-white"
			// onKeyDown={handleKeyPress}
			>
				<div className="flex flex-col items-center gap-2 text-center">
					<h1 className="text-2xl">Two-Factor Authentication</h1>
					<p className=" text-tertiary-200">
						Open the two-step verification app on your mobile device to get your
						verification code
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
					<Input
						isError={error ? true : false}
						className="text-center"
						MaxLength={1}
						inputRef={inputsRef[0]}
						onChange={(e) => {
							handleInputChange(0, e.target.value);
						}}
						value={code[0] || ""}
					/>
					<Input
						isError={error ? true : false}
						className="text-center"
						MaxLength={1}
						inputRef={inputsRef[1]}
						onChange={(e) => {
							handleInputChange(1, e.target.value);
						}}
						value={code[1] || ""}
					/>
					<Input
						isError={error ? true : false}
						className="text-center"
						MaxLength={1}
						inputRef={inputsRef[2]}
						onChange={(e) => {
							handleInputChange(2, e.target.value);
						}}
						value={code[2] || ""}
					/>
					<Input
						isError={error ? true : false}
						className="text-center"
						MaxLength={1}
						inputRef={inputsRef[3]}
						onChange={(e) => {
							handleInputChange(3, e.target.value);
						}}
						value={code[3] || ""}
					/>
					<Input
						isError={error ? true : false}
						className="text-center"
						MaxLength={1}
						inputRef={inputsRef[4]}
						onChange={(e) => {
							handleInputChange(4, e.target.value);
						}}
						value={code[4] || ""}
					/>
					<Input
						isError={error ? true : false}
						className="text-center"
						MaxLength={1}
						inputRef={inputsRef[5]}
						onChange={(e) => {
							handleInputChange(5, e.target.value);
						}}
						value={code[5] || ""}
					/>
				</div>
				<Button
					className="w-full justify-center"
					onClick={async () => {
						try {

							await axios.post(
								`${process.env.NEXT_PUBLIC_BACK_END_URL}api/auth/2fa/verify`,
								{ code },
								{
									withCredentials: true,
								}
							);
							await fetchUser();
							setAuthenticated(true);
							router.push("/home");
						} catch (error) {
							console.log(error);
							toast.error("Invalid Code");
						}
					}}
				>
					Authenticate
				</Button>

				<Button
					variant="text"
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
