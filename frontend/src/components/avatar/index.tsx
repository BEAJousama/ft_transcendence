"use client"


import { twMerge } from "tailwind-merge";
import Image from "next/image";

interface Istatus {
  ONLINE : string;
  OFFLINE : string;
  INGAME : string;
}
interface IAvatar {
  src?: string;
  alt?: string;
  className?: string;
  status?: Istatus;
}

const Avatar = ({
  src = "img/default.jpg",
  alt = "",
  className,
  status,
}: {
  src?: string;
  alt?: string;
  className?: string;
  status?: {};
}) => {
  return (
    <div
      className={twMerge("relative inline-block w-10 h-10 rounded-full  border-1 border-white ", className)}
    >
      <img
        className="w-full h-full rounded-full object-cover"
        src={src}
        alt={alt}
      />
      {status && <span className="w-3 h-3 rounded-full bg-green-500 border-1 border-white absolute bottom-0 right-0"></span>}
    </div>
  );
};

export default Avatar;