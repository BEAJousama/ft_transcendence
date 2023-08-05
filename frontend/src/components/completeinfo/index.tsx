"use client";

import { Avatar, Card, Button, Input } from "../../components";
import { useContext, useEffect, useState } from "react";
import { MdOutlineModeEdit } from "react-icons/md";
import { useRef } from "react";
import { useFormik } from "formik";
import { AppContext } from "../../context/app.context";
import axios from "axios";
import { redirect } from "next/navigation";
// import { Navigate } from "react-router-dom";

interface CompleteInfoProps {
	selected?: boolean;
}

export default function CompleteInfo({ selected = true }: CompleteInfoProps) {
	const { user, updateUser } = useContext(AppContext);
	const formik = useFormik({
		initialValues: {
			username: user?.username,
			email: user?.email,
			phone: user?.phone,
			fullname: user?.fullname,
		},
		onSubmit: (values) => {},
	});
	const ref = useRef<HTMLInputElement>(null);
	const [file, setFile] = useState<Blob>();
	const [previewImage, setPreviewImage] = useState<string>(user?.avatar || "");
	const [show, setShow] = useState<boolean>(selected);

	useEffect(() => {
		formik.setValues({
			username: user?.username,
			email: user?.email,
			phone: user?.phone,
			fullname: user?.fullname,
		});
		setPreviewImage(user?.avatar || "");
	}, [user]);

	useEffect(() => {
		if (!selected) {
			setTimeout(() => {
				setShow(false);
			}, 700);
		} else {
			setShow(true);
		}
	}, [selected]);

	return (
		<div className="grid place-items-center w-full">
			{show && (
				<div
					className="flex flex-col items-center justify-center w-full max-w-sm md:max-w-md lg:max-w-lg gap-4 px-8 py-12 text-white"
					// onKeyDown={handleKeyPress}
				>
					<div className="flex flex-col items-center gap-2 text-center">
						<h1 className="text-2xl">Let's complete your profile</h1>
					</div>
					<div className="relative">
						<Avatar
							src={previewImage}
							alt="profile-picture"
							className="h-24 w-24 md:h-32 md:w-32"
						/>
						<Button
							variant="contained"
							className="absolute -bottom-1 right-0 m-0 rounded-full !px-2 !py-2 md:right-2"
							onClick={() => {
								ref.current?.click();
							}}
						>
							<MdOutlineModeEdit />
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
					<Input label="Full Name" disabled value={formik.values.fullname} />
					<Input
						label="User Name"
						value={formik.values.username}
						onChange={formik.handleChange}
					/>
					<Input
						label="Phone number"
						placeholder="+212"
						value={formik.values.phone}
						onChange={formik.handleChange}
					/>
					<Input
						label="Email"
						value={formik.values.email}
						onChange={formik.handleChange}
					/>
					<Button
						className="w-full justify-center"
						type="success"
						onClick={async () => {
							try {
								await axios.post(
									`${process.env.NEXT_PUBLIC_BACK_END_URL}api/users/${user?.id}`,
									{
										user: {
											username: formik.values.username,
											email: formik.values.email,
											phone: formik.values.phone,
											avatar: previewImage,
										},
									},
									{
										withCredentials: true,
									}
								);
							} catch (error) {
								console.log(error);
							}
							await updateUser();
							redirect("/home");
						}}
					>
						Submit
					</Button>
				</div>
			)}
		</div>
	);
}
