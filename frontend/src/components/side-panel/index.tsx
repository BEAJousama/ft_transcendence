import { BsFillChatDotsFill } from "react-icons/bs";
import { AiFillHome } from "react-icons/ai";
import { TbDeviceGamepad2 } from "react-icons/tb";
import { CgProfile } from "react-icons/cg";
import { RiListSettingsFill } from "react-icons/ri";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { IoIosNotifications } from "react-icons/io";
import { Link, useLocation } from "react-router-dom";
import { BiSearch } from "react-icons/bi";
import { twMerge } from "tailwind-merge";

const sidePanelItems = [
  {
    icon: <AiFillHome size={18} />,
    text: "Home",
    path: "/",
  },
  {
    icon: <BsFillChatDotsFill size={18} />,
    text: "Chat",
    path: "/chat",
  },
  {
    icon: <BiSearch size={18} />,
    text: "Search",
    path: "/search",
  },
  {
    icon: <TbDeviceGamepad2 size={18} />,
    text: "Pong Game",
    path: "/pong",
  },
  {
    icon: <IoIosNotifications size={20} />,
    text: "Notifications",
    path: "/notifications",
  },
  {
    icon: <CgProfile size={18} />,
    text: "Profile",
    path: "/profile",
  },
  {
    icon: <RiListSettingsFill size={18} />,
    text: "Settings",

    path: "/settings",
  },
];

const Items = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <ul className={`${className}`}>{children}</ul>;
};

const SidePanelItem = ({
  children,
  selected,
  className,
  onClick,
  to,
  icon,
  text,
}: {
  children?: React.ReactNode;
  selected?: boolean;
  className?: string;
  onClick?: () => void;
  to?: string;
  icon?: React.ReactNode;
  text?: string;
}) => {
  return (
    <Link to={to || ""} className="w-full">
      <li
        className={twMerge(
          `flex w-full items-center justify-center pt-2`,
          selected &&
          "relative before:absolute before:-left-1.5 before:h-full  before:rounded-md before:border-2 before:border-primary-500 before:bg-primary-500 before:text-primary-500 before:content-['1']",
          className
        )}
      >
        <button
          className={`flex items-center justify-start gap-4 rounded bg-secondary-800 py-2 font-bold hover:bg-secondary-800 md:w-8/12 ${selected ? "text-primary-500" : "text-secondary-400"
            }`}
          onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            onClick && onClick();
          }}
        >
          {children ? (
            children
          ) : (
            <>
              {icon}
              <span className="hidden truncate text-left md:block">{text}</span>
            </>
          )}
        </button>
      </li>
    </Link>
  );
};


const Sidepanel = ({ className }: { className?: string }) => {
  const path = useLocation().pathname;

  return (
    <aside
      className={twMerge(
        "sticky flex h-screen w-full flex-col items-center justify-between overflow-auto bg-secondary-800 py-4 text-secondary-300 scrollbar-hide md:py-8",
        className
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
      <Items className="flex w-full flex-col gap-2 text-lg md:gap-4 md:text-sm">
        {sidePanelItems.map((item, index) => {
          return (
            <SidePanelItem
              key={index}
              to={item.path}
              selected={path === item.path}
              icon={item.icon}
              text={item.text}
            />
          );
        })}
      </Items>
      <div className="flex w-full flex-col items-center justify-center gap-4">
        <SidePanelItem
          className="bg-secondary-800 text-secondary-300 hover:bg-secondary-800"
          onClick={() => {
            localStorage?.removeItem("access_token");
            localStorage?.removeItem("2fa_access_token");
            window.location.reload();
          }}
        >
          <RiLogoutBoxRLine size={18} />
          <span className="hidden text-left md:block">Log Out</span>
        </SidePanelItem>
      </div>
    </aside>
  );
};

export default Sidepanel;
