"use client";

import { useContext } from "react";

import { AppContext } from "../../context/app.context";
import { useFormik } from "formik";
import Input from "../input";
import Button from "../button";
import axios from "axios";
import Divider from "../divider";
import { Trash } from "lucide-react";
import { toast } from "react-toastify";

const UpdateInfo = ({
	user,
	previewImage,
	setLoading,
	setShowmodal,
}: {
	user: any;
	previewImage: string;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	setShowmodal: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const { updateUser } = useContext(AppContext);

	const formik = useFormik({
		initialValues: {
			fullname: user?.fullname || "",
			username: user?.username || "",
			email: user?.email || "",
			phone: user?.phone || "",
			country: user?.country === "none" ? "MA" : user?.country,
			code: "",
		},
		onSubmit: async (values) => {},
	});

	const validatePhoneNumber = (phoneNumber: string) => {
		const moroccoPhoneRegex = /^(?:(?:\+|00)212|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
		return moroccoPhoneRegex.test(phoneNumber);
	};

	return (
		<>
			<div className="py-8 flex w-full max-w-md flex-col items-center justify-center gap-4 ">
				<Input
					label="Full Name"
					disabled
					value={formik.values.fullname}
					onChange={formik.handleChange}
					name="fullname"
				/>
				<Input
					label="Username"
					name="username"
					value={formik.values.username}
					onChange={formik.handleChange}
				/>
				<Input
					label="Email"
					value={formik.values.email}
					onChange={formik.handleChange}
					name="email"
				/>
				<Input
					label="Phone Number"
					name="phone"
					onChange={formik.handleChange}
					value={formik.values.phone === "hidden" ? "" : formik.values.phone}
					placeholder="+212"
				/>
			</div>
			<div className="flex w-full max-w-md items-center justify-center gap-4">
				<Button
					className="w-full justify-center"
					onClick={async () => {
						try {
							if (!formik.dirty && user?.avatar === previewImage) {
								toast.error("Error : You haven't made any changes");
								return;
							} else if (
								formik.values.phone !== "" &&
								!validatePhoneNumber(formik.values.phone)
							) {
								toast.error("Error : Invalid phone number");
								return;
							}
							setLoading(true);
							await axios.post(
								`${process.env.BACK_END_URL}api/users/`,
								{
									user: {
										username: formik.values.username,
										email: formik.values.email,
										phone: formik.values.phone,
										country: formik.values.country,
										avatar: previewImage,
									},
									id: user.id,
								},
								{
									withCredentials: true,
								}
							);
							await updateUser();
							toast.success("User updated successfully!");
							// setModalText("User updated successfully!");
							setLoading(false);
						} catch (error) {
							toast.error("Error updating user");
							// setModalText("Error updating user");
							setLoading(false);
						}
					}}
				>
					Save
				</Button>
				<Button
					className="w-full justify-center"
					variant="text"
					onClick={formik.handleReset}
				>
					Reset
				</Button>
			</div>
			<div className="w-full max-w-md">
				<Divider />
			</div>
			<span className="w-full max-w-md text-quaternary-200">Danger Zone</span>
			<Button
				className="w-full max-w-md justify-center"
				type="danger"
				onClick={() => {
					setShowmodal(true);
				}}
			>
				<Trash />
				Remove account
			</Button>
		</>
	);
};

export default UpdateInfo;
