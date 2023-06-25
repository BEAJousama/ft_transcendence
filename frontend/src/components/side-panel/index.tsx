import { BsFillChatDotsFill } from "react-icons/bs";
import { AiFillHome } from "react-icons/ai";
import { TbDeviceGamepad2 } from "react-icons/tb";
import { CgProfile } from "react-icons/cg";
import { RiListSettingsFill, RiProfileFill} from "react-icons/ri";
import { IoMdNotifications } from "react-icons/io";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { IoIosNotifications } from "react-icons/io";
import clsx from "clsx";
import { Link, useLocation } from "react-router-dom";
import { BiSearch } from "react-icons/bi";

const List = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <ul className={`${className}`}>{children}</ul>;
};

const ListItem = ({
  children,
  selected,
  className,
  onClick,
}: {
  children: React.ReactNode;
  selected?: boolean;
  className?: string;
  onClick?: () => void;
}) => {
  return (
    <li
      className={`flex w-full items-center justify-center pt-2 ${selected &&
        "relative before:absolute before:-left-1.5 before:h-full  before:rounded-md before:border-2 before:border-primary-500 before:bg-primary-500 before:text-primary-500 before:content-['1']"
        } ${className}`}
    >
      <button
        className={`flex items-center justify-start gap-4 rounded bg-secondary-800 py-2 font-bold hover:bg-secondary-800 md:w-8/12 ${selected ? "text-primary-500" : "text-secondary-400"
          }`}
        onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          onClick && onClick();
        }}
      >
        {children}
      </button>
    </li>
  );
};

const Sidepanel = ({ className }: {
  className?: string;
}) => {
  const path = useLocation().pathname;

  return (
    <aside
      className={clsx(
        "sticky flex h-screen flex-col items-center justify-between bg-secondary-800 py-4 text-secondary-300 md:py-8 overflow-auto scrollbar-hide",
        className && className
      )}
    >
      <Link to="/">
        <div className="w-46 hidden items-center justify-center md:flex">
          <img className="!w-64 px-6" src="/img/logo.png" alt="logo" />
        </div>
        <img
          className="w-16 px-4 md:hidden"
          src="/img/smalllogo.svg"
          alt="logo"
        />
      </Link>
      <List className="flex w-full flex-col gap-2 text-lg md:gap-4 md:text-sm">
        <Link to="/">
          <ListItem selected={path === "/"}>
            <AiFillHome size={18} />
            <span className="hidden md:block text-left">Home</span>
          </ListItem>
        </Link>
        <Link to="/chat">
          <ListItem selected={path === "/chat"}>
            <BsFillChatDotsFill size={18} />
            <span className="hidden md:block text-left">Chat</span>
          </ListItem>
        </Link>
        <Link to="/search">
          <ListItem selected={path === "/search"}>
            <BiSearch size={18} />
            <span className="hidden md:block text-left">Search</span>
          </ListItem>
        </Link>
        <Link to="/pong">
          <ListItem selected={path.includes("/pong")}>
            <TbDeviceGamepad2 size={18} />
            <span className="hidden md:block text-left">Pong Game</span>
          </ListItem>
        </Link>
        <Link to="/notifications">
          <ListItem selected={path === "/notifications"}>
            <IoIosNotifications size={18} />
            <span className="hidden md:block text-left truncate">Notifications</span>
          </ListItem>
        </Link>
        <Link to="/profile">
          <ListItem selected={path.includes("/profile")}>
            <CgProfile size={18} />
            <span className="hidden md:block text-left">Profile</span>
          </ListItem>
        </Link>
        <Link to="/settings">
          <ListItem selected={path === "/settings"}>
            <RiListSettingsFill size={18} />
            <span className="hidden md:block text-left">Settings</span>
          </ListItem>
        </Link>
      </List>
      <div className="flex w-full flex-col items-center justify-center gap-4">
        <ListItem className="bg-secondary-800 text-secondary-300 hover:bg-secondary-800" onClick={() => {
          localStorage?.removeItem("access_token");
          localStorage?.removeItem("2fa_access_token");
          window.location.reload();
        }}>
          <RiLogoutBoxRLine size={18} />
          <span className="hidden md:block text-left">Log Out</span>
        </ListItem>
      </div>
    </aside>
  );
};

export default Sidepanel;
