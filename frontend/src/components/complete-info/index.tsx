"use client";

import { useContext, useState, useRef } from "react";
import axios from "axios";
import { useFormik } from "formik";
import { twMerge } from "tailwind-merge";
import { Pencil } from "lucide-react";
import { AppContext } from "@/context/app.context";
import { Avatar, Button, Input } from "@/components";

export default function CompleteInfo({ completeOk }: { completeOk: () => void }) {
	const { user, updateUser } = useContext(AppContext);
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState("");

	const formik = useFormik({
		initialValues: {
			username: user?.username,
			email: user?.email,
			phone: user?.phone,
			fullname: user?.fullname,
		},
		validate: (values) => {
			const errors = {
				username: "",
				email: "",
				phone: "",
				fullname: "",
			};
			if (!values.username || values.username.length < 3 || values.username.length > 20)
				errors.username = "Invalid username";
			if (!values.email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email))
				errors.email = "Invalid email address";
			if (!values.phone || !/^[0-9]{10}$/i.test(values.phone))
				errors.phone = "Invalid phone number";
			return errors;
		},
		validateOnBlur: true,
		validateOnChange: true,
		onSubmit: async (values) => {},
	});
	const ref = useRef<HTMLInputElement>(null);
	const [file, setFile] = useState<Blob>();
	const [previewImage, setPreviewImage] = useState<string>(user?.avatar || "");

	const handleComplete = async () => {
		setLoading(true);
		try {
			await axios.post(
				`${process.env.NEXT_PUBLIC_BACK_END_URL}api/users/`,
				{
					user: {
						username: formik.values.username,
						email: formik.values.email,
						phone: formik.values.phone,
						avatar: previewImage,
					},
					id: user?.id,
				},
				{ withCredentials: true }
			);
			setError("");
			setSuccess(true);
			await updateUser();
			completeOk();
		} catch (e: any) {
			if (e.response.data.message.includes("username")) setError("Username already exists");
			else if (e.response.data.message.includes("email")) setError("Email already exists");
			else setError("Something went wrong...");
		}
		setLoading(false);
	};

	return (
		<div className="grid place-items-center w-full">
			{user && (
				<div className="flex flex-col items-center justify-center w-full max-w-sm md:max-w-md lg:max-w-lg gap-4 px-8 py-12 text-white">
					<div className="flex flex-col items-center gap-2 text-center">
						<h1 className="text-2xl">Let{"'"}s complete your profile</h1>
					</div>
					<div className="relative">
						<Avatar
							src={previewImage}
							alt="profile-picture"
							className="h-24 w-24 md:h-32 md:w-32"
						/>
						<Button
							variant="contained"
							className="absolute bottom-1 -right-1 m-0 rounded-full !px-2 !py-2 md:right-1"
							onClick={() => {
								ref.current?.click();
							}}
						>
							<Pencil size={14} />
							<input
								type="file"
								hidden
								ref={ref}
								accept="image/png, image/jpeg"
								onChange={(e) => {
									if (e.target.files) {
										setFile(e.target.files[0]);
										if (e.target.files[0]) {
											const reader = new FileReader();
											reader.onloadend = () => {
												setPreviewImage(reader.result as string);
											};
											reader.readAsDataURL(file ? file : e.target.files[0]);
										}
									}
								}}
							/>
						</Button>
					</div>
					<Input
						label="Full Name"
						disabled
						value={formik.values.fullname}
						name="fullname"
						success={success}
						className={twMerge(loading && "animate-pulse")}
					/>
					<Input
						label="User Name"
						value={formik.values.username}
						name="username"
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						disabled={loading || success}
						success={success}
						className={twMerge(loading && "animate-pulse")}
						error={formik.errors.username || error.includes("Username") ? error : ""}
						isError={!!formik.errors.username || error.includes("Username")}
					/>
					<Input
						label="Phone number"
						value={formik.values.phone}
						name="phone"
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						disabled={loading || success}
						success={success}
						className={twMerge(loading && "animate-pulse")}
						error={formik.errors.phone}
						isError={!!formik.errors.phone}
					/>
					<Input
						label="Email"
						value={formik.values.email}
						name="email"
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						disabled={loading || success}
						success={success}
						className={twMerge(loading && "animate-pulse")}
						error={formik.errors.email || error.includes("Email") ? error : ""}
						isError={!!formik.errors.email || error.includes("Email")}
					/>
					<Button
						className={twMerge(
							"w-full justify-center",
							success && "disabled:cursor-wait"
						)}
						type="success"
						onClick={handleComplete}
						disabled={
							loading ||
							success ||
							Object.values(formik.values).some((value) => value === "") ||
							Object.values(formik.errors).some((value) => value !== "")
						}
					>
						Submit
					</Button>
				</div>
			)}
		</div>
	);
}
