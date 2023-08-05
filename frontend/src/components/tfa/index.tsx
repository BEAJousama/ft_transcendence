import axios from "axios";
import { Button, Card, Input } from "..";
import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../context/app.context";
import { redirect } from "next/navigation";

interface TwoFactorAuthProps {
	selected?: boolean;
}

const TwoFactorAuth = ({ selected = true }: TwoFactorAuthProps) => {
	const { fetchUser, authenticated, setAuthenticated } = useContext(AppContext);
	const [code, setCode] = useState("");
	const [error, setError] = useState("");
	const [show, setShow] = useState<boolean>(selected);

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

	useEffect(() => {
		if (!selected) {
			setTimeout(() => {
				setShow(false);
			}, 700);
		} else {
			setShow(true);
		}
	}, [selected]);

	return (
		// <div className="flex h-screen w-screen flex-col items-center justify-center gap-5 bg-secondary-800 text-gray-200">
		<div className="grid place-items-center w-full">
			{show && (
				<div
					className="flex flex-col items-center justify-center w-full max-w-sm md:max-w-md lg:max-w-lg gap-4 px-16 py-12 text-white"
					// onKeyDown={handleKeyPress}
				>
					<div className="flex flex-col items-center gap-2 text-center">
						<h1 className="text-2xl">Tow-Factor Authentication</h1>
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
					{error && (
						<p className="w-full pl-4 text-left text-xs font-medium text-red-600 dark:text-red-500">
							{error}
						</p>
					)}
					<Button
						className="w-full justify-center"
						onClick={async () => {
							try {
								const accessToken =
									window.localStorage?.getItem("2fa_access_token");
								const response = await axios.post(
									`${process.env.NEXT_PUBLIC_BACK_END_URL}api/auth/2fa/verify`,
									{ code },
									{
										withCredentials: true,
									}
								);

								if (response.data) {
									// window.localStorage?.setItem(
									// 	"access_token",
									// 	response.data.access_token
									// );
									// await fetchUser();
									setAuthenticated(true);
									redirect("/home");
								}

								setError("Invalid Code");
							} catch (error) {
								setError("Invalid Code");
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
			)}
		</div>
	);
};

export default TwoFactorAuth;
