

import Select from "react-select";
import { twMerge } from "tailwind-merge";

export default function CustomSelect({ className, label, options, setX, value }: { className?: string, options?: string[], setX?: any, label?: string, value?: string }) {

  const newOptions = options?.map((option) => {
    return { value: option, label: option };
  });

  return (
    <div className={twMerge("relative w-full bg-inherit z-30 p-0", className && className)}>
      <label
        className={twMerge(
          "man-w-min absolute -top-2 left-1.5 z-10 rounded bg-secondary-500 px-1 text-xs font-semibold",
          "text-quaternary-200",
        )}
      >
        {label}
      </label>
      <Select
        className="my-react-select-container"
        classNamePrefix="my-react-select"
        id={label}
        defaultValue={newOptions ? newOptions[0] : ''}
        options={newOptions}
        onChange={(selectedOption: any) => {
          const optionValue = selectedOption ? selectedOption.value : '';
          setX(optionValue);
        }}
      />
    </div>
  );
}
