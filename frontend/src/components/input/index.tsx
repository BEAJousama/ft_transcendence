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
  name?: string;
  id?: string;
}

const Input = ({
  inputRef,
  className,
  label,
  error,
  name,
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
          "man-w-min absolute -top-2 left-1.5 z-10 rounded bg-secondary-500 px-1 text-xs font-semibold",
          disabled && "text-primary-800",
          active && "text-primary-500",
          !disabled && !active && "text-quaternary-200",
          error && !active && "text-red-700"
        )}
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        onFocus={() => {
          setActive(true);
        }}
        onBlur={() => {
          setActive(false);
        }}
        type="text"
        className={`flex w-full flex-col items-center justify-center rounded-md border-2 border-quaternary-200 bg-transparent p-3 text-sm font-semibold text-quaternary-200 
        outline-none focus:border-primary-500 focus:text-primary-500 focus:shadow-md focus:shadow-gray-700 
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