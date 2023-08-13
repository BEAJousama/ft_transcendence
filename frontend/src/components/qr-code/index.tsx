"use client"

import useSWR from "swr";
import { fetcher } from "../../context/app.context";
import Spinner from "../spinner";
import Image from "next/image";

const QrCode = () => {
  const { data: qrcode, isLoading } = useSWR("api/auth/2fa/qrcode", fetcher);

  return (
    <>
      {!isLoading ? (
        <Image
          src={qrcode || ""}
          alt="qrcode"
          className="w-full max-w-[400px] border-4 border-secondary-400 rounded-xl  grid-cols-10 "
          width={400}
          height={400}
        />
      ) : (
        <Spinner />
      )}
    </>
  );
};

export default QrCode;
