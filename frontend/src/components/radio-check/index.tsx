const RadioCheck = ({
    options,
    label,
    htmlFor,
    onChange,
    value,
}: {
    label?: string;
    htmlFor?: string;
    options: string[];
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    value?: string;
}) => {
    return (
        <div className="flex w-full flex-col items-center gap-2 pt-2">
            <div className="text-white">{label}</div>
            <ul>
                {options.map((option: string, i: number) => {
                    return (
                        <div className="flex items-center" key={i}>
                            <input
                                checked={value === option}
                                id={htmlFor}
                                type="radio"
                                onChange={onChange}
                                value={option}
                                name={htmlFor}
                                className="border-gray-300 ring-offset-gray-800 h-4 w-4 bg-gray-100 text-blue-600 focus:ring-2 "
                            />
                            <label htmlFor={htmlFor} className="ml-2 text-sm font-medium " onClick={() => {
                                onChange && onChange({ target: { value: option } } as any)
                            }}>
                                {option}
                            </label>
                        </div>
                    );
                })}
            </ul>
        </div>
    );
};


export default RadioCheck;