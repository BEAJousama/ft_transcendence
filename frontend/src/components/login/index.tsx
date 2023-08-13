"use client";

import React, { MouseEvent, useEffect, useState } from "react";
import { Button, Input } from "@/components";
import axios from "axios";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { setCookieItem } from "@/context/app.context";

const Spinner = dynamic(() => import("@/components/").then((mod) => mod.Spinner), { ssr: false });

const Login = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [success, setSuccess] = useState<boolean>(false);
	const [error, setError] = useState("");
	const router = useRouter();

	const [externalPopup, setExternalPopup] = useState<Window | null>(null);

	const connectClick = (e: any) => {
		const width = 500;
		const height = 400;
		const left = window.screenX + (window.outerWidth - width) / 2;
		const top = window.screenY + (window.outerHeight - height) / 2.5;
		const title = "WINDOW TITLE";
		// const url = `localhost`;
		const url = `${process.env.NEXT_PUBLIC_BACK_END_URL}api/auth/42/callback`;
		const popup = window.open(
			url,
			title,
			`popup=true,noopener,noreferrer,toolbar=0,scrollbars=1,status=1,resizable=1,location=1,menuBar=0,
			width=${width},height=${height},left=${left},top=${top}`
		);
		setExternalPopup(popup);
	};

	useEffect(() => {
		console.log("useEffect");
		if (!externalPopup || externalPopup.closed) return;
		const checkPopup = setInterval(() => {
			console.log("checking popup");
			if (externalPopup.window.location.href.includes(`e2r2p11.1337.ma:5000`)) {
				console.log("success, closing popup");
				clearInterval(checkPopup);
				externalPopup.close();
				router.push("/home");
			}
		}, 500);
	}, [externalPopup]);

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
		try {
			setLoading(true);
			setError("");
			formik.validateForm();

			if (
				Object.values(formik.values).some((value) => value === "") ||
				Object.values(formik.errors).some((value) => value !== "")
			) {
				setError("Please enter a valid username and password");
				setLoading(false);
				return;
			}
			const res = await axios.post(`${process.env.NEXT_PUBLIC_BACK_END_URL}api/auth/signin`, {
				username: formik.values.username,
				password: formik.values.password,
			});
			if (res.data.error) {
				setError("Incorrect username or password");
				setLoading(false);
				return;
			}
			setSuccess(true);
			if (res.data) {
				setCookieItem("access_token", res.data.access_token);
				// updateUser();
			}
		} catch (_e) {
			setError("Incorrect username or password");
			setLoading(false);
			console.log(_e);
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
					success={success}
				/>
				<Input
					name="password"
					label="Password"
					htmlType="password"
					value={formik.values.password}
					onChange={formik.handleChange}
					onBlur={formik.handleBlur}
					success={success}
				/>
				{error && (
					<p className={"mt-2 text-xs text-red-600 dark:text-red-500 animate-[pulse_1s]"}>
						<span className="font-medium">{error}</span>
					</p>
				)}
				<div className="relative flex w-full">
					{loading && (
						<Spinner className="absolute flex items-center justify-center w-1/3 h-full transition duration-300 ease-out z-10 backdrop-blur-[2px] inset-x-1/3" />
					)}
					<Button
						className="relative w-full"
						onClick={handleLogin}
						disabled={
							loading ||
							success ||
							Object.values(formik.values).some((value) => value === "") ||
							Object.values(formik.errors).some((value) => value !== "")
						}
					>
						Sign in
					</Button>
				</div>
				<div className="flex w-full items-center gap-2">
					<hr className="w-[70%] border-gray-400" />
					or
					<hr className="w-[70%] border-gray-400" />
				</div>
				<div className="flex w-full justify-center gap-4 md:flex-col">
					{/* <Link href={`${process.env.NEXT_PUBLIC_BACK_END_URL}api/auth/42/callback`}> */}
					<Button
						onClick={connectClick}
						type="secondary"
						disabled={loading}
						className="h-14 w-14 justify-center rounded-xl md:h-auto md:w-full text-sm backdrop-blur-sm"
					>
						<Image src="/img/42Logo-light.svg" alt="logo" width={30} height={30} />
						<p className="hidden md:block">Continue with Intra</p>
					</Button>
					{/* </Link> */}
					{/* <Link href={`${process.env.NEXT_PUBLIC_BACK_END_URL}api/auth/google/login`}> */}
					<Button
						onClick={connectClick}
						type="secondary"
						disabled={loading}
						className="h-14 w-14 justify-center rounded-xl md:h-auto md:w-full text-sm backdrop-blur-sm"
					>
						<Image src="/img/google.svg" alt="logo" width={30} height={30} />
						<p className="hidden md:block">Continue with Google</p>
					</Button>
					{/* </Link> */}
				</div>
			</div>
		</div>
	);
};

export default Login;
