import { MdDelete, MdOutlineModeEdit, MdSettings } from "react-icons/md";
import {
  Avatar,
  Button,
  Input,
  Sidepanel,
  Divider,
  Card,
} from "./../../components";
import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../context/app.context";
import axios from "axios";
import { useMedia } from "react-use";
import clsx from "clsx";
import ReactFlagsSelect from "react-flags-select";
import { useFormik } from "formik";
import Modal from "../../components/modal";

export default function Settings() {
  const { user, fetchUser } = useContext(AppContext);
  const ref = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<Blob>();
  const [previewImage, setPreviewImage] = useState<string>(user?.avatar || "");
  const [qrcode, setQrcode] = useState<string>("");
  const [showmodal, setShowmodal] = useState<boolean>(false);
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
  const [error, setError] = useState("");

  const TurnOnOrOffTfa = async (url: string) => {
    try {
      setError("");
      const accessToken = window.localStorage.getItem("access_token");
      const { code } = formik.values;
      const response = await axios.post(
        url,
        { code },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.data.message === "success") {
        return fetchUser();
      }
      setError("Invalid Code");
    } catch (error) {
      setError("Invalid Code");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const accessToken = window.localStorage.getItem("access_token");
        const response = await axios.get(
          `${process.env.REACT_APP_BACK_END_URL}api/auth/2fa/qrcode`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setQrcode(response.data);
      } catch { }
    })();
  }, []);

  /*
  
  <div className="grid h-screen w-screen grid-cols-10 bg-secondary-500">
              <Sidepanel className="col-span-2 2xl:col-span-1" />
              <div className="col-span-8 flex h-screen flex-col items-center gap-4 overflow-y-scroll  px-4 py-16 scrollbar-hide md:gap-8">
  */

  return (
    <div className="relative grid h-screen grid-cols-10 overflow-hidden bg-secondary-500">
      <Sidepanel className="col-span-2 2xl:col-span-1" />
      <div className="col-span-8 flex h-full w-full flex-col items-center justify-start overflow-y-auto px-2 pt-8 scrollbar-hide 2xl:col-span-9">
        <div className="w-full max-w-[1024px]  md:flex md:flex-col md:items-center md:justify-center 2xl:w-[65%]">
          <div className="flex w-full items-center gap-2 p-2 text-lg text-white md:gap-4 md:text-2xl">
            <MdSettings />
            Account Settings
          </div>
          <div className="flex items-center justify-center pt-4">
            <div className="relative">
              <Avatar
                src={previewImage}
                alt="porfile-picture"
                className="h-36 w-36 md:h-52 md:w-52"
              />
              <Button
                variant="contained"
                className="absolute bottom-1 right-2 m-0 rounded-full !px-2 !py-2 md:bottom-2 md:right-6"
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
          </div>

          <div className="flex w-full flex-wrap items-start justify-center divide-y divide-quaternary-400 md:mt-4 md:flex-nowrap md:divide-x md:divide-y-0">
            {showmodal && (
              <Modal className="!w-[50%] !max-w-md">
                <MdDelete className="text-9xl" />
                <span className="max-w-xs text-center text-2xl">
                  Are you sure you want to delete your account
                </span>
                <Button
                  type="danger"
                  onClick={async () => {
                    const accessToken =
                      window.localStorage.getItem("access_token");
                    const response = await axios.delete(
                      `${process.env.REACT_APP_BACK_END_URL}api/users/${user?.id}`,
                      {
                        headers: {
                          Authorization: `Bearer ${accessToken}`,
                        },
                      }
                    );
                    window.location.reload();
                  }}
                >
                  Yes, Delete
                </Button>
                <Button
                  variant="text"
                  className="!hover:bg-inherit !bg-inherit text-primary-500"
                  onClick={() => {
                    setShowmodal(false);
                  }}
                >
                  Keep Account
                </Button>
              </Modal>
            )}
            <div className="flex w-full flex-col items-center justify-center gap-4 p-4 text-quaternary-200">
              <div className="w-full max-w-md">
                <Input
                  label="UserName"
                  name="username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                />
              </div>
              <div className="w-full max-w-md">
                <Divider />
              </div>
              <span className="text-xl">Two Factor Authentication</span>
              <img
                src={qrcode}
                alt="qrcode"
                className="w-full max-w-md grid-cols-10 "
              />
              <div>
                Enter 6-digit code from your two factor authenticator App
              </div>
              <div className="flex w-full max-w-md flex-col gap-4">
                <Input
                  className="text-center"
                  MaxLength={6}
                  name="code"
                  value={formik.values.code}
                  onChange={formik.handleChange}
                  error={error}
                  isError={!!error}
                />
                <div className="flex w-full items-center justify-center gap-4">
                  <Button
                    className="w-full justify-center"
                    type="success"
                    disabled={user?.twoFactorAuth}
                    onClick={() => {
                      TurnOnOrOffTfa(
                        `${process.env.REACT_APP_BACK_END_URL}api/auth/2fa/turn-on`
                      );
                    }}
                  >
                    Turn On
                  </Button>
                  <Button
                    className="w-full justify-center"
                    type="danger"
                    disabled={!user?.twoFactorAuth}
                    onClick={() => {
                      TurnOnOrOffTfa(
                        `${process.env.REACT_APP_BACK_END_URL}api/auth/2fa/turn-off`
                      );
                    }}
                  >
                    Turn Off
                  </Button>
                </div>
              </div>
              <div className="w-full max-w-md">
                <Divider />
              </div>
              <span className="w-full max-w-md text-quaternary-200">
                Danger Zone
              </span>
              <Button
                className="w-full max-w-md justify-center"
                type="danger"
                onClick={() => {
                  setShowmodal(true);
                }}
              >
                <MdDelete />
                Remove account
              </Button>
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-4 p-4">
              <div className="flex w-full max-w-md flex-col items-center justify-center gap-4 ">
                <Input
                  label="FullName"
                  disabled
                  value={formik.values.fullname}
                  onChange={formik.handleChange}
                  name="fullname"
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
                  <ReactFlagsSelect
                    className="!m-0 w-full rounded-md border-2 border-quaternary-200 !p-0 font-semibold text-black"
                    searchable
                    countries={[
                      "US",
                      "TR",
                      "TH",
                      "SG",
                      "RU",
                      "PT",
                      "NL",
                      "MY",
                      "MA",
                      "LU",
                      "KR",
                      "JP",
                      "IT",
                      "JO",
                      "GB",
                      "FR",
                      "FI",
                      "ES",
                      "DE",
                      "CZ",
                      "CH",
                      "BE",
                      "AU",
                      "AT",
                      "AE",
                      "AM",
                    ]}
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
                  value={
                    formik.values.phone == "hidden" ? "" : formik.values.phone
                  }
                  placeholder="+212"
                />
              </div>
              <div className="flex w-full max-w-md items-center justify-center gap-4">
                <Button
                  className="w-full justify-center"
                  onClick={async () => {
                    try {
                      const accessToken =
                        window.localStorage.getItem("access_token");
                      const response = await axios.post(
                        `${process.env.REACT_APP_BACK_END_URL}api/users/${user?.id}`,
                        {
                          user: {
                            ...user,
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
                      // Handle the response from the API
                      console.log("User updated successfully!");
                      // Fetch the updated user data
                      fetchUser();
                    } catch (error) {
                      // Handle any errors that occur during the update process
                      console.error("Error updating user:", error);
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
                  Cancel
                </Button>
              </div>
              <Card
                className="flex w-full !max-w-md flex-col items-center
              justify-center bg-gradient-to-tr from-secondary-500 to-secondary-800 text-white"
              >
                <p>Join A Game</p>
                <p>Let The Fun Begin</p>
                <img
                  src="/img/3839218-removebg-preview.png"
                  alt=""
                  width={280}
                />
                <Button className="w-full justify-center">Play Now</Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
