import { MdDelete, MdOutlineModeEdit, MdSettings } from "react-icons/md";
import {
  Avatar,
  Button,
  Input,
  Sidepanel,
  Divider,
  Card,
  Spinner,
} from "./../../components";
import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../context/app.context";
import axios from "axios";
import clsx from "clsx";
import ReactFlagsSelect from "react-flags-select";
import { useFormik } from "formik";
import ConfirmationModal from "../../components/confirmationmodal";

const FlagsSelect = ({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (code: string) => void;
}) => {
  return (
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
      selected={selected}
      onSelect={onSelect}
    />
  );
};

const JoinGameCard = () => {
  return (
    <Card
      className="flex w-full !max-w-md flex-col items-center
              justify-center bg-gradient-to-tr from-secondary-500 to-secondary-800 text-white"
    >
      <p>Join A Game</p>
      <p>Let The Fun Begin</p>
      <img src="/img/3839218-removebg-preview.png" alt="" width={280} />
      <Button className="w-full justify-center">Play Now</Button>
    </Card>
  );
};

const UpdateAvatar = ({
  previewImage,
  setPreviewImage,
}: {
  previewImage: string;
  setPreviewImage: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const ref = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<Blob>();
  return (
    <div className="flex items-center justify-center pt-4 ">
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
  );
};

const QrCode = () => {
  const [qrcode, setQrcode] = useState<string>("");
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
  return (
    <>
      {qrcode ? (
        <img
          src={qrcode}
          alt="qrcode"
          className="w-full max-w-md grid-cols-10 "
        />
      ) : (
        <Spinner />
      )}
    </>
  );
};

const ActivateFfa = ({
  setShowmodal,
  user,
  fetchUser,
  setUpdated,
}: {
  user: any;
  fetchUser: () => void;
  setShowmodal: React.Dispatch<React.SetStateAction<boolean>>;
  setUpdated?: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [error, setError] = useState("");
  const [code, setCode] = useState("");

  const TurnOnOrOffTfa = async (url: string) => {
    try {
      setError("");
      const accessToken = window.localStorage.getItem("access_token");
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
        setUpdated &&
          setUpdated(
            `Two Factor Authentication ${!user?.twoFactorAuth ? "Avtivated" : "deactivated"
            } successfully`
          );
        return fetchUser();
      }
      setError("Invalid Code");
    } catch (error) {
      setError("Invalid Code");
    }
  };
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 p-4 text-quaternary-200">
      <span className="text-xl">Two Factor Authentication</span>
      <QrCode />
      <div>Enter 6-digit code from your two factor authenticator App</div>
      <div className="flex w-full max-w-md flex-col gap-4">
        <Input
          className="text-center"
          MaxLength={6}
          name="code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
          }}
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
      <span className="w-full max-w-md text-quaternary-200">Danger Zone</span>
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
  );
};

const UpdateInfo = ({
  user,
  fetchUser,
  previewImage,
  setError,
  setLoading,
}: {
  user: any;
  fetchUser: () => void;
  previewImage: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
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
  }

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
                setError("Error : Y4ou haven't made any changes");
                return;
              }
              else if (!validatePhoneNumber(formik.values.phone)) {
                setError("Error : Invalid phone number");
                return;
              }

              setLoading(true);
              const accessToken = window.localStorage.getItem("access_token");
              await axios.post(
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
              // console.log("User updated successfully!", response.data);
              await fetchUser();
              setError("User updated successfully!");
              // Fetch the updated user data
              setLoading(false);
            } catch (error) {
              // Handle any errors that occur during the update process
              // console.error("Error updating user:", error);
              setError("Error updating user");
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

export default function Settings() {
  const { user, fetchUser } = useContext(AppContext);
  const [previewImage, setPreviewImage] = useState<string>(user?.avatar || "");
  const [showmodal, setShowmodal] = useState<boolean>(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <div className="relative grid h-screen grid-cols-10 overflow-hidden bg-secondary-500">
      <Sidepanel className="col-span-2 2xl:col-span-1" />
      <div className="col-span-8 flex h-full w-full flex-col items-center justify-start overflow-y-auto px-2 pt-8 scrollbar-hide 2xl:col-span-9">
        <div className="w-full max-w-[1024px] md:flex md:flex-col md:items-center md:justify-center 2xl:w-[65%]">
          {loading ? (
            <Spinner />
          ) : (
            <>
              <div className="flex w-full items-center gap-2 p-2 text-lg text-white md:gap-4 md:text-2xl">
                <MdSettings />
                Account Settings
              </div>
              <UpdateAvatar
                previewImage={previewImage}
                setPreviewImage={setPreviewImage}
              />
              <div className="flex w-full flex-wrap items-start justify-center divide-y divide-quaternary-400 md:mt-4 md:flex-nowrap md:divide-x md:divide-y-0">
                {showmodal && (
                  <ConfirmationModal
                    title="Are you sure you want to delete your account"
                    accept="Yes, Delete"
                    reject="Keep Account"
                    icon={
                      <img
                        src={"/img/danger.png"}
                        alt=""
                        className="h-32 w-32"
                      />
                    }
                    onAccept={async () => {
                      try {
                        const accessToken =
                          window.localStorage.getItem("access_token");
                        await axios.delete(
                          `${process.env.REACT_APP_BACK_END_URL}api/users/${user?.id}`,
                          {
                            headers: {
                              Authorization: `Bearer ${accessToken}`,
                            },
                          }
                        );
                        window.location.reload();
                      } catch (e) {
                        setShowmodal(false);
                        setError("Error: Could not delete Accout");
                      }
                    }}
                    onReject={() => {
                      setShowmodal(false);
                    }}
                    showReject
                  />
                )}
                <ActivateFfa
                  setShowmodal={setShowmodal}
                  fetchUser={fetchUser}
                  user={user}
                  setUpdated={setError}
                />
                <div className="flex w-full flex-col items-center justify-center gap-4 p-4 ">
                  <UpdateInfo
                    user={user}
                    fetchUser={fetchUser}
                    previewImage={previewImage}
                    setError={setError}
                    setLoading={setLoading}
                  />
                  {!!error && (
                    <ConfirmationModal
                      className="flex flex-col items-center justify-center gap-8"
                      title={error}
                      accept={!error.includes("Error") ? "Continue" : "Close"}
                      icon={
                        <Avatar
                          src={
                            !error.includes("Error")
                              ? "/img/success.png"
                              : "/img/failure.png"
                          }
                          alt=""
                          className="h-32 w-32"
                        />
                      }
                      onAccept={() => {
                        setError("");
                      }}
                      danger={error.includes("Error")}
                    />
                  )}
                  <JoinGameCard />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
