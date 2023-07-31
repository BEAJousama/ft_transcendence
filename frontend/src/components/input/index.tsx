import { InputHTMLAttributes, RefObject, useState } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  label?: string;
  htmlType?: string;
  error?: string;
  value?: string;
  placeholder?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
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
  type?: string;
}

const Input = ({
  inputRef,
  className,
  label,
  error,
  name,
  value,
  onChange,
  onKeyDown,
  onBlur,
  htmlType = "text",
  placeholder,
  options,
  pattern,
  MaxLength,
  id,
  isError,
  hidden,
  disabled,
  type = "text",
  required,
}: InputProps) => {
  const [active, setActive] = useState(false);
  return (
    <div className="relative w-full bg-inherit">
      <label
        htmlFor=""
        className={twMerge(
          "man-w-min absolute -top-2 left-1.5 rounded bg-inherit px-1 text-xs font-semibold ",
          disabled && "text-primary-800",
          active && "text-primary-500",
          !disabled && !active && "text-quaternary-200",
          error && !active && "text-red-700",
          (className === undefined || className?.lastIndexOf('bg-') == -1) && "!bg-secondary-500"
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
        onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
          setActive(false);
          onBlur && onBlur(e);
        }}
        type={htmlType}
        className={twMerge(`flex w-full flex-col items-center justify-center rounded-md border-2 border-quaternary-200 bg-transparent p-3 
        text-sm font-semibold text-quaternary-200 
        outline-none focus:border-primary-500 focus:text-primary-500 focus:shadow-md focus:shadow-gray-700 
        disabled:border-primary-800 disabled:text-primary-800`,
          isError && `border-red-700 text-red-700`, className)}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
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