"use client";

import Button from "../button";
import axios from "axios";
import { useContext, useState } from "react";
import QrCode from "../qr-code";
import Input from "../input";
import { AppContext } from "@/context/app.context";
import { toast } from "react-toastify";

const ActivateTfa = () => {
	const { updateUser } = useContext(AppContext);
	const [error, setError] = useState("");
	const [code, setCode] = useState("");
	const { user } = useContext(AppContext);

	const toogleTfa = async (url: string) => {
		try {
			setError("");
			const response = await axios.post(
				url,
				{ code },
				{
					withCredentials: true,
				}
			);
			if (response.data.message === "success") {
				await updateUser();

				toast.success(
					`Two Factor Authentication ${
						!user?.twoFactorAuth ? "Avtivated" : "deactivated"
					} successfully`
				);
				return;
			}
			console.log(response.data);
			toast.error("Invalid Code");
			setError("Invalid Code");
		} catch (error) {
			console.log(error);
			toast.error("Somthing Went Wrong !!!");
		}
	};
	return (
		<div className="flex w-full flex-col items-center justify-center gap-4 p-4 text-quaternary-200">
			<span className="text-xl text-center">Two Factor Authentication</span>
			<QrCode />
			<div className="text-center">
				Enter 6-digit code from your two factor authenticator App
			</div>
			<div className="flex w-full max-w-md flex-col gap-4">
				<Input
					className="text-center"
					MaxLength={6}
					name="code"
					value={code}
					onChange={(e) => {
						setCode(e.target.value);
					}}
					isError={!!error}
				/>
				<div className="flex w-full items-center justify-center gap-4">
					<Button
						className="w-full justify-center"
						type="success"
						disabled={user?.twoFactorAuth}
						onClick={() => {
							toogleTfa(
								`${process.env.NEXT_PUBLIC_BACK_END_URL}api/auth/2fa/turn-on`
							);
						}}
					>
						Turn On
					</Button>
					<Button
						className="w-full justify-center"
						type="danger"
						disabled={!user?.twoFactorAuth}
						onClick={() => {
							toogleTfa(
								`${process.env.NEXT_PUBLIC_BACK_END_URL}api/auth/2fa/turn-off`
							);
						}}
					>
						Turn Off
					</Button>
				</div>
			</div>
		</div>
	);
};

export default ActivateTfa;
