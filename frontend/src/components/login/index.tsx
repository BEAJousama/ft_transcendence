"use client";

import React, { useContext, useEffect, useState } from "react";

import { Button, Input } from "@/components";
import axios from "axios";
import { useFormik } from "formik";
import { AppContext, getCookieItem, setCookieItem } from "@/context/app.context";
import Image from "next/image";
import { twMerge } from "tailwind-merge";

const SSO: { key: "42" | "google"; name: string; url: string }[] = [
	{
		key: "42",
		name: "Intra",
		url: `${process.env.BACK_END_URL}api/auth/42/callback`,
	},
	{
		key: "google",
		name: "Google",
		url: `${process.env.BACK_END_URL}api/auth/google/login`,
	},
];

const Login = ({
	setSelectable,
	setState,
	loginOk,
	disabled,
}: {
	setSelectable: React.Dispatch<React.SetStateAction<boolean>>;
	setState: React.Dispatch<React.SetStateAction<"login" | "register" | "2fa" | "complete">>;
	loginOk: () => void;
	disabled: boolean;
}) => {
	const { updateUser, updateAccessToken } = useContext(AppContext);
	const [loading, setLoading] = useState<"" | "internal" | "42" | "google">("");
	const [success, setSuccess] = useState<"" | "internal" | "42" | "google">("");
	const [error, setError] = useState<"" | "internal" | "42" | "google">("");
	const [invalidCreds, setInvalidCreds] = useState<string>("");


	useEffect(() => {
		if (getCookieItem("2fa_access_token")) {
			setSelectable(false);
			setLoading("internal");
			setState("2fa");
		}
	}, []);

	const connectClick = (e: any, key: "42" | "google", url: string) => {
		setLoading(key);
		window.location.href = url;
	};



	const formik = useFormik({
		initialValues: {
			username: "",
			password: "",
		},
		validate: (values) => {
			const errors = {
				username: "",
				password: "",
			};
			if (!values.username || values.username.length < 3 || values.username.length > 20)
				errors.username = "error";
			if (!values.password || values.password.length < 8) errors.password = "error";
			return errors;
		},
		validateOnBlur: true,
		validateOnChange: true,
		onSubmit: async (values) => {},
	});

	const handleLogin = async () => {
		const handleError = (_error: string) => {
			setError("internal");
			setSelectable(true);
			setTimeout(() => {
				setError("");
			}, 2000);
			if (!invalidCreds) setInvalidCreds(_error);
			setLoading("");
			return;
		};
		try {
			setLoading("internal");
			setSelectable(false);
			const errors = await formik.validateForm();

			if (
				Object.values(formik.values).some((value) => value === "") ||
				Object.values(formik.errors).some((value) => value !== "") ||
				Object.values(errors).some((value) => value !== "")
			)
				handleError("Please fill in valid credentials");
			const res = await axios.post(`${process.env.BACK_END_URL}api/auth/signin`, {
				username: formik.values.username,
				password: formik.values.password,
			});
			if (res.data) {
				setCookieItem(res.data.name, res.data.value);
				setSuccess("internal");
				setInvalidCreds("");
				if (res.data.name === "2fa_access_token") setState("2fa");
				else {
					updateAccessToken();
					await updateUser();
					if (getCookieItem("complete_info")) setState("complete");
					else loginOk();
				}
			} else {
				handleError("Please fill in valid credentials");
			}
		} catch (_e: any) {
			handleError(_e.response?.data.message || "Something went wrong...");
		}
	};

	return (
		<div className="grid place-items-center w-full h-full">
			<div className="flex flex-col items-center justify-center w-full max-w-sm md:max-w-md lg:max-w-lg gap-4 px-8 py-12 text-white">
				<h1 className="text-2xl">Welcome Back</h1>
				<p className=" text-tertiary-200">Please enter your credentials</p>
				<Input
					name="username"
					label="Username"
					value={formik.values.username}
					onChange={formik.handleChange}
					onBlur={formik.handleBlur}
					success={success === "internal"}
					disabled={disabled || !!loading || !!success}
					isError={error === "internal"}
				/>
				<Input
					name="password"
					label="Password"
					htmlType="password"
					value={formik.values.password}
					onChange={formik.handleChange}
					onBlur={formik.handleBlur}
					success={success === "internal"}
					disabled={disabled || !!loading || !!success}
					isError={error === "internal"}
				/>
				{!!invalidCreds && (
					<p
						className={twMerge(
							"text-xs text-red-600 dark:text-red-500 font-medium",
							invalidCreds && "animate-[pulse_1s]"
						)}
					>
						{invalidCreds}
					</p>
				)}
				<Button
					className={twMerge(
						"w-full",
						loading === "internal" && "animate-pulse disabled:cursor-wait"
					)}
					onClick={handleLogin}
					type={
						!!success && success === "internal"
							? "success"
							: error === "internal"
							? "danger"
							: "primary"
					}
					disabled={
						disabled ||
						!!loading ||
						!!success ||
						error === "internal" ||
						Object.values(formik.values).some((value) => value === "") ||
						Object.values(formik.errors).some((value) => value !== "")
					}
				>
					Sign in
				</Button>
				<div className="flex w-full items-center gap-2">
					<hr className="w-[70%] border-gray-400" />
					or
					<hr className="w-[70%] border-gray-400" />
				</div>
				<div className="flex w-full justify-center gap-4 md:flex-col">
					{SSO.map((sso) => (
						<Button
							key={sso.key}
							onClick={(e) => connectClick(e, sso.key, sso.url)}
							type="secondary"
							disabled={disabled || !!loading || !!success || error === sso.key}
							className={twMerge(
								"h-14 w-14 justify-center rounded-xl md:h-auto md:w-full text-sm backdrop-blur-sm transition",
								loading === sso.key && "animate-pulse disabled:cursor-wait",
								error === sso.key && "border-red-700 text-red-700",
								success === sso.key && "border-transparent text-white bg-green-700"
							)}
						>
							<Image src={`/img/${sso.key}.svg`} alt="logo" width={28} height={28} />
							<p className="hidden md:block">Continue with {sso.name}</p>
						</Button>
					))}
				</div>
			</div>
		</div>
	);
};

export default Login;
