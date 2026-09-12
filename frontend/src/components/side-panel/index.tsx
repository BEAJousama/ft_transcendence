"use client";
import { MessageCircle, Home, Gamepad2, User, Settings, LogOut, Search } from "lucide-react";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { useContext } from "react";
import { GameContext } from "@/context/game.context";
import { AppContext, logout } from "@/context/app.context";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sidePanelItems = [
	{ icon: <Home size={18} />, text: "Home", path: "/home" },
	{ icon: <MessageCircle size={18} />, text: "Chat", path: "/chat" },
	{ icon: <Search size={18} />, text: "Search", path: "/search" },
	{ icon: <Gamepad2 size={18} />, text: "Pong Game", path: "/pong" },
	{ icon: <User size={18} />, text: "Profile", path: "/profile" },
	{ icon: <Settings size={18} />, text: "Settings", path: "/settings" },
];

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
		<Link
			href={to || ""}
			className="w-full"
			prefetch={false}
			onClick={(e) => {
				if (isInGame.current) {
					e.preventDefault();
					setShow(true);
					socket?.emit("puase-game", { userId: user?.id });
				}
			}}
		>
			<li
				className={twMerge(
					"group relative flex w-full items-center justify-center rounded-xl px-2 py-2.5 transition-all duration-200 ease-out",
					selected
						? "bg-primary-400/10 text-primary-400"
						: "text-secondary-300 hover:bg-secondary-700/60 hover:text-secondary-100",
					className
				)}
			>
				{selected && (
					<div className="absolute -left-1 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-primary-400" />
				)}
				<button
					className="flex w-full items-center justify-center gap-3 md:justify-start md:px-2"
					onClick={(e) => {
						if (!isInGame.current) onClick && onClick();
					}}
				>
					{children ? (
						children
					) : (
						<>
							{icon}
							<span className="hidden truncate text-left text-sm font-medium md:block">
								{text}
							</span>
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
				"sticky top-0 flex h-screen w-full flex-col items-center justify-between overflow-hidden border-r border-white/[0.04] bg-secondary-900 py-6 text-secondary-300 scrollbar-hide md:py-8",
				className
			)}
		>
			<Link
				prefetch={false}
				href="/home"
				onClick={(e) => {
					if (isInGame.current) {
						e.preventDefault();
						setShow(true);
						socket?.emit("puase-game", { userId: user?.id });
					}
				}}
			>
				<div className="w-46 hidden items-center justify-center md:flex">
					<Image className="!w-48 px-4" src="/img/Logo.svg" alt="logo" width={192} height={24} />
				</div>
				<Image className="w-12 px-2 md:hidden" src="/img/smalllogo.svg" alt="logo" width={48} height={48} />
			</Link>
			<ul className="flex w-full flex-col gap-1 px-2 text-lg md:gap-1.5 md:px-3 md:text-sm">
				{sidePanelItems.map((item, index) => (
					<SidePanelItem
						key={index}
						to={item.path}
						selected={
							(path?.includes(item.path) && item.path !== "/") ||
							(path === "/" && item.path === "/")
						}
						icon={item.icon}
						text={item.text}
					/>
				))}
			</ul>
			<div className="flex w-full flex-col items-center justify-center gap-4 px-2 md:px-3">
				<SidePanelItem
					className="text-secondary-400 hover:text-red-400 hover:bg-red-500/10"
					onClick={logout}
				>
					<LogOut size={18} />
					<span className="hidden text-left text-sm font-medium md:block">Log Out</span>
				</SidePanelItem>
			</div>
		</aside>
	);
};

export default Sidepanel;
