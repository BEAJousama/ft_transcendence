const Input = ({
  className,
  label,
  error,
  value,
  onChange,
  htmlType,
  placeholder,
}: {
  className: string;
  label: string;
  htmlType: string;
  error?: string;
  value: string;
  placeholder: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <div>
      <label
        htmlFor="success"
        className="block mb-2 text-sm font-medium text-red-700 dark:text-red-500"
      >
        {label}
      </label>
      <input
        type={htmlType}
        id="success"
        className="bg-red-50 border border-red-500 text-red-900 placeholder-red-700 text-sm rounded-lg focus:ring-red-500 dark:bg-gray-700 focus:border-red-500 block w-full p-2.5 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500"
        placeholder={placeholder}
        value={value}
      />
      <p className="mt-2 text-sm text-red-600 dark:text-red-500">
        <span className="font-medium">Oh, snapp!</span>
      </p>
    </div>
  );
};

export default Input;
