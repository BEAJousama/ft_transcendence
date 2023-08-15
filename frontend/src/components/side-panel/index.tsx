"use client"
import { MessageCircle } from 'lucide-react';
import { Home } from 'lucide-react';
import { Gamepad2 } from 'lucide-react';
import { User } from 'lucide-react';
import { Settings } from 'lucide-react';
import { LogOut } from 'lucide-react';
import { Search } from 'lucide-react';
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { useContext } from "react";
import { GameContext } from "@/context/game.context";
import { AppContext } from "@/context/app.context";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sidePanelItems = [
  {
    icon: <Home size={18} />,
    text: "Home",
    path: "/home",
  },
  {
    icon: <MessageCircle size={18} />,
    text: "Chat",
    path: "/chat",
  },
  {
    icon: <Search size={18} />,
    text: "Search",
    path: "/search",
  },
  {
    icon: <Gamepad2 size={18} />,
    text: "Pong Game",
    path: "/pong",
  },
  {
    icon: <User size={18} />,
    text: "Profile",
    path: "/profile",
  },
  {
    icon: <Settings size={18} />,
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
  const { socket, isInGame, setShow } = useContext(GameContext);
  const { user } = useContext(AppContext);
  return (
    <Link href={to || ""} className="w-full" prefetch={false} onClick={(e) => {
      if (isInGame.current) {
        e.preventDefault();
        setShow(true)
        socket?.emit("puase-game", {
          userId: user?.id
        });
      }
    }}>
      <li
        className={twMerge(
          `flex w-full items-center justify-center pt-2`,
          selected &&
          "relative before:absolute before:-left-1.5 before:h-full  before:rounded-md before:border-2 before:border-primary-500 before:bg-primary-500 before:text-primary-500 before:content-['1']",
          className
        )}
      >
        <button
          className={`flex items-center justify-start gap-4 rounded bg-secondary-900 py-2 font-bold hover:bg-secondary-900 md:w-8/12 ${selected ? "text-primary-500" : "text-secondary-300"
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
              <span className="hidden truncate text-left font-semibold md:block">{text}</span>
            </>
          )}
        </button>
      </li>
    </Link>
  );
};


const Sidepanel = ({ className }: { className?: string }) => {
  const path = usePathname();
  const { socket, isInGame, setShow } = useContext(GameContext);
  const { user } = useContext(AppContext);


  return (
    <aside
      className={twMerge(
        "sticky flex h-screen w-full flex-col items-center justify-between overflow-auto bg-secondary-900 py-8 text-secondary-300 scrollbar-hide md:py-8 rounded-r-3xl",
        className
      )}
    >
      <Link prefetch={false} href="/home" onClick={(e) => {

        if (isInGame.current) {
          e.preventDefault();
          setShow(true)
          socket?.emit("puase-game", {
            userId: user?.id
          });
        }
      }}>
        <div className="w-46 hidden items-center justify-center md:flex">
          <Image className="!w-64 px-6" src="/img/logo.png" alt="logo" width={256} height={256} />
        </div>
        <Image
          className="w-16 px-4 md:hidden"
          src="/img/smalllogo.svg"
          alt="logo"
          width={64}
          height={64}
        />
      </Link>
      <Items className="flex w-full flex-col gap-2 text-lg md:gap-4 md:text-sm">
        {sidePanelItems.map((item, index) => {
          return (
            <SidePanelItem
              key={index}
              to={item.path}
              selected={(path?.includes(item.path) && item.path !== "/") || (path === "/" && item.path === "/")}
              icon={item.icon}
              text={item.text}
            />
          );
        })}
      </Items>
      <div className="flex w-full flex-col items-center justify-center gap-4">
        <SidePanelItem
          className="bg-secondary-900 text-secondary-300 hover:bg-secondary-900"
          onClick={() => {
            document.cookie = `${"2fa_access_token"}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            document.cookie = `${"access_token"}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            window.location.reload();
          }}
        >
          <LogOut size={18} />
          <span className="hidden text-left md:block">Log Out</span>
        </SidePanelItem>
      </div>
    </aside>
  );
};

export default Sidepanel;
