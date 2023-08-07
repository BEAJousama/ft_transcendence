"use client"


import { twMerge } from "tailwind-merge";
import Image from "next/image";

const Avatar = ({
  src = "img/default.jpg",
  alt = "",
  className,
  status,
}: {
  src?: string;
  alt?: string;
  className?: string;
  status?: "ONLINE" | "OFFLINE" | "INGAME";
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
      {status === "ONLINE" && <span className="w-3 h-3 rounded-full bg-green-500 border-1 border-white absolute bottom-0 right-0"></span>}
      {status === "INGAME" && <span className="w-3 h-3 rounded-full bg-yellow-600 border-1 border-white absolute bottom-0 right-0"></span>}
    </div>
  );
};

export default Avatar;
