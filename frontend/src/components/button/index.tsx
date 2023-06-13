import clsx from "clsx";
import { Children } from "react";

const Button = ({
  type = "primary",
  className,
  children,
  htmlType = "button",
  disabled,
  onClick,
  variant = "contained",
}: {
  type?: "primary" | "danger" | "success" | "cuation";
  className?: string;
  htmlType?: "button" | "submit" | "reset";
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  variant?: "text" | "contained" | "outlined";
}) => {
  const array = Children.toArray(children).slice(0);
  if (disabled) {
    return (
      <button
        className={clsx(
          `flex w-full items-center gap-4 rounded border border-primary-800 px-4 py-2 font-bold text-primary-800`,
          array?.length == 1 && "justify-center",
          className && className
        )}
        disabled={disabled}
        onClick={onClick}
        type={htmlType}
      >
        {children}
      </button>
    );
  }
  return (
    <>
      {type === "primary" && (
        <>
          <button
            className={`
              ${variant === "contained"
                ? `flex items-center gap-4 rounded
                bg-primary-400 px-4 py-2 font-bold text-white hover:bg-primary-700`
                : variant === "outlined"
                  ? `flex items-center gap-4 rounded border border-gray-400 bg-white px-4 py-2 font-semibold text-gray-800 shadow  hover:bg-gray-200`
                  : `flex items-center gap-4 rounded bg-white px-4 py-2 font-semibold text-gray-800 hover:bg-gray-200 `
              } ${className} ${array?.length === 1 && "!justify-center"}
            `}
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
            className={`flex items-center gap-4 rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700 ${className}`}
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
            className={`flex items-center gap-4 rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700 ${className} `}
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
            className={`flex items-center gap-4 rounded bg-yellow-500 px-4 py-2 font-bold text-white hover:bg-yellow-700 ${className}`}
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
