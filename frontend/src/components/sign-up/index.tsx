"use client";

import { Card, Button, Input } from "../../components";
import { useContext, useState, KeyboardEvent, useEffect } from "react";
import { useFormik } from "formik";
import { AppContext } from "../../context/app.context";
import axios from "axios";
import { useRouter } from "next/navigation";
// import { Link, Navigate } from "react-router-dom";

interface SignUpProps {
	selected?: boolean;
}

export default function SignUp({ selected = true }: SignUpProps) {
	const router = useRouter();
	const { fetchUser } = useContext(AppContext);
	const [show, setShow] = useState<boolean>(selected);
	function isValidEmail(email: string) {
		// Regular expression pattern for email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}
	function isStrongPassword(password: string) {
		// Check for a combination of uppercase letters, lowercase letters, numbers, and symbols
		const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).*$/;
		return passwordRegex.test(password);
	}

	const formik = useFormik({
		initialValues: {
			email: "",
			username: "",
			fullname: "",
			password: "",
			confirmPassword: "",
		},
		validateOnChange: false,
		validate: (values) => {
			const errors: {
				email?: string;
				username?: string;
				fullname?: string;
				password?: string;
				confirmPassword?: string;
			} = {};

			// Validate email

			if (values.email && !isValidEmail(values.email)) {
				errors.email = "Please enter a valid email";
			}

			if (values.password && values.password.length < 12) {
				errors.password = "Password should be at least 12 characters long";
			}
			if (values.password && !isStrongPassword(values.password)) {
				errors.password =
					"Password must contain a combination of uppercase and lowercase letters, numbers, symbols and should not be a common word or name";
			}

			if (
				values.password &&
				values.confirmPassword &&
				values.password !== values.confirmPassword
			) {
				errors.confirmPassword = "Passwords do not match";
			}

			return errors;
		},
		onSubmit: () => {},
	});

	useEffect(() => {
		if (!selected) {
			setTimeout(() => {
				setShow(false);
			}, 700);
		} else {
			setShow(true);
		}
	}, [selected]);

	const checkValues = (values: {
		email?: string;
		username?: string;
		fullname?: string;
		password?: string;
		confirmPassword?: string;
	}) => {
		const errors: {
			email?: string;
			username?: string;
			fullname?: string;
			password?: string;
			confirmPassword?: string;
		} = {};

		// Validate email
		if (!values.email) {
			errors.email = "Please enter your email";
		}

		// Validate username
		if (!values.username) {
			errors.username = "Please enter a username";
		}

		// Validate fullname
		if (!values.fullname) {
			errors.fullname = "Please enter your full name";
		}

		// Validate password
		if (!values.password) {
			errors.password = "Please enter a password";
		}

		// Validate confirmPassword
		if (!values.confirmPassword) {
			errors.confirmPassword = "Please confirm your password";
		}
		formik.setErrors(errors);
		return errors;
	};

	const [error, setError] = useState("");
	const [redirect, setRedirect] = useState<boolean>();

	const handleSignUp = async () => {
		try {
			setError("");
			if (
				Object.keys(formik.errors).length > 0 ||
				Object.keys(await formik.validateForm()).length > 0 ||
				Object.keys(checkValues(formik.values)).length > 0
			) {
				return;
			}

			const res = await axios.post(`${process.env.NEXT_PUBLIC_BACK_END_URL}api/auth/signup`, {
				fullname: formik.values.fullname,
				username: formik.values.username,
				password: formik.values.password,
				email: formik.values.email,
			});
			if (res && res.data) {
				console.log(res.data);
				window.localStorage?.setItem(res.data.name, res.data.value);
				await fetchUser();
				setError("");
				setRedirect(true);
			}
			console.log(res);
		} catch (e: any) {
			console.log(e);
			if (e) setError(e.response.data.message);
		}
	};

	const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter") {
			handleSignUp();
		}
	};

	if (redirect) router.push("/");

	return (
		<div className="grid place-items-center w-full">
			{show && (
				<div
					className="flex flex-col items-center justify-center w-full max-w-sm md:max-w-md lg:max-w-lg gap-4 px-8 py-12 text-white"
					onKeyDown={handleKeyPress}
				>
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
					/>
					{error && (
						<p className="mt-2 text-xs text-red-600 dark:text-red-500">
							<span className="font-medium">{error}</span>
						</p>
					)}
					<Button className="w-full" onClick={handleSignUp}>
						Sign Up
					</Button>
					{/* <div className="w-full pt-1 text-center text-tertiary-300 flex flex-col md:flex-row items-center justify-center">
          Already have an account?
          <Link to="/login" className="ml-1 text-tertiary-100 underline hover:text-primary-500  hover:scale-105 transition ease-in-out duration-400">
            Sign in
          </Link>
        </div> */}
				</div>
			)}
		</div>
	);
}
