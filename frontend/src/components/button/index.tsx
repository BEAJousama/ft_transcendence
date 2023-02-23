const Button = ({
  type,
  className,
  children,
  htmlType = "button",
  disabled,
  onClick,
  variant = "contained",
}: {
  type?: "primary" | "secondary" | "danger" | "success";
  className?: string;
  htmlType?: "button" | "submit" | "reset";
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  variant?: "text" | "contained" | "outlined";
}) => {
  let color: string = "";
  if (type === "primary") color = "blue";
  else if (type === "secondary") color = "secondarycolor";
  else if (type === "danger") color = "red";
  else if (type === "success") {
    color = "green";
    console.log(
      `bg-${color}-500 hover:bg-${color}-700 text-white font-bold py-2 px-4 rounded flex items-center gap-4 `
    );
  }
  return (
    <button
      className={
        variant == "contained"
          ? `bg-${color}-500 hover:bg-${color}-700 text-white font-bold py-2 px-4 rounded flex items-center gap-4 `
          : variant == "outlined"
          ? `bg-white hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 border border-${color}-400 rounded flex items-center gap-4  shadow`
          : `bg-white hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded flex items-center gap-4 `
      }
      disabled={disabled}
      onClick={onClick}
      type={htmlType}
    >
      {children}
    </button>
  );
};

export default Button;
