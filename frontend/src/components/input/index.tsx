import { InputHTMLAttributes, RefObject, useState } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  label?: string;
  htmlType?: "text" | "select" | "file";
  error?: string;
  value?: string;
  placeholder?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  options?: string[];
  pattern?: string;
  isError?: boolean;
  ref?: React.RefObject<HTMLInputElement>;
  inputRef?: RefObject<HTMLInputElement>;
  MaxLength?: number;
  hidden?: boolean;
  disabled?: boolean;
  required?: boolean;
}

const Input = ({
  inputRef,
  className,
  label,
  error,
  value,
  onChange,
  htmlType = "text",
  placeholder,
  options,
  pattern,
  MaxLength,
  id,
  isError,
  hidden,
  disabled,
  required,
}: InputProps) => {
  const [active, setActive] = useState(false);

  return (
    <div className="relative w-full bg-inherit">
      <label
        htmlFor=""
        className={clsx(
          "font-semibold absolute -top-2 left-1.5 bg-secondary-500 rounded px-1 text-xs man-w-min bg-inherit",
          disabled && "text-primary-800",
          active && "text-primary-500",
          !disabled && !active && "text-quaternary-200",
          error && !active && "text-red-700"
        )}
      >
        {label}
      </label>
      <input
        onFocus={() => {
          setActive(true);
        }}
        onBlur={() => {
          setActive(false);
        }}
        type="text"
        id=""
        className={`flex flex-col justify-center items-center bg-transparent border-2 rounded-md p-3 w-full font-semibold outline-none border-quaternary-200 text-quaternary-200 
        focus:border-primary-500 focus:text-primary-500 text-sm focus:shadow-md focus:shadow-gray-700 
        disabled:border-primary-800 disabled:text-primary-800 ${clsx(
          isError && "border-red-700 text-red-700"
        )} ${className}`}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        pattern={pattern}
        maxLength={MaxLength}
        hidden={hidden}
        ref={inputRef}
      />
      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-500">
          <span className="font-medium">{error}</span>
        </p>
      )}
    </div>
  );
};

export default Input;
