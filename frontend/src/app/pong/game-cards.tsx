"use client";
import { Button, Card, Input, Spinner, UserBanner } from "@/components";
import useSwr from "swr";
import { AppContext, fetcher } from "@/context/app.context";
import { GameContext } from "@/context/game.context";
import IUser from "@/interfaces/user";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import Image from "next/image";
import { SocketContext } from "@/context/socket.context";
import { Bot, Swords, Users } from "lucide-react";
import { twMerge } from "tailwind-merge";

const GAME_MODES = ["Classic Mode", "Ranked Mode", "Time Attack"];
const POWER_OPTIONS = ["Classic", "Power Shot", "ShrinkingPaddle"];
type CardMode = "invite" | "ai" | "queue";

const modeCards: Array<{
	id: CardMode;
	title: string;
	description: string;
	icon: React.ReactNode;
}> = [
	{
		id: "invite",
		title: "Invite a friend",
		description: "Challenge a specific online friend in real-time.",
		icon: <Users className="h-4 w-4" />,
	},
	{
		id: "ai",
		title: "Train vs AI",
		description: "Warm up your reflexes against a smart bot.",
		icon: <Bot className="h-4 w-4" />,
	},
	{
		id: "queue",
		title: "Matchmaking queue",
		description: "Join queue and get matched with online players.",
		icon: <Swords className="h-4 w-4" />,
	},
];

const OptionGroup = ({
	label,
	value,
	options,
	onSelect,
}: {
	label: string;
	value: string;
	options: string[];
	onSelect: (next: string) => void;
}) => {
	return (
		<div className="w-full space-y-2">
			<p className="ui-label">{label}</p>
			<div className="flex flex-wrap gap-2">
				{options.map((option) => {
					const selected = option === value;
					return (
						<button
							key={option}
							type="button"
							onClick={() => onSelect(option)}
							className={twMerge(
								"rounded-xl border px-3.5 py-1.5 text-sm transition-all duration-200 ease-out",
								selected
									? "border-primary-400/50 bg-primary-400/15 text-primary-400 font-medium"
									: "border-white/[0.08] bg-secondary-800 text-secondary-200 hover:bg-secondary-700"
							)}
						>
							{option}
						</button>
					);
				})}
			</div>
		</div>
	);
};

const CreateGameCard = ({
	onClick,
	onCancel,
	title,
	showLoading,
	content,
	showOptions,
	disabled,
	name,
	className,
	invite,
	mode,
	gameMode,
	setGameMode,
	gameOption,
	setGameOption,
}: {
	onClick: () => void;
	onCancel: () => void;
	title: string;
	showLoading?: boolean;
	showOptions?: boolean;
	content: string;
	disabled?: boolean;
	name?: string;
	className?: string;
	invite?: boolean;
	mode: CardMode;
	gameMode?: string;
	setGameMode?: React.Dispatch<React.SetStateAction<string>>;
	gameOption?: string;
	setGameOption?: React.Dispatch<React.SetStateAction<string>>;
}) => {
	const { data: users, isLoading } = useSwr("api/users", fetcher, {
		errorRetryCount: 0,
		refreshInterval: 1000,
	});
	const [value, setValue] = useState<string>("");
	const [show, setShow] = useState<boolean>(false);
	const [showPicker, setShowPicker] = useState<boolean>(false);
	const [selectedUser, setSelectedUser] = useState<IUser>();
	const [filtered, setFiltered] = useState<IUser[]>();
	const { socket } = useContext(GameContext);
	const notificationSocket = useContext(SocketContext);
	const { user } = useContext(AppContext);
	const modeMeta = modeCards.find((entry) => entry.id === mode);

	useEffect(() => {
		if (users && value)
			setFiltered(
				users.filter(
					(item: IUser) =>
						item.fullname.toLowerCase().includes(value.toLowerCase()) &&
						item.status === "ONLINE" &&
						item.id !== user?.id
				)
			);
		else
			setFiltered(
				users?.filter((item: IUser) => item.status === "ONLINE" && item.id !== user?.id)
			);
	}, [value, users, user?.id]);

	useEffect(() => {
		const onInviteCanceled = () => {
			setShow(false);
			setShowPicker(false);
		};
		const onInviteCheck = (data: boolean) => {
			if (data) {
				setShow(true);
				setShowPicker(true);
			}
		};
		const onGameOver = () => {
			setShow(false);
			setShowPicker(false);
		};

		notificationSocket?.on("invitation-canceled", onInviteCanceled);
		socket?.emit("check-for-invitaion-sent");
		socket?.on("check-for-invitaion-sent", onInviteCheck);
		socket?.on("game-over", onGameOver);

		return () => {
			notificationSocket?.off("invitation-canceled", onInviteCanceled);
			socket?.off("check-for-invitaion-sent", onInviteCheck);
			socket?.off("game-over", onGameOver);
		};
	}, [socket, notificationSocket]);

	return (
		<Card
			className={twMerge(
				"relative flex w-full !max-w-3xl flex-col items-center gap-5 overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-secondary-700 to-secondary-800 p-5 text-secondary-200 shadow-2xl shadow-black/30 md:p-7",
				className
			)}
		>
			<div className="pointer-events-none absolute -left-14 -top-14 h-36 w-36 rounded-full bg-primary-400/[0.06] blur-3xl" />
			<div className="pointer-events-none absolute -bottom-16 -right-14 h-40 w-40 rounded-full bg-secondary-300/[0.06] blur-3xl" />
			<div className="w-full space-y-2">
				<div className="ui-badge">
					{modeMeta?.icon}
					Mode
				</div>
				<p className="ui-label">Pong Mode</p>
				<h1 className="text-xl font-semibold text-secondary-50 tracking-tight md:text-3xl">{title}</h1>
				<p className="max-w-2xl text-sm text-secondary-300 md:text-base">{modeMeta?.description}</p>
			</div>
			{invite && showPicker && (
				<div className="flex w-full flex-col items-center justify-center gap-3">
					<Input
						className="w-full"
						placeholder="Search Users ...."
						value={value}
						onChange={(e) => setValue(e.target.value)}
					/>
					{isLoading ? (
						<Spinner />
					) : filtered?.length ? (
						<div className="flex h-full max-h-[360px] w-full flex-col overflow-auto rounded-2xl border border-white/[0.06] bg-secondary-900/35 p-2.5 scrollbar-hide md:max-h-[500px]">
							{filtered.map((item: IUser) => (
								<Button
									variant="text"
									className="w-full !bg-transparent !p-0 !hover:bg-transparent"
									onClick={() => setSelectedUser(item)}
									key={item.id}
								>
									<UserBanner user={item} showRating rank={item.rating} />
								</Button>
							))}
						</div>
					) : (
						<div className="flex items-center justify-center text-sm text-secondary-300 md:text-lg">
							No matches found
						</div>
					)}
					<span className="w-full text-sm text-secondary-300">Selected User:</span>
					{selectedUser && (
						<UserBanner
							key={selectedUser.id}
							user={selectedUser}
							showRating
							rank={selectedUser.rating}
						/>
					)}
					<div className="flex w-full items-center justify-center gap-4">
						<Button type="secondary" onClick={() => setShowPicker(false)}>
							Cancel
						</Button>
						<Button
							disabled={!!!selectedUser}
							onClick={() => {
								socket?.emit("invite-friend", {
									inviterId: user?.id,
									invitedFriendId: selectedUser?.id,
									gameMode: gameMode,
									powerUps: gameOption,
								});
								onClick();
								toast.success("Invitation sent successfully");
								setShowPicker(false);
								setShow(true);
							}}
						>
							Invite
						</Button>
					</div>
				</div>
			)}
			{!showPicker && (
				<>
					{showOptions ? (
						<>
							<OptionGroup
								label="Game Mode"
								value={gameMode || GAME_MODES[0]}
								options={GAME_MODES}
								onSelect={(next) => setGameMode && setGameMode(next)}
							/>
							<OptionGroup
								label="Power Options"
								value={gameOption || POWER_OPTIONS[0]}
								options={POWER_OPTIONS}
								onSelect={(next) => setGameOption && setGameOption(next)}
							/>
						</>
					) : (
						<div className="rounded-2xl border border-white/[0.06] bg-secondary-900/30 p-4">
							<Image src="/img/game.png" alt="" width={180} height={180} />
						</div>
					)}
					<Button
						className="px-10 md:px-16"
						onClick={() => {
							!invite && onClick();
							!invite && setShow(true);
							invite && setShowPicker(true);
						}}
						disabled={disabled}
					>
						{content}
					</Button>
				</>
			)}
			{showLoading && show && (
				<>
					<div className="absolute inset-0 bg-secondary-900/80 backdrop-blur-md"></div>
					<div
						role="status"
						className="absolute left-1/2 top-2/4 grid -translate-x-1/2
             -translate-y-1/2 place-items-center gap-4"
					>
						<Spinner />
						<p className="text-secondary-50 font-medium">Waiting for opponent</p>
						<Button
							type="secondary"
							onClick={() => {
								onCancel();
								setShow(false);
							}}
						>
							Cancel
						</Button>
					</div>
				</>
			)}
		</Card>
	);
};

export default function GameCards() {
	const [disabled, setDisabled] = useState<{
		invite: boolean;
		join: boolean;
	}>({
		invite: false,
		join: false,
	});
	const [activeMode, setActiveMode] = useState<CardMode>("invite");
	const [gameMode, setGameMode] = useState<string>(GAME_MODES[0]);
	const [gameOption, setGameOption] = useState<string>(POWER_OPTIONS[0]);
	const { socket } = useContext(GameContext);
	const notificationSocket = useContext(SocketContext);
	const { user } = useContext(AppContext);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		const onInviteCanceled = () => setDisabled({ invite: false, join: false });
		const onInviteCheck = (data: boolean) => {
			if (data) setDisabled({ invite: true, join: false });
		};
		const onGameOver = () => setDisabled({ invite: false, join: false });

		notificationSocket?.on("invitation-canceled", onInviteCanceled);
		socket?.emit("check-for-invitaion-sent");
		socket?.on("check-for-invitaion-sent", onInviteCheck);
		socket?.on("game-over", onGameOver);

		return () => {
			notificationSocket?.off("invitation-canceled", onInviteCanceled);
			socket?.off("check-for-invitaion-sent", onInviteCheck);
			socket?.off("game-over", onGameOver);
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		};
	}, [socket, notificationSocket]);

	const currentCard = useMemo(() => {
		if (activeMode === "invite") {
			return (
				<CreateGameCard
					invite
					mode="invite"
					title="Invite Your Friends to Play"
					content="Select Friend"
					name="Invite"
					onClick={() => {
						setDisabled({ invite: false, join: true });
						timeoutRef.current = setTimeout(() => {
							setDisabled({ invite: false, join: false });
						}, 30000);
					}}
					showOptions
					showLoading
					gameMode={gameMode}
					setGameMode={setGameMode}
					gameOption={gameOption}
					setGameOption={setGameOption}
					disabled={disabled.invite}
					onCancel={() => {
						socket?.emit("cancel-invite", { inviterId: user?.id });
						setDisabled({ invite: false, join: false });
						if (timeoutRef.current) clearTimeout(timeoutRef.current);
					}}
				/>
			);
		}
		if (activeMode === "ai") {
			return (
				<CreateGameCard
					mode="ai"
					title="Train Against Ai"
					content="Play Now"
					onCancel={() => {}}
					onClick={() => {
						socket?.emit("play-with-ai", { userId: user?.id });
					}}
				/>
			);
		}
		return (
			<CreateGameCard
				mode="queue"
				title="Play Against Random Users"
				content="Join The Queue"
				name="Join"
				gameMode={gameMode}
				setGameMode={setGameMode}
				gameOption={gameOption}
				setGameOption={setGameOption}
				onCancel={() => {
					socket?.emit("leave-queue", { userId: user?.id });
					setDisabled({ invite: false, join: false });
				}}
				onClick={() => {
					socket?.emit("join-queue", {
						userId: user?.id,
						gameMode,
						powerUps: gameOption,
					});
					setDisabled({ invite: true, join: false });
				}}
				showLoading
				showOptions
				disabled={disabled.join}
			/>
		);
	}, [activeMode, gameMode, gameOption, disabled, socket, user?.id]);

	return (
		<div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-5">
			<div className="flex w-full max-w-3xl flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/[0.06] bg-secondary-800/70 p-2.5 backdrop-blur-sm">
				{modeCards.map((mode) => {
					const selected = activeMode === mode.id;
					return (
						<button
							key={mode.id}
							type="button"
							onClick={() => setActiveMode(mode.id)}
							className={twMerge(
								"inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm transition-all duration-200 ease-out",
								selected
									? "border-primary-400/50 bg-primary-400 text-secondary-900 font-semibold"
									: "border-white/[0.06] bg-secondary-800 text-secondary-200 hover:bg-secondary-700"
							)}
						>
							{mode.icon}
							{mode.title}
						</button>
					);
				})}
			</div>

			<div className="flex w-full justify-center transition-all duration-300 ease-out">{currentCard}</div>
		</div>
	);
}
