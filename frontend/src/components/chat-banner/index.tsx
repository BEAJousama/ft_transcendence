"use client";

import React, { useRef } from "react";

import { useContext, useState } from "react";
import { AppContext, fetcher } from "../../context/app.context";
import { ChatContext, Ichannel } from "../../context/chat.context";
import { useRouter } from "next/navigation";
import Avatar from "../avatar";
import AvatarGroup from "../avatarGroup";
import Button from "../button";
import Input from "../input";
import Modal from "../modal";
import axios from "axios";
import { toast } from "react-toastify";
import { Key, Users2 } from "lucide-react";

const ChatBanner = ({ channel }: { channel?: Ichannel }) => {
	const router = useRouter();

	const { user } = useContext(AppContext);
	const { socket } = useContext(ChatContext);
	const [password, setPassword] = useState("");
	const [accessPassword, setAccessPassword] = useState("");
	const [showModal, setshowModal] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const [accesModal, setAccessModal] = useState(false);

	const channelMembers = channel?.channelMembers?.filter((member: any) => {
		return member.status === "ACTIVE" || member.status === "MUTED";
	});

	const handleJoin = () => {
		if (channel?.visiblity === "PROTECTED") {
			setshowModal(true);
			inputRef?.current?.focus();
		} else {
			socket?.emit("channel_join", { channelId: channel?.id, userId: user?.id });
			router.push(`/chat?channelId=${channel?.id}`);
		}
	};

	const handleAccess = async () => {
		try {
			const member = await fetcher(`api/channels/member/${user?.id}/${channel?.id}`);
			if (!member) return;

			if (
				(channel?.isacessPassword && member.role === "OWNER") ||
				!channel?.isacessPassword
			) {
				socket?.emit("channel_access", { userId: user?.id, channelId: channel?.id });
				router.push(`/chat?channelId=${channel?.id}`);
				return;
			} else {
				setAccessModal(true);
				return;
			}
		} catch (err) {
			toast.error("Something went wrong !");
		}
	};

	const accessChannel = async () => {
		try {
			const res = await axios.post(
				`${process.env.BACK_END_URL}api/channels/checkpass`,
				{ password: accessPassword, channelId: channel?.id },
				{ withCredentials: true }
			);
			if (res.data === true) {
				socket?.emit("channel_access", { userId: user?.id, channelId: channel?.id });
				router.push(`/chat?channelId=${channel?.id}`);
			} else {
				toast.error("Wrong access password !");
			}
		} catch (error) {}
	};

	return (
		<>
			<div className="group relative flex h-fit w-full flex-col gap-2.5 overflow-hidden rounded-xl border border-secondary-500/90 bg-gradient-to-br from-secondary-700 to-secondary-800 p-3 shadow-md shadow-black/20 transition-all duration-300 hover:border-primary-300/40 hover:shadow-black/30">
				<div className="pointer-events-none absolute -right-10 -top-10 h-20 w-20 rounded-full bg-primary-300/10 blur-xl" />
				<div className="flex items-start justify-between gap-2">
					<div className="min-w-0 space-y-0.5">
						<h3 className="truncate text-sm font-semibold text-secondary-50 md:text-base">
							{channel?.name}
						</h3>
						<div className="flex flex-wrap items-center gap-1.5 text-[11px] text-secondary-300">
							<span className="inline-flex items-center gap-1 rounded-full border border-secondary-500 bg-secondary-900/40 px-2 py-0.5">
								<Users2 className="h-3.5 w-3.5" />
								{channelMembers?.length} members
							</span>
							<span className="inline-flex items-center gap-1 rounded-full border border-secondary-500 bg-secondary-900/40 px-2 py-0.5">
								{channel?.visiblity === "PROTECTED" && <Key className="h-3 w-3 text-primary-300" />}
								{channel?.visiblity}
							</span>
						</div>
					</div>
					{channel &&
					(!channelMembers?.map((item: any) => item.userId).includes(user?.id) ||
						channel?.kickedUsers.map((u: any) => u.id).includes(user?.id)) ? (
						<Button onClick={handleJoin} className="shrink-0 px-3 py-1.5 text-[11px] md:text-xs">
							Join room
						</Button>
					) : (
						<Button onClick={handleAccess} className="shrink-0 px-3 py-1.5 text-[11px] md:text-xs">
							Open room
						</Button>
					)}
				</div>
				<div className="rounded-lg border border-secondary-500/80 bg-secondary-900/30 p-2">
					<p className="mb-1 text-[10px] uppercase tracking-[0.14em] text-secondary-400">
						Active members
					</p>
					<AvatarGroup max={4}>
						{channelMembers &&
							channelMembers?.map((item: any) => {
								return (
									<Avatar
										key={item.userId}
										src={item.user.avatar}
										alt={item.user.username}
									/>
								);
							})}
					</AvatarGroup>
				</div>
				<div className="flex items-center justify-between text-[10px] text-secondary-400">
					<span>Room id #{channel?.id}</span>
					<span className="text-primary-300/90">{channel?.isacessPassword ? "Access protected" : "Open access"}</span>
				</div>
			</div>
			{accesModal && (
				<Modal
					setShowModal={setAccessModal}
					className2="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50"
					className="z-10 bg-secondary-800 
                                    border-none flex flex-col !items-center !justify-center shadow-lg shadow-secondary-500 gap-4 text-white min-w-[90%]
                                    lg:min-w-[40%] xl:min-w-[800px] animate-jump-in animate-ease-out animate-duration-400"
				>
					<span className="text-md md:text-lg font-semibold pb-4">
						This channel requires an access password !{" "}
					</span>
					<div className="flex flex-col justify-center items-center w-full">
						<Input
							label="Password"
							className="w-full rounded-md border-2 border-primary-500 text-white text-xs bg-transparent md:mr-2"
							htmlType="password"
							placeholder="*****************"
							value={accessPassword}
							// inputRef={iRef}
							onChange={(e) => setAccessPassword(e.target.value)}
							onKeyDown={async (e) => {
								if (e.key === "Enter") {
									await accessChannel();
									setAccessPassword("");
									setAccessModal(false);
									// iRef?.current?.blur();
								}
							}}
						/>
						<div className="flex flex-row p-4">
							<Button
								className="h-10 w-20 md:w-30 !bg-inherit text-white text-xs rounded-full mt-2 mr-2"
								onClick={() => {
									setAccessPassword("");
									setAccessModal(false);
									// iRef?.current?.blur();
								}}
							>
								<span className="text-xs">Cancel</span>
							</Button>
							<Button
								className="h-10 w-20 md:w-30 bg-primary-500 text-white text-xs rounded-full mt-2"
								onClick={async () => {
									await accessChannel();
									setAccessPassword("");
									setAccessModal(false);
									// iRef?.current?.blur();
								}}
							>
								<span className="text-xs">Access</span>
							</Button>
						</div>
					</div>
				</Modal>
			)}
			{showModal && (
				<Modal
					setShowModal={setshowModal}
					className2="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50"
					className="z-10 bg-secondary-800 border-none flex flex-col !items-center !justify-center shadow-lg shadow-secondary-500 gap-4 text-white min-w-[90%] lg:min-w-[40%] xl:min-w-[50%] animate-jump-in animate-ease-out animate-duration-400 max-w-[100%]"
				>
					<span className="text-md md:text-lg font-semibold pb-4">
						This channel is protected
					</span>
					<div className="flex flex-col justify-center items-center w-full">
						<Input
							label="Password"
							className="w-full rounded-md border-2 border-primary-500 text-white text-xs bg-transparent md:mr-2"
							htmlType="password"
							placeholder="*****************"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							inputRef={inputRef}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									socket?.emit("channel_join", {
										channelId: channel?.id,
										userId: user?.id,
										password: password,
									});
									setshowModal(false);
									setPassword("");
									router.push(`/chat?channelId=${channel?.id}`);
								}
							}}
						/>
						<div className="flex flex-row">
							<Button
								className="h-10 w-20 md:w-30 !bg-inherit text-white text-xs rounded-full mt-2 mr-2"
								onClick={() => {
									setshowModal(false);
									inputRef?.current?.blur();
									setPassword("");
								}}
							>
								<span className="text-xs">Cancel</span>
							</Button>
							<Button
								className="h-10 w-20 md:w-30 bg-primary-500 text-white text-xs rounded-full mt-2"
								onClick={() => {
									socket?.emit("channel_join", {
										channelId: channel?.id,
										userId: user?.id,
										password: password,
									});
									setshowModal(false);
									setPassword("");
									router.push(`/chat?channelId=${channel?.id}`);
								}}
							>
								<span className="text-xs">Join</span>
							</Button>
						</div>
					</div>
				</Modal>
			)}
		</>
	);
};

export default ChatBanner;
