"use client";

import { useContext, useState } from "react";
import axios from "axios";
import { useFormik } from "formik";
import { twMerge } from "tailwind-merge";
import { AppContext, setCookieItem } from "@/context/app.context";
import { Button, Input } from "@/components";

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
	return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);
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

export default function Register({ registrOk }: { registrOk: () => void }) {
	const { updateUser, updateAccessToken } = useContext(AppContext);
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
			const errors = await formik.validateForm();
			if (
				Object.values(formik.values).some((value) => value === "") ||
				Object.values(formik.errors).some((value) => value !== "") ||
				Object.values(errors).some((value) => value !== "")
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
			setError("");
			setSuccess(true);
			if (res.data) setCookieItem(res.data.name, res.data.value);
			updateAccessToken();
			updateUser();
			registrOk();
		} catch (e: any) {
			if (e.response?.data.message.includes("login", "username"))
				setError("Username already exists");
			else if (e.response?.data.message.includes("email")) setError("Email already exists");
			else setError("Something went wrong...");
			setLoading(false);
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
						isError={!!formik.errors[input.name] || error.includes(input.label)}
						onBlur={formik.handleBlur}
						onChange={formik.handleChange}
						success={success}
						htmlType={input.htmlType}
						disabled={loading}
					/>
				))}
				{error && (
					<p className="mt-2 text-xs text-red-600 dark:text-red-500 font-medium">
						{error}
					</p>
				)}
				<div className="relative flex w-full">
					<Button
						className={twMerge(
							"relative w-full",
							loading && "animate-pulse disabled:cursor-wait"
						)}
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
