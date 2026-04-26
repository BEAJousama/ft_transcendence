"use client";

import useSwr from "swr";
import IUser, { IBlock } from "@/interfaces/user";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { addFriend, cancelFriend, acceptFriend, BlockUser, UnBlockUser, isBlocked } from "./tools";
import { Spinner, Avatar, Button } from "@/components";
import { ChatContext } from "@/context/chat.context";
import { useRouter } from "next/navigation";
import { AppContext } from "@/context/app.context";

const status = {
	ONLINE: { status: "online", color: "text-emerald-400" },
	OFFLINE: { status: "offline", color: "text-secondary-400" },
	INGAME: { status: "in game", color: "text-amber-400" },
};

const ProfileInfo = ({ user, currentUserId }: { user: IUser; currentUserId: number }) => {
	const router = useRouter();
	const { socket } = useContext(ChatContext);
	const { user: __user, updateUser } = useContext(AppContext);
	const {
		data: friendRequest,
		isLoading,
		mutate,
	} = useSwr(
		`api/users/${user?.id}/friend-request`,
		async (url) => {
			try {
				const response = await axios.get(`${process.env.BACK_END_URL}${url}`, {
					withCredentials: true,
					params: { senderId: currentUserId, receiverId: user?.id },
				});
				return response.data;
			} catch (error) {
				return null;
			}
		},
		{ refreshInterval: 1, errorRetryCount: 0, shouldRetryOnError: false }
	);
	let blocked = false;
	let __blocked = false;

	const [text, setText] = useState("");

	useEffect(() => {
		if (friendRequest?.status === "PENDING" && friendRequest?.senderId === currentUserId)
			setText("Cancel Request");
		else if (friendRequest?.status === "PENDING" && friendRequest?.senderId !== currentUserId)
			setText("Accept");
		else if (friendRequest?.status === "ACCEPTED") setText("Remove Friend");
		else setText("Add Friend");
	}, [friendRequest, isLoading, currentUserId]);

	if (isLoading) return <Spinner />;

	const userStatus = status[user.status as "ONLINE" | "OFFLINE" | "INGAME"];

	const _isBlocked = (id: number, blockers?: IBlock[]) => {
		if (blockers) {
			return blockers.some((block: IBlock) => block.blockingId === id);
		}
		return false;
	};

	blocked = _isBlocked(user.id, __user?.blockers);

	let block: IBlock | undefined = isBlocked(currentUserId, __user?.blockers);
	if (!block) block = isBlocked(user.id, __user?.blocking);
	if (block) __blocked = block.blockerId === user.id;

	return (
		<div className="flex w-full max-w-5xl flex-col items-center gap-5 rounded-2xl border border-white/[0.06] bg-secondary-700 p-5 md:flex-row md:p-6">
			<div className="flex w-full flex-col items-center gap-5 md:flex-row">
				<Avatar
					src={user?.avatar || "/img/default-avatar.png"}
					alt="avatar"
					className="h-28 w-28 shrink-0 ring-2 ring-white/[0.06] ring-offset-2 ring-offset-secondary-700 md:h-24 md:w-24"
				/>
				<div className="flex flex-1 flex-col gap-1 min-w-0">
					<span className="text-lg font-semibold text-secondary-50 tracking-tight">{user?.fullname}</span>
					<div className="flex items-center gap-3">
						<span className="text-sm text-secondary-300">@{user?.username}</span>
						<span className={`text-xs font-medium ${userStatus.color}`}>
							{userStatus.status}
						</span>
					</div>
					{user?.id !== currentUserId && (
						<div className="flex w-full gap-2.5 mt-2">
							<Button
								disabled={user?.id === currentUserId || blocked || __blocked}
								className="flex-1 !text-xs"
								onClick={async () => {
									if (text === "Add Friend") await addFriend(currentUserId || 0, user.id);
									else if (text === "Accept") await acceptFriend(friendRequest.id);
									else await cancelFriend(friendRequest.id);
									await mutate();
								}}
							>
								{text}
							</Button>
							<Button
								disabled={user?.id === currentUserId || blocked || __blocked}
								className="flex-1 !text-xs"
								onClick={() => {
									socket?.emit("dm_create", { senderId: currentUserId, receiverId: user?.id });
									router.push(`/chat`);
								}}
							>
								Message
							</Button>
							<Button
								disabled={user?.id === currentUserId || __blocked}
								type={blocked ? "success" : "danger"}
								className="!text-xs"
								onClick={async () => {
									blocked
										? UnBlockUser(currentUserId || 0, user.id)
										: BlockUser(currentUserId || 0, user.id);
									await mutate();
									await updateUser();
								}}
							>
								{blocked ? "UnBlock" : "Block"}
							</Button>
						</div>
					)}
				</div>
				<div className="grid w-full max-w-[220px] gap-1.5 rounded-xl border border-white/[0.06] bg-secondary-800/60 p-3.5">
					<div className="flex w-full justify-between">
						<span className="text-xs text-primary-400 font-medium">Score</span>
						<div className="flex items-center gap-1.5">
							<span className="text-sm font-medium text-secondary-50">{user?.rating}</span>
							<span className="text-xs text-secondary-400">/10000</span>
						</div>
					</div>
					<div className="flex w-full justify-between">
						<span className="text-xs text-primary-400 font-medium">Rank</span>
						<span className="text-sm text-secondary-50">
							{user.ladder
								.toLowerCase()
								.split("_")
								.map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
								.join(" ")}
						</span>
					</div>
					<div className="flex w-full justify-between">
						<span className="text-xs text-primary-400 font-medium">Games Won</span>
						<span className="text-sm text-secondary-50">
							{user.wins} of {user.totalGames}
						</span>
					</div>
					<div className="flex w-full justify-between">
						<span className="text-xs text-primary-400 font-medium">Win Streak</span>
						<span className="text-sm text-secondary-50">{user.winStreak}</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProfileInfo;
