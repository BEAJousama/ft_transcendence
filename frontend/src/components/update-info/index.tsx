import { useContext } from "react";
import { AppContext } from "../../context/app.context";
import { useFormik } from "formik";
import Input from "../input";
import FlagsSelect from "../flags-select";
import Button from "../button";
import axios from "axios";
import clsx from "clsx";

const UpdateInfo = ({
    user,
    previewImage,
    setModalText,
    setLoading,
}: {
    user: any;
    previewImage: string;
    setModalText: React.Dispatch<React.SetStateAction<string>>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
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
        onSubmit: async (values) => { },
    });

    const validatePhoneNumber = (phoneNumber: string) => {
        const moroccoPhoneRegex = /^(?:(?:\+|00)212|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
        return moroccoPhoneRegex.test(phoneNumber);
    };

    return (
        <>
            <div className="flex w-full max-w-md flex-col items-center justify-center gap-4 ">
                <Input
                    label="FullName"
                    disabled
                    value={formik.values.fullname}
                    onChange={formik.handleChange}
                    name="fullname"
                />
                <Input
                    label="UserName"
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
                <div className="relative w-full bg-inherit">
                    <label
                        htmlFor=""
                        className={clsx(
                            "man-w-min absolute -top-2 left-1.5 z-10 rounded bg-secondary-500 px-1 text-xs font-semibold text-quaternary-200"
                        )}
                    >
                        Country
                    </label>
                    <FlagsSelect
                        selected={formik.values.country || "MA"}
                        onSelect={(code) => {
                            formik.setFieldValue("country", code);
                        }}
                    />
                </div>
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
                                setModalText("Error : You haven't made any changes");
                                return;
                            } else if (
                                formik.values.phone !== "hidden" &&
                                !validatePhoneNumber(formik.values.phone)
                            ) {
                                setModalText("Error : Invalid phone number");
                                return;
                            }
                            setLoading(true);
                            const accessToken = window.localStorage.getItem("access_token");
                            await axios.post(
                                `${process.env.REACT_APP_BACK_END_URL}api/users/${user?.id}`,
                                {
                                    user: {
                                        username: formik.values.username,
                                        email: formik.values.email,
                                        phone: formik.values.phone,
                                        country: formik.values.country,
                                        avatar: previewImage,
                                    },
                                },
                                {
                                    headers: {
                                        Authorization: `Bearer ${accessToken}`,
                                    },
                                }
                            );
                            await updateUser();
                            setModalText("User updated successfully!");
                            setLoading(false);
                        } catch (error) {
                            setModalText("Error updating user");
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
        </>
    );
};

export default UpdateInfo