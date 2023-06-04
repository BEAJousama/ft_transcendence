 
export default function Select({label, options, setVisibility, value} : {options?: string[], setVisibility?: any, label?: string, value?: string}) {
  return (
    <>
        <label className="w-full mb-2 text-sm font-medium text-gray-900 dark:text-white">{label}:</label>
        <select id={label} defaultValue={value} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
        {
            options?.map((option,i) => {
                return(
                    <option key={i} value={option} onClick={()=>{setVisibility(option) ; console.log(value)}}>
                    {option}
                    </option>
                )
            })
        }
      </select>
      </>
  );
}
