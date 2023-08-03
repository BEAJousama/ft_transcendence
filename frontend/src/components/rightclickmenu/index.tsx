"use client"

import { twMerge } from "tailwind-merge";
import Button from "../button";


export const RightClickMenuItem = ({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: (e: any) => void;
  className?: string;
}) => {
  const handleClick = (e: any) => {
    e.preventDefault();
    onClick && onClick(e);
  };
  return (
    <li className="w-full h-full rounded-xl hover:!bg-[#4B4B75]">
      <Button
        variant="text"
        className={twMerge(
          "mx-2 !bg-inherit !text-sm text-white ",
          className && className
        )}
        onClick={handleClick}
      >
        {children}
      </Button>
    </li>
  );
};

const RightClickMenu = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <ul
      className={twMerge(
        "max-h-50 divide-y absolute z-30 divide-slate-700 rounded-l-xl flex flex-col justify-content rounded-br-xl !bg-[#7C7CA6] text-white scrollbar-hide",
        className && className
      )}
    >
      {children}
    </ul>
  );
};

export default RightClickMenu;