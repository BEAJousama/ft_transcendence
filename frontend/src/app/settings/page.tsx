"use client"
import Image from "next/image";

import { MdSettings } from "react-icons/md";
import {
  Avatar,
  Spinner,
  ConfirmationModal,
  UpdateAvatar,
  UpdateInfo,
  ActivateTfa,
} from "../../components";
import { useContext, useState } from "react";
import { AppContext } from "../../context/app.context";
import axios from "axios";
import Layout from "../layout/index";

export default function Settings() {
  const { user } = useContext(AppContext);
  const [previewImage, setPreviewImage] = useState<string>(user?.avatar || "");
  const [showmodal, setShowmodal] = useState<boolean>(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <Layout className="flex w-full flex-col items-center justify-start px-2 pt-8">
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
            <div className="flex w-full flex-wrap items-start justify-center divide-y divide-secondary-300 md:mt-4 md:flex-nowrap md:divide-x md:divide-y-0">
              {showmodal && (
                <ConfirmationModal
                  title="Are you sure you want to delete your account"
                  accept="Yes, Delete"
                  reject="Keep Account"
                  icon={
                    <Image src={"/img/danger.png"} alt="" className="h-32 w-32" />
                  }
                  onAccept={async () => {
                    try {
                      const accessToken =
                        window.localStorage?.getItem("access_token");
                      await axios.delete(
                        `${process.env.NEXT_PUBLIC_BACK_END_URL}api/users/${user?.id}`,
                        {
                          headers: {
                            Authorization: `Bearer ${accessToken}`,
                          },
                        }
                      );
                      localStorage?.removeItem("access_token");
                      localStorage?.removeItem("2fa_access_token");
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
              <ActivateTfa
                setShowmodal={setShowmodal}
                user={user}
                setUpdated={setError}
              />
              <div className="flex w-full flex-col items-center justify-center gap-4 p-4 ">
                <UpdateInfo
                  user={user}
                  previewImage={previewImage}
                  setModalText={setError}
                  setLoading={setLoading}
                  setShowmodal={setShowmodal}
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

              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
