"use client"

import { Children } from "react";
import { twMerge } from "tailwind-merge";

const Button = ({
  type = "primary",
  className,
  children,
  htmlType = "button",
  disabled,
  onClick,
  variant = "contained",
}: {
  type?: "primary" | "danger" | "success" | "cuation" | "secondary" | "simple";
  className?: string;
  htmlType?: "button" | "submit" | "reset";
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  variant?: "text" | "contained";
}) => {
  const array = Children.toArray(children).slice(0);
  return (
    <>
      {type === "simple" && (
        <>
          <button
            className={twMerge(
              variant === "contained" &&
              "duration-400 m-auto flex items-center  rounded bg-primary-500 p-2  font-bold text-secondary-500 transition ease-in-out hover:bg-secondary-200",
              variant === "text" &&
              "flex items-center rounded bg-white  font-semibold text-gray-800 hover:bg-secondary-200",
              className,
              array?.length === 1 && "!justify-center"
            )}
            disabled={disabled}
            onClick={onClick}
            type={htmlType}
          >
            {children}
          </button>
        </>
      )}
      {type === "primary" && (
        <>
          <button
            className={twMerge(
              variant === "contained" &&
              "duration-400 flex items-center gap-4 rounded bg-primary-500 px-4 py-2 font-bold text-secondary-500 transition ease-in-out hover:scale-105 hover:shadow-[0px_0px_6px] hover:shadow-primary-500 hover:ring-2 hover:ring-primary-500 hover:ring-opacity-40",
              variant === "text" &&
              "flex items-center gap-4 rounded bg-white px-4 py-2 font-semibold text-gray-800 hover:bg-gray-200",
              className,
              array?.length === 1 && "justify-center"
            )}
            disabled={disabled}
            onClick={onClick}
            type={htmlType}
          >
            {children}
          </button>
        </>
      )}
      {type === "secondary" && (
        <>
          <button
            className={twMerge(
              variant === "contained" &&
              "duration-400 flex items-center gap-4 rounded border-2 border-primary-500 bg-inherit px-4 py-2 font-bold text-primary-500 transition ease-in-out hover:scale-105 hover:bg-primary-500 hover:text-secondary-500 hover:shadow-[0px_0px_6px] hover:shadow-primary-500",
              variant === "text" &&
              "flex items-center gap-4 rounded bg-white px-4 py-2 font-semibold text-gray-800 hover:bg-gray-200",
              className,
              array?.length === 1 && "justify-center"
            )}
            disabled={disabled}
            onClick={onClick}
            type={htmlType}
          >
            {children}
          </button>
        </>
      )}

      {type === "success" && (
        <>
          <button
            className={twMerge(
              `flex items-center gap-4 rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700`,
              className
            )}
            disabled={disabled}
            onClick={onClick}
            type={htmlType}
          >
            {children}
          </button>
        </>
      )}
      {type === "danger" && (
        <>
          <button
            className={twMerge(
              `flex items-center gap-4 rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700`,
              className
            )}
            disabled={disabled}
            onClick={onClick}
            type={htmlType}
          >
            {children}
          </button>
        </>
      )}
      {type === "cuation" && (
        <>
          <button
            className={twMerge(
              `flex items-center gap-4 rounded bg-yellow-500 px-4 py-2 font-bold text-white hover:bg-yellow-700`,
              className
            )}
            disabled={disabled}
            onClick={onClick}
            type={htmlType}
          >
            {children}
          </button>
        </>
      )}
    </>
  );
};

export default Button;
