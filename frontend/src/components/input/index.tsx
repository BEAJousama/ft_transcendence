const Input = ({
  className,
  label,
  error,
  value,
  onChange,
  htmlType = "text",
  placeholder,
  options,
}: {
  className?: string;
  label?: string;
  htmlType?: "text" | "select";
  error?: string;
  value?: string;
  placeholder?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  options?: string[];
}) => {
  return (
    <div className="w-full">
      {htmlType == "text" && (
        <>
          <label
            htmlFor="success"
            className={
              error
                ? "block mb-2 text-sm font-medium text-red-700 dark:text-red-500"
                : "block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            }
          >
            {label}
          </label>
          <input
            type={htmlType}
            id="success"
            className={
              error
                ? "bg-red-50 border border-red-500 text-red-900 placeholder-red-700 text-sm rounded-lg focus:ring-red-500 dark:bg-gray-700 focus:border-red-500 block w-full p-2.5 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500"
                : "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            }
            placeholder={placeholder}
            value={value}
            onChange={onChange}
          />
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              <span className="font-medium">{error}</span>
            </p>
          )}
        </>
      )}
      {htmlType == "select" && (
        <>
          <label
            htmlFor="select"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            {label}
          </label>
          <select
            id="select"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option selected>{value || "-- select an option --"}</option>
            {options &&
              options.map((item) => {
                return <option>{item}</option>;
              })}
          </select>
        </>
      )}
    </div>
  );
};

export default Input;
