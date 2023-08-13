"use client";
import { useContext, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppContext } from "@/context/app.context";
import axios from "axios";
import { toast } from "react-toastify";
import { Button, Input } from "@/components";

const TwoFactorAuth = () => {
	const { fetchUser, setAuthenticated } = useContext(AppContext);
	const [code, setCode] = useState("");
	const router = useRouter();
	const [error, setError] = useState("");
	const [shouldRedirect, setShouldRedirect] = useState<boolean>();

	useEffect(() => {
		if (shouldRedirect) {
			router.push("/app");
		}
	}, [shouldRedirect]);

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
			<div className="flex flex-col items-center justify-center w-full max-w-sm md:max-w-md lg:max-w-lg gap-4 px-16 py-12 text-white">
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
					{[...Array(6)].map((_, i) => (
						<Input
							key={i}
							isError={error ? true : false}
							className="text-center"
							MaxLength={1}
							inputRef={inputsRef[i]}
							onChange={(e) => {
								handleInputChange(i, e.target.value);
							}}
							value={code[i] || ""}
						/>
					))}
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
							setShouldRedirect(true);
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
