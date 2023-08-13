"use client";

import { useState } from "react";
import { Button, Input, Spinner } from "@/components";
import axios from "axios";
import { z } from "zod";
import { useFormik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";

const loginFormSchema = z.object({
	username: z
		.string({
			required_error: "Please enter your username",
			invalid_type_error: "Please enter a valid username",
		})
		.min(3)
		.max(20),
	password: z.string({
		required_error: "Please enter your password",
	}),
});

const Login = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [success, setSuccess] = useState<boolean>(false);
	const [submitCount, setSubmitCount] = useState<number>(0);
	const [error, setError] = useState("");
	const router = useRouter();

	const formik = useFormik({
		initialValues: {
			username: "",
			password: "",
		},
		validationSchema: toFormikValidationSchema(loginFormSchema),
		validateOnBlur: submitCount !== 0,
		validateOnChange: submitCount !== 0,
		onSubmit: async (values) => { },
	});

	const handleLogin = async () => {
		try {
			setLoading(true);
			setSubmitCount((prev) => prev + 1);
			setError("");
			formik.validateForm();

			if (
				Object.keys(formik.errors).length > 0 ||
				Object.keys(await formik.validateForm()).length > 0
			) {
				setError("Please enter a valid username and password");
				setLoading(false);
				return;
			}
			const res = await axios.post(`${process.env.NEXT_PUBLIC_BACK_END_URL}api/auth/signin`, {
				username: formik.values.username,
				password: formik.values.password,
			});
			setSuccess(true);
			if (res.data) {
				document.cookie = `${res.data.name}=${res.data.value}; Path=/;`;
				setTimeout(() => {
					router.push("/home");
				}, 1000);
			}
		} catch (_e) {
			setError("Incorrect username or password");
			setLoading(false);
			console.log(_e);
		}
	};

	return (
		<div className="grid place-items-center w-full">
			<div className="flex flex-col items-center justify-center w-full max-w-sm md:max-w-md lg:max-w-lg gap-4 px-8 py-12 text-white">
				<h1 className="text-2xl">Welcome Back</h1>
				<p className=" text-tertiary-200">Please enter your credentials</p>
				<Input
					name="username"
					label="Username"
					value={formik.values.username}
					error={formik.errors.username}
					isError={!!formik.errors.username}
					onChange={formik.handleChange}
					onBlur={formik.handleBlur}
					success={success}
				/>
				<Input
					name="password"
					label="Password"
					htmlType="password"
					value={formik.values.password}
					error={formik.errors.password}
					isError={!!formik.errors.password}
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
							Object.keys(formik.errors).length > 0
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
					<a href={`${process.env.NEXT_PUBLIC_BACK_END_URL}api/auth/42/callback`}>
						<Button
							type="secondary"
							disabled={loading}
							className="h-14 w-14 justify-center rounded-xl md:h-auto md:w-full text-sm backdrop-blur-sm"
						>
							<img src="/img/42Logo-light.svg" alt="logo" width={30} />
							<p className="hidden md:block">Continue with Intra</p>
						</Button>
					</a>
					<a href={`${process.env.NEXT_PUBLIC_BACK_END_URL}api/auth/google/login`}>
						<Button
							type="secondary"
							disabled={loading}
							className="h-14 w-14 justify-center rounded-xl md:h-auto md:w-full text-sm backdrop-blur-sm"
						>
							<img src="/img/google.svg" alt="logo" width={30} />
							<p className="hidden md:block">Continue with Google</p>
						</Button>
					</a>
				</div>
			</div>
		</div>
	);
};

export default Login;