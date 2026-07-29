"use client";

import React, { useMemo, useRef } from "react";

import { useContext, useEffect, useState, useCallback } from "react";

import Channel from "./channel";
import { IAppContext, fetcher } from "../../context/app.context";
import {
	ChatContext,
	Ichannel,
	IchannelMember,
	IchatContext,
	Imessage,
} from "../../context/chat.context";
import Modal from "../modal";
import Input from "../input";
import Button from "../button";
import { AppContext } from "../../context/app.context";
import axios from "axios";
import { toast } from "react-toastify";
import { twMerge } from "tailwind-merge";
import { ListFilter, MessageSquarePlus } from "lucide-react";

interface ChannelListProps {
	className?: string;
	setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
	setCurrentChannel: React.Dispatch<React.SetStateAction<Ichannel | undefined>>;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	setMessages: React.Dispatch<React.SetStateAction<Imessage[]>>;
	inputRef?: React.RefObject<HTMLInputElement>;
	checkBlock: (id: number) => boolean;
}

const ChannelList: React.FC<ChannelListProps> = ({
	className,
	setShowModal,
	setCurrentChannel,
	setOpen,
	setMessages,
	inputRef,
	checkBlock,
}: ChannelListProps) => {
	const [channels, setChannels] = useState<Ichannel[]>([]);
	const [allChannels, setAllChannels] = useState<Ichannel[]>([]);
	const [archiveChannels, setArchiveChannels] = useState<Ichannel[]>([]);
	const [allArchiveChannels, setAllArchiveChannels] = useState<Ichannel[]>([]);
	const [showArchive, setShowArchive] = useState<boolean>(false);
	const [password, setPassword] = useState<string>("");
	const [selectedChannel, setSelectedChannel] = useState<Ichannel | undefined>({} as Ichannel);
	const [modal, setModal] = useState<boolean>(false);
	const [search, setSearch] = useState<string>("");
	const [tempChannel, setTempChannel] = useState<Ichannel>();
	const { socket } = useContext<IchatContext>(ChatContext);
	const { user } = useContext<IAppContext>(AppContext);
	const [isFocused, setIsFocused] = useState<boolean>(false);
	const iRef = React.useRef<HTMLInputElement>(null);
	const { checkConnection } = useContext<IAppContext>(AppContext);
	const value = useRef<number>(0);

	const loadMessages = async (channelId: number | undefined) => {
		if (!user) return;
		const messages = await fetcher(`api/messages/${channelId}/${user?.id}?take=120`);
		return messages;
	};

	const onClick = async (channel: Ichannel): Promise<void | undefined> => {
		checkConnection();
		if (!user || !channel) return;
		value.current = channel.id || 0;
		const member = await fetcher(`api/channels/member/${user?.id}/${channel?.id}`);
		if (channel.isacessPassword && member.role !== "OWNER") {
			if (selectedChannel && selectedChannel.id === channel?.id) {
				setOpen(true);
				setCurrentChannel(channel);
				setSelectedChannel(channel);
				socket?.emit("reset_mssg_count", { channelId: channel?.id });
				setMessages(null as any as Imessage[]);
				const messages = await loadMessages(channel.id);
				if (messages && channel.id === value.current) setMessages(messages);
				inputRef?.current?.focus();
			} else {
				setModal(true);
				setTempChannel(channel);
			}
		} else {
			setOpen(true);
			setCurrentChannel(channel);
			setSelectedChannel(channel);
			socket?.emit("reset_mssg_count", { channelId: channel?.id });
			setMessages(null as any as Imessage[]);
			const messages = await loadMessages(channel.id);
			if (messages && channel.id === value.current) setMessages(messages);
			inputRef?.current?.focus();
		}
	};

	const accessChannel = async () => {
		const res = await axios.post(
			`${process.env.BACK_END_URL}api/channels/checkpass`,
			{ password, channelId: tempChannel?.id },
			{ withCredentials: true }
		);
		if (res.data === true) {
			setOpen(true);
			setCurrentChannel(tempChannel);
			setSelectedChannel(tempChannel);
			setModal(false);
			socket?.emit("reset_mssg_count", { channelId: tempChannel?.id });
			setMessages(null as any as Imessage[]);
			const messages = await loadMessages(tempChannel?.id);
			setMessages(messages);
			inputRef?.current?.focus();
		} else {
			toast.error("Wrong access password !");
		}
	};

	const hydrateConversationFields = useCallback(
		(inputChannels: Ichannel[] = []) => {
			return inputChannels.map((channel: Ichannel) => {
				if (channel.type !== "CONVERSATION") return channel;
				const peer = channel.channelMembers?.find(
					(member: IchannelMember) => member.userId !== user?.id
				);
				return {
					...channel,
					name: peer?.user?.username || channel.name,
					avatar: peer?.user?.avatar || channel.avatar,
				};
			});
		},
		[user?.id]
	);

	useEffect(() => {
		if (!user) return;
		fetcher(`api/channels/${user?.id}`).then((nextChannels: Ichannel[]) => {
			const hydrated = hydrateConversationFields(nextChannels);
			setAllChannels(hydrated);
			setChannels(hydrated);
		});

		fetcher(`api/channels/archived/${user?.id}`).then((nextChannels: Ichannel[]) => {
			const hydrated = hydrateConversationFields(nextChannels);
			setAllArchiveChannels(hydrated);
			setArchiveChannels(hydrated);
		});
	}, [user?.id, hydrateConversationFields]);

	useEffect(() => {
		if (!socket) return;

		const onGetChannels = (nextChannels: Ichannel[]) => {
			if (!nextChannels) return;
			const hydrated = hydrateConversationFields(nextChannels);
			setAllChannels(hydrated);
			setChannels(hydrated);
		};

		const onGetArchiveChannels = (nextChannels: Ichannel[]) => {
			if (!nextChannels) return;
			const hydrated = hydrateConversationFields(nextChannels);
			setAllArchiveChannels(hydrated);
			setArchiveChannels(hydrated);
		};

		const onChannelLeave = () => {
			setCurrentChannel({} as Ichannel);
			inputRef?.current?.blur();
			setOpen(false);
		};

		const onChannelAccess = (data: { channel: Ichannel; messages: Imessage[] }) => {
			setOpen(true);
			setCurrentChannel(data?.channel);
			setSelectedChannel(data?.channel);
			setMessages(data?.messages);
		};

		const onChannelDelete = () => {
			setCurrentChannel({} as Ichannel);
			inputRef?.current?.blur();
			setOpen(false);
		};

		const onChannelCreate = (channel: Ichannel) => {
			setCurrentChannel(channel);
			setSelectedChannel(channel);
			inputRef?.current?.focus();
		};

		const onMessage = (message: Imessage) => {
			const updateChannels = (prev: Ichannel[]) => {
				const idx = prev.findIndex((c) => c.id === message.receiverId);
				if (idx !== -1) {
					const channel = prev[idx];
					let newCount = 0;
					const members = channel.channelMembers?.map(m => {
						if (m.userId === user?.id) {
							newCount = selectedChannel?.id === message.receiverId ? 0 : (m.newMessagesCount || 0) + 1;
							return { ...m, newMessagesCount: newCount };
						}
						return m;
					});
					const updated = { 
						...channel, 
						updatedAt: message.date, 
						messages: [message],
						channelMembers: members
					};
					return [updated, ...prev.slice(0, idx), ...prev.slice(idx + 1)].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
				}
				return prev;
			};
			setAllChannels(updateChannels);
			setChannels(updateChannels);
			setAllArchiveChannels(updateChannels);
			setArchiveChannels(updateChannels);
		};

		socket.on("getChannels", onGetChannels);
		socket.on("getArchiveChannels", onGetArchiveChannels);
		socket.on("channel_leave", onChannelLeave);
		socket.on("channel_access", onChannelAccess);
		socket.on("channel_delete", onChannelDelete);
		socket.on("channel_create", onChannelCreate);
		socket.on("dm_create", onChannelCreate);
		socket.on("message", onMessage);

		return () => {
			socket.off("getChannels", onGetChannels);
			socket.off("getArchiveChannels", onGetArchiveChannels);
			socket.off("channel_leave", onChannelLeave);
			socket.off("channel_access", onChannelAccess);
			socket.off("channel_delete", onChannelDelete);
			socket.off("channel_create", onChannelCreate);
			socket.off("dm_create", onChannelCreate);
			socket.off("message", onMessage);
		};
	}, [socket, hydrateConversationFields, inputRef, setCurrentChannel, setMessages, setOpen]);

	const normalizedSearch = useMemo(() => search.trim().toLowerCase(), [search]);

	useEffect(() => {
		if (!normalizedSearch) {
			setChannels(allChannels);
			setArchiveChannels(allArchiveChannels);
			return;
		}

		setChannels(
			allChannels.filter((item: Ichannel) =>
				item.name.toLowerCase().includes(normalizedSearch)
			)
		);
		setArchiveChannels(
			allArchiveChannels.filter((item: Ichannel) =>
				item.name.toLowerCase().includes(normalizedSearch)
			)
		);
	}, [normalizedSearch, allChannels, allArchiveChannels]);

	const onChange = (e: any) => {
		e.preventDefault();
		const { value } = e.target;
		setSearch(value);
	};

	return (
		<>
			<div
				className={twMerge(
					"lg:col-span-3 relative col-span-10 flex flex-col justify-start gap-4 py-2 w-full h-screen overflow-y-scroll scrollbar-hide",
					className && className
				)}
			>
				<div className=" sticky top-0 z-30 flex items-center gap-2 w-full pr-2 bg-secondary-50 py-2">
					<form className="pl-4 pr-1 w-full">
						<div className="relative">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="absolute top-0 bottom-0 w-6 h-6 my-auto text-secondary-400 text-xs left-3"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
							<input
								type="text"
								placeholder="Search chats..."
								className="w-full py-2 pl-12 pr-4 text-secondary-400 border border-tertiary-700 rounded-md outline-none bg-secondary-300 focus:text-primary-400 focus:border-primary-200 placeholder-secondary-400 placeholder-text-sm"
								value={search}
								onChange={onChange}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										inputRef?.current?.blur();
									}
								}}
							/>
						</div>
					</form>
					<MessageSquarePlus
						size={35}
						style={{ color: "#727587", fontSize: "30px", cursor: "pointer" }}
						onClick={() => {
							setShowModal(true);
						}}
					/>
					<ListFilter
						size={35}
						style={{
							color: isFocused ? "#E5AC7C" : "#727587",
							fontSize: "60px",
							cursor: "pointer",
						}}
						onClick={() => {
							setIsFocused(!isFocused);
							setShowArchive(!showArchive);
						}}
					/>
				</div>
				{showArchive && (
					<div className="flex items-center flex-col gap-2 text-primary-500 font-bold text-md">
						FILTERED BY ARCHIVED
					</div>
				)}

				{!showArchive
					? channels
							?.filter(
								(channel: Ichannel) =>
									channel.pinnedFor
										?.map((user: any) => user.id)
										.includes(user?.id)
							)
							?.map((channel: Ichannel) => {
								const isActive = channel.id === selectedChannel?.id;
								return (
									<Channel
										key={channel.id}
										id={channel.id}
										name={
											channel.type !== "CONVERSATION"
												? channel.name
												: channel.channelMembers?.filter(
														(member: any) => member.userId !== user?.id
												  )[0].user?.username
										}
										pinned={channel.pinnedFor
											?.map((user: any) => user.id)
											.includes(user?.id)}
										muted={channel.mutedFor
											?.map((user: any) => user.id)
											.includes(user?.id)}
										archived={channel.archivedFor
											?.map((user: any) => user.id)
											.includes(user?.id)}
										unread={channel.unreadFor
											?.map((user: any) => user.id)
											.includes(user?.id)}
										avatar={
											channel.type !== "CONVERSATION"
												? channel.avatar
												: channel.channelMembers?.filter(
														(member: IchannelMember) =>
															member.userId !== user?.id
												  )[0].user?.avatar
										}
										description={
											channel.messages &&
											!channel.bannedUsers
												?.map((user: any) => user.id)
												.includes(user?.id) &&
											!channel.kickedUsers
												?.map((user: any) => user.id)
												.includes(user?.id)
												? channel.messages[0]?.content
												: ""
										}
										updatedAt={
											channel.messages &&
											!channel.bannedUsers
												?.map((user: any) => user.id)
												.includes(user?.id) &&
											!channel.kickedUsers
												?.map((user: any) => user.id)
												.includes(user?.id)
												? channel.messages[0]?.date ||
												  channel.updatedAt ||
												  ""
												: channel.createAt || ""
										}
										newMessages={
											channel.channelMembers?.filter(
												(member: IchannelMember) =>
													member.userId === user?.id
											)[0].newMessagesCount
										}
										userStatus={
											channel.type !== "CONVERSATION"
												? false
												: channel.channelMembers?.filter(
														(member: IchannelMember) =>
															member.userId !== user?.id
												  )[0].user?.status === "ONLINE" &&
												  !checkBlock(
														channel.channelMembers?.filter(
															(member: IchannelMember) =>
																member.userId !== user?.id
														)[0].user?.id
												  )
										}
										onClick={async (e: any) => {
											e.preventDefault();
											await onClick(channel);
										}}
										selected={isActive}
									/>
								);
							})
							.concat(
								channels
									?.filter(
										(channel: Ichannel) =>
											!channel.pinnedFor
												?.map((user: any) => user.id)
												.includes(user?.id)
									)
									.map((channel: Ichannel) => {
										const isActive = channel.id === selectedChannel?.id;
										return (
											<Channel
												key={channel.id}
												id={channel.id}
												name={
													channel.type !== "CONVERSATION"
														? channel.name
														: channel.channelMembers?.filter(
																(member: IchannelMember) =>
																	member.userId !== user?.id
														  )[0].user?.username
												}
												pinned={channel.pinnedFor
													?.map((user: any) => user.id)
													.includes(user?.id)}
												muted={channel.mutedFor
													?.map((user: any) => user.id)
													.includes(user?.id)}
												archived={channel.archivedFor
													?.map((user: any) => user.id)
													.includes(user?.id)}
												unread={channel.unreadFor
													?.map((user: any) => user.id)
													.includes(user?.id)}
												avatar={
													channel.type !== "CONVERSATION"
														? channel.avatar
														: channel.channelMembers?.filter(
																(member: IchannelMember) =>
																	member.userId !== user?.id
														  )[0].user?.avatar
												}
												description={
													channel.messages &&
													!channel.bannedUsers
														?.map((user: any) => user.id)
														.includes(user?.id) &&
													!channel.kickedUsers
														?.map((user: any) => user.id)
														.includes(user?.id)
														? channel.messages[0]?.content
														: ""
												}
												updatedAt={
													channel.messages &&
													!channel.bannedUsers
														?.map((user: any) => user.id)
														.includes(user?.id) &&
													!channel.kickedUsers
														?.map((user: any) => user.id)
														.includes(user?.id)
														? channel.messages[0]?.date ||
														  channel.updatedAt ||
														  ""
														: channel.createAt || ""
												}
												newMessages={
													channel.channelMembers?.filter(
														(member: IchannelMember) =>
															member.userId === user?.id
													)[0].newMessagesCount
												}
												userStatus={
													channel.type !== "CONVERSATION"
														? false
														: channel.channelMembers?.filter(
																(member: IchannelMember) =>
																	member.userId !== user?.id
														  )[0].user?.status === "ONLINE" &&
														  !checkBlock(
																channel.channelMembers?.filter(
																	(member: IchannelMember) =>
																		member.userId !== user?.id
																)[0].user?.id
														  )
												}
												onClick={async (e: any) => {
													e.preventDefault();
													await onClick(channel);
												}}
												selected={isActive}
											/>
										);
									})
							)
					: archiveChannels
							?.filter(
								(channel: Ichannel) =>
									channel.pinnedFor
										?.map((user: any) => user.id)
										.includes(user?.id)
							)
							?.map((channel: Ichannel) => {
								//list the pinned channels first
								const isActive = channel.id === selectedChannel?.id;
								return (
									<Channel
										key={channel.id}
										id={channel.id}
										name={
											channel.type !== "CONVERSATION"
												? channel.name
												: channel.channelMembers?.filter(
														(member: IchannelMember) =>
															member.userId !== user?.id
												  )[0].user?.username
										}
										pinned={channel.pinnedFor
											?.map((user: any) => user.id)
											.includes(user?.id)}
										muted={channel.mutedFor
											?.map((user: any) => user.id)
											.includes(user?.id)}
										archived={channel.archivedFor
											?.map((user: any) => user.id)
											.includes(user?.id)}
										unread={channel.unreadFor
											?.map((user: any) => user.id)
											.includes(user?.id)}
										avatar={
											channel.type !== "CONVERSATION"
												? channel.avatar
												: channel.channelMembers?.filter(
														(member: IchannelMember) =>
															member.userId !== user?.id
												  )[0].user?.avatar
										}
										description={
											channel.messages &&
											!channel.bannedUsers
												?.map((user: any) => user.id)
												.includes(user?.id) &&
											!channel.kickedUsers
												?.map((user: any) => user.id)
												.includes(user?.id)
												? channel.messages[0]?.content
												: ""
										}
										updatedAt={
											channel.messages &&
											!channel.bannedUsers
												?.map((user: any) => user.id)
												.includes(user?.id) &&
											!channel.kickedUsers
												?.map((user: any) => user.id)
												.includes(user?.id)
												? channel.messages[0]?.date ||
												  channel.updatedAt ||
												  ""
												: channel.createAt || ""
										}
										newMessages={
											channel.channelMembers?.filter(
												(member: IchannelMember) =>
													member.userId === user?.id
											)[0].newMessagesCount
										}
										userStatus={
											channel.type !== "CONVERSATION"
												? false
												: channel.channelMembers?.filter(
														(member: IchannelMember) =>
															member.userId !== user?.id
												  )[0].user?.status === "ONLINE" &&
												  !checkBlock(
														channel.channelMembers?.filter(
															(member: IchannelMember) =>
																member.userId !== user?.id
														)[0].user?.id
												  )
										}
										onClick={async (e: any) => {
											e.preventDefault();
											await onClick(channel);
										}}
										selected={isActive}
									/>
								);
							})
							.concat(
								archiveChannels
									?.filter(
										(channel: Ichannel) =>
											!channel.pinnedFor
												?.map((user: any) => user.id)
												.includes(user?.id)
									)
									.map((channel: Ichannel) => {
										const isActive = channel.id === selectedChannel?.id;
										return (
											<Channel
												key={channel.id}
												id={channel.id}
												name={
													channel.type !== "CONVERSATION"
														? channel.name
														: channel.channelMembers?.filter(
																(member: IchannelMember) =>
																	member.userId !== user?.id
														  )[0].user?.username
												}
												pinned={channel.pinnedFor
													?.map((user: any) => user.id)
													.includes(user?.id)}
												muted={channel.mutedFor
													?.map((user: any) => user.id)
													.includes(user?.id)}
												archived={channel.archivedFor
													?.map((user: any) => user.id)
													.includes(user?.id)}
												unread={channel.unreadFor
													?.map((user: any) => user.id)
													.includes(user?.id)}
												avatar={
													channel.type !== "CONVERSATION"
														? channel.avatar
														: channel.channelMembers?.filter(
																(member: IchannelMember) =>
																	member.userId !== user?.id
														  )[0].user?.avatar
												}
												description={
													channel.messages &&
													!channel.bannedUsers
														?.map((user: any) => user.id)
														.includes(user?.id) &&
													!channel.kickedUsers
														?.map((user: any) => user.id)
														.includes(user?.id)
														? channel.messages[0]?.content
														: ""
												}
												updatedAt={
													channel.messages &&
													!channel.bannedUsers
														?.map((user: any) => user.id)
														.includes(user?.id) &&
													!channel.kickedUsers
														?.map((user: any) => user.id)
														.includes(user?.id)
														? channel.messages[0]?.date ||
														  channel.updatedAt ||
														  ""
														: channel.createAt || ""
												}
												newMessages={
													channel.channelMembers?.filter(
														(member: IchannelMember) =>
															member.userId === user?.id
													)[0].newMessagesCount
												}
												userStatus={
													channel.type !== "CONVERSATION"
														? false
														: channel.channelMembers?.filter(
																(member: IchannelMember) =>
																	member.userId !== user?.id
														  )[0].user?.status === "ONLINE" &&
														  !checkBlock(
																channel.channelMembers?.filter(
																	(member: IchannelMember) =>
																		member.userId !== user?.id
																)[0].user?.id
														  )
												}
												onClick={async (e: any) => {
													e.preventDefault();
													await onClick(channel);
												}}
												selected={isActive}
											/>
										);
									})
							)}
			</div>
			{modal && (
				<Modal
					setShowModal={setModal}
					className="z-10 bg-secondary-800 
                      border-none flex flex-col items-center justify-center shadow-lg shadow-secondary-500 gap-4 text-white min-w-[90%]
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
							value={password}
							inputRef={iRef}
							onChange={(e) => setPassword(e.target.value)}
							onKeyDown={async (e) => {
								if (e.key === "Enter") {
									await accessChannel();
									setModal(false);
									iRef?.current?.blur();
									setPassword("");
								}
							}}
						/>
						<div className="flex flex-row pt-4">
							<Button
								className="h-10 w-20 md:w-30 !bg-inherit text-white text-xs rounded-full mt-2 mr-2"
								onClick={() => {
									setModal(false);
									iRef?.current?.blur();
								}}
							>
								<span className="text-xs">Cancel</span>
							</Button>
							<Button
								className="h-10 w-20 md:w-30 bg-primary-500 text-white text-xs rounded-full mt-2"
								onClick={async () => {
									await accessChannel();
									setModal(false);
									setPassword("");
									iRef?.current?.blur();
								}}
							>
								<span className="text-xs">Access</span>
							</Button>
						</div>
					</div>
				</Modal>
			)}
		</>
	);
};

export default ChannelList;
