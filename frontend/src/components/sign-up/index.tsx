"use client";

import { Card, Button, Input, Spinner } from "../../components";
import { useContext, useState, KeyboardEvent, useEffect } from "react";
import { AppContext } from "../../context/app.context";
import axios from "axios";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useFormik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";

const commonWordsRegex = /^(?!.*(password|123456|qwerty|azerty|etc))$/i;

const signUpFormSchema = z
	.object({
		fullname: z
			.string({
				required_error: "Please enter your full name",
				invalid_type_error: "Please enter a valid full name",
			})
			.min(3)
			.max(20),
		username: z
			.string({
				required_error: "Please enter your username",
				invalid_type_error: "Please enter a valid username",
			})
			.min(3)
			.max(20),
		email: z
			.string({
				required_error: "Please enter your email",
				invalid_type_error: "Please enter a valid email",
			})
			.email(),
		password: z
			.string({
				required_error: "Please enter a password",
			})
			.min(8, "Password must be at least 8 characters")
			.refine((value) => {
				const hasUppercase = /[A-Z]/.test(value);
				const hasLowercase = /[a-z]/.test(value);
				const hasNumber = /\d/.test(value);
				const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value);
				const isCommon = !commonWordsRegex.test(value);
				return hasUppercase && hasLowercase && hasNumber && hasSymbol && isCommon;
			}, "Password does not meet complexity requirements"),
		confirmPassword: z.string({
			required_error: "Please confirm your password",
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

export default function SignUp() {
	const router = useRouter();
	const { fetchUser } = useContext(AppContext);
	const [error, setError] = useState("");
	const [redirect, setRedirect] = useState<boolean>();
	const [loading, setLoading] = useState<boolean>(false);
	const [success, setSuccess] = useState<boolean>(false);
	const [submitCount, setSubmitCount] = useState<number>(0);

	const formik = useFormik({
		initialValues: {
			email: "",
			username: "",
			fullname: "",
			password: "",
			confirmPassword: "",
		},
		validationSchema: toFormikValidationSchema(signUpFormSchema),
		validateOnBlur: submitCount !== 0,
		validateOnChange: submitCount !== 0,
		onSubmit: async (values) => {},
	});

	const handleSignUp = async () => {
		try {
			setLoading(true);
			setSubmitCount((prev) => prev + 1);
			setError("");
			formik.validateForm();

			if (
				Object.keys(formik.errors).length > 0 ||
				Object.keys(await formik.validateForm()).length > 0
			) {
				setError("Please enter valid details");
				setLoading(false);
				return;
			}
			const res = await axios.post(`${process.env.NEXT_PUBLIC_BACK_END_URL}api/auth/signup`, {
				fullname: formik.values.fullname,
				username: formik.values.username,
				email: formik.values.email,
				password: formik.values.password,
			});
			setSuccess(true);
		} catch (_e) {
			setError("Incorrect username or password");
			setLoading(false);
			console.log(_e);
		}
	};

	if (redirect) router.push("/");

	return (
		<div className="grid place-items-center w-full">
			<div className="flex flex-col items-center justify-center w-full max-w-sm md:max-w-md lg:max-w-lg gap-4 px-8 py-12 text-white">
				<div className="flex flex-col items-center gap-2 text-center">
					<h1 className="text-2xl">Let's create your account</h1>
					<p className=" text-tertiary-200">Please enter your details</p>
				</div>
				<Input
					onBlur={formik.handleBlur}
					required
					onChange={formik.handleChange}
					value={formik.values.fullname}
					error={formik.errors.fullname}
					isError={!!formik.errors.fullname}
					name="fullname"
					label="Full Name"
					success={success}
				/>
				<Input
					onBlur={formik.handleBlur}
					required
					onChange={formik.handleChange}
					value={formik.values.username}
					error={formik.errors.username}
					isError={!!formik.errors.username}
					name="username"
					label="Username"
					htmlType="email"
					success={success}
				/>
				<Input
					onBlur={formik.handleBlur}
					required
					onChange={formik.handleChange}
					value={formik.values.email}
					error={formik.errors.email}
					isError={!!formik.errors.email}
					name="email"
					label="Email"
					success={success}
				/>
				<Input
					onBlur={formik.handleBlur}
					required
					onChange={formik.handleChange}
					value={formik.values.password}
					error={formik.errors.password}
					isError={!!formik.errors.password}
					name="password"
					label="Password"
					htmlType="password"
					success={success}
				/>
				<Input
					onBlur={formik.handleBlur}
					required
					onChange={formik.handleChange}
					value={formik.values.confirmPassword}
					error={formik.errors.confirmPassword}
					isError={!!formik.errors.confirmPassword}
					name="confirmPassword"
					label="Confirm Password"
					htmlType="password"
					success={success}
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
						onClick={handleSignUp}
						disabled={
							loading ||
							success ||
							Object.values(formik.values).some((value) => value === "") ||
							Object.keys(formik.errors).length > 0
						}
					>
						Sign Up
					</Button>
				</div>
			</div>
		</div>
	);
}
