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
  return (
    <>
      {type === "primary" && (
        <>
          <button
            className={`
              ${variant === "contained"
                ? `bg-primary-400 hover:bg-primary-700 text-white font-bold
                py-2 px-4 rounded flex items-center gap-4 hover:shadow-sm `
                : variant === "outlined"
                  ? `bg-white hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded flex items-center gap-4  shadow`
                  : `bg-white hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded flex items-center gap-4 `
              } ${className}
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
            className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-4 ${className}`}
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
            className={`bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center gap-4 ${className} `}
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
            className={`bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded flex items-center gap-4 ${className}`}
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
