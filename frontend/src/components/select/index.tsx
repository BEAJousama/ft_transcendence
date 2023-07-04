 
import clsx from "clsx";

export default function Select({className, label, options, setX, value} : { className?: string, options?: string[], setX?: any, label?: string, value?: string}) {
  return (
    <div className={clsx("relative w-full bg-inherit", className && className)}>
        <label
        htmlFor=""
        className={clsx(
          "man-w-min absolute -top-2 left-1.5 z-10 rounded bg-secondary-500 px-1 text-xs font-semibold",
          "text-quaternary-200",
        )}
      >
        {label}
      </label>
        <select id={label} defaultValue={value} 
        className="bg-inherit border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
        {
            options?.map((option,i) => {
                return(
                    <option key={i} value={option} onClick={()=>{setX(option)}}>
                    {option}
                    </option>
                )
            })
        }
      </select>
      </div>
  );
}
