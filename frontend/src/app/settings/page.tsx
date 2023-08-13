"use client"
import Image from "next/image";
import { toast } from "react-toastify";

import { Settings } from 'lucide-react';
import {
  Spinner,
  UpdateAvatar,
  UpdateInfo,
  ActivateTfa,
} from "@/components";
import { useContext, useState } from "react";
import { AppContext } from "../../context/app.context";
import axios from "axios";
import Layout from "../layout/index";
import dynamic from "next/dynamic";

const ConfirmationModal = dynamic(
  () => import("@/components/confirmationmodal/index"),
  {
    ssr: false,
  }
);

export default function SettingsPage() {
  const { user } = useContext(AppContext);
  const [previewImage, setPreviewImage] = useState<string>(user?.avatar || "");
  const [showmodal, setShowmodal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <Layout className="flex w-full flex-col items-center justify-start px-2 pt-8">
      <div className="w-full max-w-[1024px] md:flex md:flex-col md:items-center md:justify-center 2xl:w-[65%]">
        {loading ? (
          <Spinner />
        ) : (
          <>
            <div className="flex w-full items-center gap-2 p-2 text-lg text-white md:gap-4 md:text-2xl">
              <Settings />
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
                    <Image src={"/img/danger.png"} alt="" width={128} height={128} className="h-32 w-32" />
                  }
                  onAccept={async () => {
                    try {
                      await axios.delete(
                        `${process.env.NEXT_PUBLIC_BACK_END_URL}api/users`,
                        {
                          data: {
                            id: user?.id,
                          },
                          withCredentials: true,
                        }
                      );
                      document.cookie = `${"2fa_access_token"}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                      document.cookie = `${"access_token"}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                      window.location.reload();
                    } catch (e) {
                      setShowmodal(false);
                      toast.error("Error: Could not delete Accout");
                    }
                  }}
                  onReject={() => {
                    setShowmodal(false);
                  }}
                  showReject
                />
              )}
              <ActivateTfa />
              <div className="flex w-full flex-col items-center justify-center gap-4 p-4 ">
                <UpdateInfo
                  user={user}
                  previewImage={previewImage}
                  setLoading={setLoading}
                  setShowmodal={setShowmodal}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
