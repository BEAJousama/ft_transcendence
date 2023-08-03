"use client"

import useSWR from "swr";
import { fetcher } from "../../context/app.context";
import Spinner from "../spinner";

const QrCode = () => {
  const { data: qrcode, isLoading } = useSWR("api/auth/2fa/qrcode", fetcher);

  return (
    <>
      {!isLoading ? (
        <img
          src={qrcode || ""}
          alt="qrcode"
          className="w-full max-w-[400px] border-4 border-secondary-400 rounded-xl  grid-cols-10 "
        />
      ) : (
        <Spinner />
      )}
    </>
  );
};

export default QrCode;
