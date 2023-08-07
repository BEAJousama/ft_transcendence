"use client";

import { useState, KeyboardEvent } from "react";
import { Button, Input, Spinner } from "@/components";
import axios from "axios";
import { useFormik } from "formik";
import Link from "next/link";

const Login = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState("");

	const formik = useFormik({
		initialValues: {
			username: "",
			password: "",
		},
		validateOnChange: false,
		validateOnBlur: true,
		validate: (values) => {
			const errors: {
				username?: string;
				password?: string;
			} = {};

			if (!values.username) {
				errors.username = "Please enter your username";
			}
			if (!values.password) {
				errors.password = "Please enter your password";
			}

			return errors;
		},
		onSubmit: async (values) => {},
	});

	const handleLogin = async () => {
		setLoading(true);
		try {
			setError("");
			formik.validateForm();

			if (
				Object.keys(formik.errors).length > 0 ||
				Object.keys(await formik.validateForm()).length > 0
			) {
				return;
			}
			const res = await axios.post(`${process.env.NEXT_PUBLIC_BACK_END_URL}api/auth/signin`, {
				username: formik.values.username,
				password: formik.values.password,
			});
		} catch (_e) {
			setError("Incorrect username or password");
			console.log(_e);
		}
		setLoading(false);
	};

	const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter") {
			handleLogin();
		}
	};

	return (
		<div className="grid place-items-center w-full">
			<div className="flex flex-col items-center justify-center w-full max-w-sm md:max-w-md lg:max-w-lg gap-4 px-8 py-12 text-white">
				<h1 className="text-2xl">Welcome Back</h1>
				<p className=" text-tertiary-200">Please enter your credentials</p>
				<Input
					value={formik.values.username}
					error={formik.errors.username}
					isError={!!formik.errors.username}
					onChange={formik.handleChange}
					name="username"
					label="Username"
					onBlur={formik.handleBlur}
				/>
				<Input
					value={formik.values.password}
					error={formik.errors.password}
					isError={!!formik.errors.password}
					onChange={formik.handleChange}
					name="password"
					label="Password"
					htmlType="password"
					onBlur={formik.handleBlur}
				/>
				{error && (
					<p className="mt-2 text-xs text-red-600 dark:text-red-500">
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
							loading || !formik.values.username || !formik.values.password || !!error
						}
					>
						Sign in
					</Button>
				</div>
				<div className="flex w-full items-center gap-2">
					<hr className="w-[70%] border-gray-500" />
					or
					<hr className="w-[70%] border-gray-500" />
				</div>
				<div className="flex w-full justify-center gap-4 md:flex-col">
					<Link href={`${process.env.NEXT_PUBLIC_BACK_END_URL}api/auth/42/callback`}>
						<Button
							type="secondary"
							className="h-14 w-14 justify-center rounded-xl md:h-auto md:w-full text-sm backdrop-blur-sm"
						>
							<img src="/img/42Logo-light.svg" alt="logo" width={30} />
							<p className="hidden md:block">Continue with Intra</p>
						</Button>
					</Link>
					<Link href={`${process.env.NEXT_PUBLIC_BACK_END_URL}api/auth/google/login`}>
						<Button
							type="secondary"
							className="h-14 w-14 justify-center rounded-xl md:h-auto md:w-full text-sm backdrop-blur-sm"
						>
							<img src="/img/google.svg" alt="logo" width={30} />
							<p className="hidden md:block">Continue with Google</p>
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default Login;
