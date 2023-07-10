import Button from "../button";
import clsx from "clsx";

export const RightClickMenuItem = ({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: (e: any) => void;
  className?: string;
}) => {
  const handleClick = ( e: any ) => {
    e.preventDefault();
    onClick && onClick(e);
  };
  return (
    <li className="w-full">
      <Button
        variant="text"
        className={clsx(
          "m-2 !bg-inherit !text-sm text-white",
          className && className
        )}
        onClick={handleClick}
      >
        {children}
      </Button>
    </li>
  );
};

const RightClickMenu = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <ul
      className={clsx(
        "max-h-50 absolute left-1/2 top-1/2 z-10 -translate-x-1 -translate-y-1 transform overflow-scroll rounded-l-xl rounded-br-xl !bg-secondary-800 text-white scrollbar-hide",
        className && className
      )}
    >
      {children}
    </ul>
  );
};

export default RightClickMenu;
