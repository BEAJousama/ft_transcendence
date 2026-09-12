"use client";
import {
	Gamepad2,
	Home,
	LogOut,
	Menu,
	MessageCircle,
	Search,
	Settings,
	User,
	X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import Avatar from "../avatar";
import { AppContext, logout } from "@/context/app.context";
import { GameContext } from "@/context/game.context";

const NAV_ITEMS = [
	{ icon: Home, text: "Home", path: "/home" },
	{ icon: MessageCircle, text: "Chat", path: "/chat" },
	{ icon: Search, text: "Search", path: "/search" },
	{ icon: Gamepad2, text: "Pong Game", path: "/pong" },
	{ icon: User, text: "Profile", path: "/profile" },
	{ icon: Settings, text: "Settings", path: "/settings" },
];

// Distance (px) the drawer must be swiped left before it closes on release.
const SWIPE_CLOSE_DISTANCE = 80;

const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-primary-400/60";

type Variant = "rail" | "drawer";

// Leaving a page mid-game would abandon the match, so navigation pauses the
// game and shows its prompt instead. Returns true when navigation was blocked.
const useGameGuard = () => {
	const { socket, isInGame, setShow } = useContext(GameContext);
	const { user } = useContext(AppContext);
	return useCallback(() => {
		if (!isInGame.current) return false;
		setShow(true);
		socket?.emit("puase-game", { userId: user?.id });
		return true;
	}, [isInGame, setShow, socket, user?.id]);
};

const HomeLogo = ({ className, onNavigate }: { className?: string; onNavigate?: () => void }) => {
	const blockedByGame = useGameGuard();
	return (
		<Link
			href="/home"
			prefetch={false}
			aria-label="Pong Masters home"
			className={twMerge("rounded-lg", focusRing)}
			onClick={(e) => {
				if (blockedByGame()) return e.preventDefault();
				onNavigate?.();
			}}
		>
			<Image
				src="/img/Logo.svg"
				alt=""
				width={192}
				height={24}
				priority
				className={twMerge("h-auto", className)}
			/>
		</Link>
	);
};

const NavList = ({ variant, onNavigate }: { variant: Variant; onNavigate?: () => void }) => {
	const path = usePathname();
	const blockedByGame = useGameGuard();

	return (
		<ul className={twMerge("flex w-full flex-col px-3", variant === "rail" ? "gap-1.5" : "gap-1")}>
			{NAV_ITEMS.map(({ icon: Icon, text, path: href }) => {
				const active = !!path?.startsWith(href);
				return (
					<li key={href} className="relative">
						{active && (
							<span
								aria-hidden
								className="absolute -left-1 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-primary-400"
							/>
						)}
						<Link
							href={href}
							prefetch={false}
							aria-current={active ? "page" : undefined}
							onClick={(e) => {
								if (blockedByGame()) return e.preventDefault();
								onNavigate?.();
							}}
							className={twMerge(
								"flex w-full items-center gap-3 rounded-xl px-4 font-medium transition-colors duration-200",
								focusRing,
								variant === "rail" ? "py-2.5 text-sm" : "min-h-[48px] text-[15px]",
								active
									? "bg-primary-400/10 text-primary-400"
									: "text-secondary-300 hover:bg-secondary-700/60 hover:text-secondary-100 active:bg-secondary-700"
							)}
						>
							<Icon size={variant === "rail" ? 18 : 20} aria-hidden />
							<span className="truncate">{text}</span>
						</Link>
					</li>
				);
			})}
		</ul>
	);
};

const LogoutButton = ({ variant }: { variant: Variant }) => {
	const blockedByGame = useGameGuard();
	return (
		<button
			type="button"
			onClick={() => {
				if (!blockedByGame()) logout();
			}}
			className={twMerge(
				"flex w-full items-center gap-3 rounded-xl px-4 font-medium text-secondary-400 transition-colors duration-200 hover:bg-red-500/10 hover:text-red-400 active:bg-red-500/15",
				focusRing,
				variant === "rail" ? "py-2.5 text-sm" : "min-h-[48px] text-[15px]"
			)}
		>
			<LogOut size={variant === "rail" ? 18 : 20} aria-hidden />
			<span>Log Out</span>
		</button>
	);
};

// Desktop (md and up): the persistent sticky rail.
const DesktopRail = ({ className }: { className?: string }) => (
	<aside
		className={twMerge(
			"sticky top-0 hidden h-screen w-full flex-col items-center justify-between overflow-hidden border-r border-white/[0.04] bg-secondary-900 py-8 text-secondary-300 scrollbar-hide md:flex",
			className
		)}
	>
		<HomeLogo className="w-48 px-4" />
		<nav aria-label="Main navigation" className="w-full">
			<NavList variant="rail" />
		</nav>
		<div className="w-full px-3">
			<LogoutButton variant="rail" />
		</div>
	</aside>
);

// Mobile (below md): a slim top bar that hides while scrolling down, and an
// off-canvas drawer so page content gets the full screen width.
const MobileNav = () => {
	const [open, setOpen] = useState(false);
	const [headerHidden, setHeaderHidden] = useState(false);
	const [dragX, setDragX] = useState(0);
	const touch = useRef<{ x: number; y: number; axis: "x" | "y" | null } | null>(null);
	const panelRef = useRef<HTMLElement>(null);
	const menuButtonRef = useRef<HTMLButtonElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const path = usePathname();
	const { user } = useContext(AppContext);
	const blockedByGame = useGameGuard();

	const close = useCallback(() => setOpen(false), []);

	useEffect(() => {
		setOpen(false);
		setHeaderHidden(false);
	}, [path]);

	// The drawer only exists below md; never leave it open (with the page
	// scroll-locked) after a rotation or resize to a wider viewport.
	useEffect(() => {
		const desktop = window.matchMedia("(min-width: 768px)");
		const onChange = () => desktop.matches && setOpen(false);
		desktop.addEventListener("change", onChange);
		return () => desktop.removeEventListener("change", onChange);
	}, []);

	useEffect(() => {
		let lastY = window.scrollY;
		let frame = 0;
		const onScroll = () => {
			if (frame) return;
			frame = requestAnimationFrame(() => {
				const y = window.scrollY;
				if (Math.abs(y - lastY) > 6) {
					setHeaderHidden(y > lastY && y > 56);
					lastY = y;
				}
				frame = 0;
			});
		};
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => {
			window.removeEventListener("scroll", onScroll);
			cancelAnimationFrame(frame);
		};
	}, []);

	// While open: lock page scroll, move focus into the drawer, keep Tab inside
	// it, and close on Escape. On close, focus returns to the menu button.
	useEffect(() => {
		if (!open) return;
		const menuButton = menuButtonRef.current;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		closeButtonRef.current?.focus();

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") return setOpen(false);
			if (e.key !== "Tab" || !panelRef.current) return;
			const focusable = panelRef.current.querySelectorAll<HTMLElement>(
				"a[href], button:not([disabled])"
			);
			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last?.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first?.focus();
			}
		};
		document.addEventListener("keydown", onKeyDown);

		return () => {
			document.body.style.overflow = previousOverflow;
			document.removeEventListener("keydown", onKeyDown);
			menuButton?.focus({ preventScroll: true });
		};
	}, [open]);

	const onTouchStart = (e: React.TouchEvent) => {
		const { clientX, clientY } = e.touches[0];
		touch.current = { x: clientX, y: clientY, axis: null };
	};

	const onTouchMove = (e: React.TouchEvent) => {
		const start = touch.current;
		if (!start) return;
		const dx = e.touches[0].clientX - start.x;
		const dy = e.touches[0].clientY - start.y;
		// Decide once per gesture whether it is a horizontal swipe or a vertical
		// scroll, so scrolling the link list never drags the drawer.
		if (!start.axis) {
			if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
			start.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
		}
		if (start.axis === "x") setDragX(Math.min(0, dx));
	};

	const onTouchEnd = () => {
		if (touch.current?.axis === "x" && dragX < -SWIPE_CLOSE_DISTANCE) setOpen(false);
		touch.current = null;
		setDragX(0);
	};

	const panelWidth = panelRef.current?.offsetWidth || 320;
	const dragging = dragX !== 0;

	return (
		<>
			<header
				className={twMerge(
					"sticky top-0 z-40 flex h-14 items-center justify-between gap-2 border-b border-white/[0.06] bg-secondary-900/85 px-2 backdrop-blur-xl transition-transform duration-300 ease-out motion-reduce:transition-none md:hidden",
					headerHidden && !open && "-translate-y-full"
				)}
			>
				<button
					ref={menuButtonRef}
					type="button"
					aria-label="Open navigation"
					aria-expanded={open}
					aria-controls="mobile-navigation"
					onClick={() => setOpen(true)}
					className={twMerge(
						"grid h-11 w-11 place-items-center rounded-xl text-secondary-200 transition-colors hover:bg-secondary-700/60 active:bg-secondary-700",
						focusRing
					)}
				>
					<Menu size={22} aria-hidden />
				</button>
				<HomeLogo className="w-36" />
				<Link
					href="/profile"
					prefetch={false}
					aria-label="Your profile"
					onClick={(e) => blockedByGame() && e.preventDefault()}
					className={twMerge("grid h-11 w-11 place-items-center rounded-xl", focusRing)}
				>
					<Avatar
						src={user?.avatar || "/img/default.jpg"}
						className="h-8 w-8 ring-1 ring-white/10"
					/>
				</Link>
			</header>

			<div
				className={twMerge(
					"fixed inset-0 z-50 transition-[visibility] duration-300 md:hidden",
					open ? "visible" : "invisible"
				)}
			>
				<div
					aria-hidden
					onClick={close}
					style={dragging ? { opacity: 1 + dragX / panelWidth, transition: "none" } : undefined}
					className={twMerge(
						"absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 motion-reduce:transition-none",
						open ? "opacity-100" : "opacity-0"
					)}
				/>
				<nav
					ref={panelRef}
					id="mobile-navigation"
					role="dialog"
					aria-modal="true"
					aria-label="Main navigation"
					onTouchStart={onTouchStart}
					onTouchMove={onTouchMove}
					onTouchEnd={onTouchEnd}
					onTouchCancel={onTouchEnd}
					style={dragging ? { transform: `translateX(${dragX}px)`, transition: "none" } : undefined}
					className={twMerge(
						"absolute inset-y-0 left-0 flex w-[min(20rem,85vw)] flex-col border-r border-white/[0.06] bg-secondary-900 shadow-2xl shadow-black/50 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
						open ? "translate-x-0" : "-translate-x-full"
					)}
				>
					<div className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.06] pl-4 pr-2">
						<HomeLogo className="w-36" onNavigate={close} />
						<button
							ref={closeButtonRef}
							type="button"
							aria-label="Close navigation"
							onClick={close}
							className={twMerge(
								"grid h-11 w-11 place-items-center rounded-xl text-secondary-300 transition-colors hover:bg-secondary-700/60 hover:text-secondary-100 active:bg-secondary-700",
								focusRing
							)}
						>
							<X size={22} aria-hidden />
						</button>
					</div>

					{user && (
						<Link
							href="/profile"
							prefetch={false}
							onClick={(e) => {
								if (blockedByGame()) return e.preventDefault();
								close();
							}}
							className={twMerge(
								"mx-3 mt-4 flex shrink-0 items-center gap-3 rounded-2xl border border-white/[0.06] bg-secondary-800/70 p-3 transition-colors hover:border-primary-400/20 active:bg-secondary-800",
								focusRing
							)}
						>
							<Avatar
								src={user.avatar || "/img/default.jpg"}
								className="h-11 w-11 shrink-0 ring-1 ring-white/10"
							/>
							<div className="min-w-0">
								<p className="truncate text-sm font-semibold text-secondary-50">
									{user.fullname || user.login}
								</p>
								<p className="truncate text-xs text-secondary-400">@{user.login}</p>
							</div>
						</Link>
					)}

					<div className="mt-4 flex-1 overflow-y-auto overscroll-contain scrollbar-hide">
						<NavList variant="drawer" onNavigate={close} />
					</div>

					<div className="shrink-0 border-t border-white/[0.06] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
						<LogoutButton variant="drawer" />
					</div>
				</nav>
			</div>
		</>
	);
};

const Sidepanel = ({ className }: { className?: string }) => (
	<>
		<MobileNav />
		<DesktopRail className={className} />
	</>
);

export default Sidepanel;
