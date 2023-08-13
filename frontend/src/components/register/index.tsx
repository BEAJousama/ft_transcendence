"use client";

import { useContext, useState, KeyboardEvent, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button, Input } from "@/components";
import { AppContext } from "@/context/app.context";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import { twMerge } from "tailwind-merge";

const Spinner = dynamic(() => import("@/components/").then((mod) => mod.Spinner), { ssr: false });

const Inputs: {
	name: "email" | "username" | "fullname" | "password" | "confirmPassword";
	label: string;
	htmlType?: string;
}[] = [
	{
		name: "fullname",
		label: "Full Name",
	},
	{
		name: "username",
		label: "Username",
	},
	{
		name: "email",
		label: "Email",
	},
	{
		name: "password",
		label: "Password",
		htmlType: "password",
	},
	{
		name: "confirmPassword",
		label: "Confirm Password",
		htmlType: "password",
	},
];

const isValidEmail = (email: string) => {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const commonWordsRegex = /^(?!.*(password|123456|qwerty|azerty|etc))$/i;
const meetsComplexityRequirements = (password: string) => {
	const hasUppercase = /[A-Z]/.test(password);
	const hasLowercase = /[a-z]/.test(password);
	const hasNumber = /\d/.test(password);
	const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
	const isCommon = !commonWordsRegex.test(password);
	return hasUppercase && hasLowercase && hasNumber && hasSymbol && isCommon;
};

export default function Register() {
	const router = useRouter();
	const [error, setError] = useState("");
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
		validate: (values) => {
			const errors = {
				email: "",
				username: "",
				fullname: "",
				password: "",
				confirmPassword: "",
			};
			if (!values.fullname) errors.fullname = "Please enter your full name";
			else if (values.fullname.length < 3 || values.fullname.length > 20)
				errors.fullname = "Full name must be between 3 and 20 characters";
			if (!values.username) errors.username = "Please enter your username";
			else if (values.username.length < 3 || values.username.length > 20)
				errors.username = "Username must be between 3 and 20 characters";
			if (!values.email) errors.email = "Please enter your email";
			else if (!isValidEmail(values.email)) errors.email = "Please enter a valid email";
			if (!values.password) errors.password = "Please enter a password";
			else if (values.password.length < 8)
				errors.password = "Password must be at least 8 characters";
			else if (!meetsComplexityRequirements(values.password))
				errors.password = "Password does not meet complexity requirements";
			if (!values.confirmPassword) errors.confirmPassword = "Please confirm your password";
			else if (values.confirmPassword !== values.password)
				errors.confirmPassword = "Passwords don't match";
			return errors;
		},
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
				Object.values(formik.values).some((value) => value === "") ||
				Object.values(formik.errors).some((value) => value !== "")
			) {
				console.log("invalid");
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
			if (res.data) {
				document.cookie = `${res.data.name}=${res.data.value}; Path=/;`;
				setTimeout(() => {
					console.log("ok", res.data);
					// router.push("/");
				}, 1000);
			}
		} catch (_e) {
			setError("An error occurred, please try again later");
			setLoading(false);
			console.log(_e);
		}
	};

	return (
		<div className="grid place-items-center w-full">
			<div className="flex flex-col items-center justify-center w-full max-w-sm md:max-w-md lg:max-w-lg gap-4 px-8 py-12 text-white">
				<div className="flex flex-col items-center gap-2 text-center">
					<h1 className="text-2xl">Let{"'"}s create your account</h1>
					<p className=" text-tertiary-200">Please enter your details</p>
				</div>
				{Inputs.map((input, i) => (
					<Input
						key={i}
						required
						name={input.name}
						label={input.label}
						value={formik.values[input.name]}
						error={formik.errors[input.name]}
						isError={!!formik.errors[input.name]}
						onBlur={formik.handleBlur}
						onChange={formik.handleChange}
						success={success}
						htmlType={input.htmlType}
					/>
				))}
				{error && (
					<p className="mt-2 text-xs text-red-600 dark:text-red-500">
						<span className="font-medium">{error}</span>
					</p>
				)}
				<div className="relative flex w-full">
					{loading && (
						<Spinner className="absolute flex items-center justify-center w-1/3 h-full transition duration-300 ease-out z-10 inset-x-1/3 cursor-not-allowed" />
					)}
					<Button
						className={twMerge("relative w-full", loading && " blur-[2px]")}
						onClick={handleSignUp}
						type={success ? "success" : "primary"}
						disabled={
							loading ||
							success ||
							Object.values(formik.values).some((value) => value === "") ||
							Object.values(formik.errors).some((value) => value !== "")
						}
					>
						Sign Up
					</Button>
				</div>
			</div>
		</div>
	);
}
