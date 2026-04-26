"use client";

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppContext, fetcher } from "@/context/app.context";
import { ChatContext, Ichannel, IchannelMember, Imessage } from "@/context/chat.context";
import { GameContext } from "@/context/game.context";
import IUser from "@/interfaces/user";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import UpdateAvatar from "../update-avatar";
import {
	Search,
	SendHorizonal,
	MessageSquare,
	ChevronDown,
	UserCircle,
	UserX,
	Gamepad2,
	Plus,
	Pin,
	BellDot,
	VolumeX,
	Archive,
	Trash2,
	Users,
	Settings,
	LogOut,
	ShieldAlert,
	Crown,
	UserMinus,
	Ban,
} from "lucide-react";
import { twMerge } from "tailwind-merge";

type VirtualWindow = {
	start: number;
	end: number;
	offsetTop: number;
	offsetBottom: number;
};

const ITEM_HEIGHT = 72;
const MAX_RENDERED_ITEMS = 24;

const getConversationPeer = (channel: Ichannel, userId?: number) =>
	channel.channelMembers?.find((member: IchannelMember) => member.userId !== userId)?.user;

const getChannelName = (channel: Ichannel, userId?: number) =>
	channel.type === "CONVERSATION"
		? getConversationPeer(channel, userId)?.username || channel.name
		: channel.name;

const getChannelAvatar = (channel: Ichannel, userId?: number) =>
	channel.type === "CONVERSATION"
		? getConversationPeer(channel, userId)?.avatar || channel.avatar
		: channel.avatar;

const ChatV2 = () => {
	const { user } = useContext(AppContext);
	const { socket } = useContext(ChatContext);
	const { socket: gameSocket } = useContext(GameContext);
	const router = useRouter();

	const [channels, setChannels] = useState<Ichannel[]>([]);
	const [archivedChannels, setArchivedChannels] = useState<Ichannel[]>([]);
	const [inboxMode, setInboxMode] = useState<"active" | "archived">("active");
	const [activeChannel, setActiveChannel] = useState<Ichannel | null>(null);
	const [messagesByChannel, setMessagesByChannel] = useState<Record<number, Imessage[]>>({});
	const [channelSearch, setChannelSearch] = useState("");
	const [composerValue, setComposerValue] = useState("");
	const [showQuickSwitch, setShowQuickSwitch] = useState(false);
	const [blockedByMeUserIds, setBlockedByMeUserIds] = useState<number[]>([]);
	const [blockedMeUserIds, setBlockedMeUserIds] = useState<number[]>([]);
	const [chatUsers, setChatUsers] = useState<IUser[]>([]);
	const [showComposerModal, setShowComposerModal] = useState(false);
	const [showGroupSettings, setShowGroupSettings] = useState(false);
	const [composerMode, setComposerMode] = useState<"dm" | "group">("dm");
	const [newGroupName, setNewGroupName] = useState("");
	const [newGroupVisibility, setNewGroupVisibility] = useState("PUBLIC");
	const [newGroupPassword, setNewGroupPassword] = useState("");
	const [newGroupAccessPassword, setNewGroupAccessPassword] = useState("");
	const [selectedGroupMembers, setSelectedGroupMembers] = useState<number[]>([]);
	const [composerMemberSearch, setComposerMemberSearch] = useState("");
	const [settingsName, setSettingsName] = useState("");
	const [settingsAvatar, setSettingsAvatar] = useState("/img/group.jpg");
	const [settingsVisibility, setSettingsVisibility] = useState("PUBLIC");
	const [settingsPassword, setSettingsPassword] = useState("");
	const [settingsAccessPassword, setSettingsAccessPassword] = useState("");
	const [settingsNewMembers, setSettingsNewMembers] = useState<number[]>([]);
	const [settingsMemberSearch, setSettingsMemberSearch] = useState("");
	const [muteDurationByMember, setMuteDurationByMember] = useState<Record<number, number>>({});
	const [pendingMemberActions, setPendingMemberActions] = useState<Record<string, boolean>>({});
	const [isSavingGroupSettings, setIsSavingGroupSettings] = useState(false);
	const [contextMenu, setContextMenu] = useState<{
		channel: Ichannel;
		x: number;
		y: number;
	} | null>(null);
	const [loadingOlder, setLoadingOlder] = useState(false);
	const [oldestDateByChannel, setOldestDateByChannel] = useState<Record<number, string>>({});
	const [channelScrollTop, setChannelScrollTop] = useState(0);

	const channelListRef = useRef<HTMLDivElement>(null);
	const messagesRef = useRef<HTMLDivElement>(null);

	const loadBlockState = async (userId: number) => {
		try {
			const [blockedByMeRes, blockedMeRes] = await Promise.all([
				fetcher(`api/users/${userId}/blocked-users`),
				fetcher(`api/users/${userId}/blocking-users`),
			]);
			setBlockedByMeUserIds(
				(blockedByMeRes || []).map((entry: { blockingId: number }) => entry.blockingId)
			);
			setBlockedMeUserIds((blockedMeRes || []).map((entry: { blockerId: number }) => entry.blockerId));
		} catch {
			setBlockedByMeUserIds((user?.blocking || []).map((entry) => entry.blockingId));
			setBlockedMeUserIds((user?.blockers || []).map((entry) => entry.blockerId));
		}
	};

	useEffect(() => {
		if (!user?.id) return;
		loadBlockState(user.id);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user?.id]);

	useEffect(() => {
		if (!user?.id) return;
		fetcher(`api/channels/${user.id}`).then((data) => setChannels(data || []));
		fetcher(`api/channels/archived/${user.id}`).then((data) => setArchivedChannels(data || []));
		fetcher(`api/users/non-blocked-users/${user.id}`).then((data) =>
			setChatUsers((data || []).filter((candidate: IUser) => candidate.id !== user.id))
		);
	}, [user?.id]);

	useEffect(() => {
		const onShortcut = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setShowQuickSwitch((prev) => !prev);
			}
		};
		window.addEventListener("keydown", onShortcut);
		return () => window.removeEventListener("keydown", onShortcut);
	}, []);

	useEffect(() => {
		if (!socket) return;

		const onChannels = (nextChannels: Ichannel[]) => {
			setChannels(nextChannels || []);
		};
		const onArchivedChannels = (nextChannels: Ichannel[]) => {
			setArchivedChannels(nextChannels || []);
		};

		const onMessage = (message: Imessage) => {
			if (!message?.receiverId) return;
			setMessagesByChannel((prev) => {
				const current = prev[message.receiverId] || [];
				const normalize = (value?: string) => (value || "").trim().replace(/\s+/g, " ");
				const messageTime = new Date(message.date).getTime();
				const messageContent = normalize(message.content);
				const exists = current.some((m) => {
					if (m.id === message.id) return true;
					const sameSignature =
						m.senderId === message.senderId &&
						m.receiverId === message.receiverId &&
						normalize(m.content) === messageContent &&
						Math.abs(new Date(m.date).getTime() - messageTime) < 15000;
					return sameSignature;
				});
				if (exists) return prev;
				const withoutOptimisticEcho =
					message.senderId === user?.id
						? current.filter(
								(m) =>
									!(
										m.id < 0 &&
										m.senderId === message.senderId &&
										m.receiverId === message.receiverId &&
										m.content === message.content &&
										Math.abs(new Date(m.date).getTime() - messageTime) < 15000
									)
						  )
						: current;
				return {
					...prev,
					[message.receiverId]: [...withoutOptimisticEcho, message],
				};
			});
		};

		const onChannelMessages = (incoming: Imessage[]) => {
			if (!incoming?.length) return;
			const channelId = incoming[0].receiverId;
			setMessagesByChannel((prev) => ({
				...prev,
				[channelId]: incoming,
			}));
			setOldestDateByChannel((prev) => ({
				...prev,
				[channelId]: incoming[0]?.date || prev[channelId],
			}));
		};

		socket.on("getChannels", onChannels);
		socket.on("getArchiveChannels", onArchivedChannels);
		socket.on("message", onMessage);
		socket.on("getChannelMessages", onChannelMessages);
		socket.on("get_client_messages", onChannelMessages);

		return () => {
			socket.off("getChannels", onChannels);
			socket.off("getArchiveChannels", onArchivedChannels);
			socket.off("message", onMessage);
			socket.off("getChannelMessages", onChannelMessages);
			socket.off("get_client_messages", onChannelMessages);
		};
	}, [socket, user?.id]);

	const filteredChannels = useMemo(() => {
		const query = channelSearch.trim().toLowerCase();
		const source = inboxMode === "archived" ? archivedChannels : channels;
		const filtered = query
			? source.filter((channel) =>
			getChannelName(channel, user?.id).toLowerCase().includes(query)
			  )
			: source;
		const isPinnedByCurrentUser = (channel: Ichannel) =>
			!!user?.id &&
			(channel.pinnedFor || []).some((entry: { id: number }) => entry.id === user.id);
		return [...filtered].sort((a, b) => Number(isPinnedByCurrentUser(b)) - Number(isPinnedByCurrentUser(a)));
	}, [channels, archivedChannels, inboxMode, channelSearch, user?.id]);

	const channelWindow: VirtualWindow = useMemo(() => {
		const start = Math.max(0, Math.floor(channelScrollTop / ITEM_HEIGHT) - 4);
		const end = Math.min(filteredChannels.length, start + MAX_RENDERED_ITEMS);
		return {
			start,
			end,
			offsetTop: start * ITEM_HEIGHT,
			offsetBottom: Math.max(0, (filteredChannels.length - end) * ITEM_HEIGHT),
		};
	}, [channelScrollTop, filteredChannels.length]);

	const visibleChannels = filteredChannels.slice(channelWindow.start, channelWindow.end);
	const activeMessages = activeChannel?.id ? messagesByChannel[activeChannel.id] || [] : [];
	const composerSearchQuery = composerMemberSearch.trim().toLowerCase();
	const settingsSearchQuery = settingsMemberSearch.trim().toLowerCase();
	const filteredComposerUsers = useMemo(() => {
		if (!composerSearchQuery) return chatUsers;
		return chatUsers.filter(
			(candidate) =>
				candidate.username.toLowerCase().includes(composerSearchQuery) ||
				(candidate.status || "").toLowerCase().includes(composerSearchQuery)
		);
	}, [chatUsers, composerSearchQuery]);
	const groupSettingsCandidates = useMemo(() => {
		if (!activeChannel) return [];
		return chatUsers.filter((candidate) => {
			const exists = activeChannel.channelMembers?.some(
				(member) =>
					member.userId === candidate.id &&
					member.status !== "LEFT" &&
					member.status !== "BANNED"
			);
			if (exists) return false;
			if (!settingsSearchQuery) return true;
			return (
				candidate.username.toLowerCase().includes(settingsSearchQuery) ||
				(candidate.status || "").toLowerCase().includes(settingsSearchQuery)
			);
		});
	}, [activeChannel, chatUsers, settingsSearchQuery]);
	const activeConversationPeer = useMemo(() => {
		if (!activeChannel || activeChannel.type !== "CONVERSATION") return undefined;
		return getConversationPeer(activeChannel, user?.id);
	}, [activeChannel, user?.id]);
	const activeGroupMember = useMemo(() => {
		if (!activeChannel || activeChannel.type === "CONVERSATION") return undefined;
		return activeChannel.channelMembers?.find((member) => member.userId === user?.id);
	}, [activeChannel, user?.id]);
	const canManageGroup =
		(activeGroupMember?.role === "OWNER" || activeGroupMember?.role === "ADMIN") &&
		activeGroupMember?.status === "ACTIVE";
	const isOwner = activeGroupMember?.role === "OWNER";
	const isPeerBlockedByMe =
		!!activeConversationPeer && blockedByMeUserIds.includes(activeConversationPeer.id);
	const isPeerBlockingMe = !!activeConversationPeer && blockedMeUserIds.includes(activeConversationPeer.id);
	const sendRestrictionMessage = useMemo(() => {
		if (!activeChannel) return null;
		if (activeChannel.type === "CONVERSATION" && isPeerBlockedByMe) {
			return "You blocked this user. Unblock them to send messages.";
		}
		if (activeChannel.type === "CONVERSATION" && isPeerBlockingMe) {
			return "You are blocked by this user and cannot send messages.";
		}
		if (activeChannel.type !== "CONVERSATION") {
			if (!activeGroupMember) return "You are not an active member of this group.";
			if (activeGroupMember.status === "MUTED") {
				return "You are muted in this group and cannot send messages.";
			}
			if (activeGroupMember.status === "BANNED") {
				return "You are banned from this group and cannot send messages.";
			}
			if (activeGroupMember.status === "LEFT") {
				return "You left this group and cannot send messages.";
			}
		}
		return null;
	}, [activeChannel, activeGroupMember, isPeerBlockedByMe, isPeerBlockingMe]);

	useEffect(() => {
		if (!activeChannel?.id || !user?.id) return;
		fetcher(`api/messages/${activeChannel.id}/${user.id}?take=120`).then((data) => {
			const nextMessages = data || [];
			setMessagesByChannel((prev) => ({
				...prev,
				[activeChannel.id as number]: nextMessages,
			}));
			setOldestDateByChannel((prev) => ({
				...prev,
				[activeChannel.id as number]: nextMessages[0]?.date || prev[activeChannel.id as number],
			}));
		});
		socket?.emit("reset_mssg_count", { channelId: activeChannel.id });
	}, [activeChannel?.id, socket, user?.id]);

	useEffect(() => {
		if (!messagesRef.current) return;
		messagesRef.current.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
	}, [activeMessages.length, activeChannel?.id]);

	const handleLoadOlder = async () => {
		if (!activeChannel?.id || !user?.id || loadingOlder) return;
		const channelId = activeChannel.id;
		setLoadingOlder(true);
		try {
			const before = oldestDateByChannel[channelId];
			const query = before ? `?take=80&before=${encodeURIComponent(before)}` : "?take=80";
			const older = await fetcher(`api/messages/${channelId}/${user.id}${query}`);
			if (!older?.length) return;
			setMessagesByChannel((prev) => {
				const existing = prev[channelId] || [];
				const merged = [...older, ...existing];
				const deduped = merged.filter(
					(message, index, array) => array.findIndex((m) => m.id === message.id) === index
				);
				return { ...prev, [channelId]: deduped };
			});
			setOldestDateByChannel((prev) => ({ ...prev, [channelId]: older[0]?.date }));
		} finally {
			setLoadingOlder(false);
		}
	};

	const handleSend = () => {
		const normalizedContent = composerValue.trim();
		if (!activeChannel?.id || !normalizedContent || sendRestrictionMessage) return;

		const optimisticMessage: Imessage = {
			id: Date.now() * -1,
			content: normalizedContent,
			senderId: user?.id || 0,
			receiverId: activeChannel.id,
			date: new Date().toISOString(),
			sender: user,
			receiver: undefined,
		};

		setMessagesByChannel((prev) => ({
			...prev,
			[activeChannel.id as number]: [...(prev[activeChannel.id as number] || []), optimisticMessage],
		}));

		socket?.emit("message", {
			senderId: user?.id,
			receiverId: activeChannel.id,
			content: normalizedContent,
		});
		setComposerValue("");
	};

	const handleInviteToGame = (targetUserId?: number) => {
		if (!targetUserId || !user?.id) return;
		gameSocket?.emit("invite-friend", {
			inviterId: user.id,
			invitedFriendId: targetUserId,
			gameMode: "Classic Mode",
			powerUps: "Classic",
		});
		router.push("/pong");
	};

	const isCurrentUserIn = (channel: Ichannel, key: keyof Ichannel) => {
		const list = (channel[key] as unknown as Array<{ id: number }>) || [];
		return !!user?.id && list.some((item) => item.id === user.id);
	};

	const applyChannelToggle = (channelId: number, key: keyof Ichannel, shouldEnable: boolean) => {
		if (!user?.id) return;
		setChannels((prev) =>
			prev.map((channel) => {
				if (channel.id !== channelId) return channel;
				const list = ((channel[key] as unknown as Array<{ id: number }>) || []).filter(Boolean);
				const already = list.some((item) => item.id === user.id);
				const nextList = shouldEnable
					? already
						? list
						: [...list, { id: user.id } as any]
					: list.filter((item) => item.id !== user.id);
				return { ...channel, [key]: nextList };
			})
		);
	};

	const emitChannelAction = (channel: Ichannel, action: "pin" | "mute" | "archive" | "delete" | "mark") => {
		if (!channel?.id) return;
		const payload = { channelId: channel.id };
		if (action === "pin") {
			const pinned = isCurrentUserIn(channel, "pinnedFor");
			socket?.emit(pinned ? "unpin_channel" : "pin_channel", payload);
			applyChannelToggle(channel.id, "pinnedFor", !pinned);
			return;
		}
		if (action === "mute") {
			const muted = isCurrentUserIn(channel, "mutedFor");
			socket?.emit(muted ? "unmute_channel" : "mute_channel", payload);
			applyChannelToggle(channel.id, "mutedFor", !muted);
			return;
		}
		if (action === "archive") {
			const archived = isCurrentUserIn(channel, "archivedFor");
			socket?.emit(archived ? "unarchive_channel" : "archive_channel", payload);
			applyChannelToggle(channel.id, "archivedFor", !archived);
			return;
		}
		if (action === "mark") {
			const unread = isCurrentUserIn(channel, "unreadFor");
			socket?.emit(unread ? "mark_read" : "mark_unread", payload);
			applyChannelToggle(channel.id, "unreadFor", !unread);
			return;
		}
		socket?.emit("channel_delete", payload);
		setChannels((prev) => prev.filter((entry) => entry.id !== channel.id));
		if (activeChannel?.id === channel.id) {
			setActiveChannel(null);
		}
	};

	const createDm = (receiverId: number) => {
		if (!user?.id) return;
		socket?.emit("dm_create", { senderId: user.id, receiverId });
		setComposerMemberSearch("");
		setShowComposerModal(false);
	};

	const createGroup = () => {
		if (!newGroupName.trim() || !selectedGroupMembers.length) return;
		socket?.emit("channel_create", {
			name: newGroupName.trim(),
			avatar: "/img/group.jpg",
			visibility: newGroupVisibility,
			members: selectedGroupMembers,
			password: newGroupVisibility === "PROTECTED" ? newGroupPassword : "",
			access_pass: newGroupAccessPassword,
		});
		setShowComposerModal(false);
		setNewGroupName("");
		setNewGroupVisibility("PUBLIC");
		setNewGroupPassword("");
		setNewGroupAccessPassword("");
		setSelectedGroupMembers([]);
		setComposerMemberSearch("");
	};

	const resetGroupSettingsState = () => {
		setSettingsName(activeChannel?.name || "");
		setSettingsAvatar(activeChannel?.avatar || "/img/group.jpg");
		setSettingsVisibility(activeChannel?.visiblity || "PUBLIC");
		setSettingsPassword("");
		setSettingsAccessPassword("");
		setSettingsNewMembers([]);
		setSettingsMemberSearch("");
	};

	useEffect(() => {
		resetGroupSettingsState();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeChannel?.id]);

	const updateGroupSetting = (type: string, payload: Record<string, unknown>) => {
		if (!activeChannel?.id) return;
		socket?.emit("channel_update", {
			id: activeChannel.id,
			type,
			...payload,
		});
	};

	const saveGroupSettings = () => {
		if (!activeChannel?.id) return;
		const hasAvatarChanged = settingsAvatar && settingsAvatar !== activeChannel.avatar;
		if (hasAvatarChanged && settingsAvatar.startsWith("data:image/") && settingsAvatar.length > 3_000_000) {
			toast.error("Image is too large. Please choose a smaller image.");
			return;
		}
		setIsSavingGroupSettings(true);
		if (settingsName.trim() && settingsName !== activeChannel.name) {
			updateGroupSetting("name", { name: settingsName.trim() });
		}
		if (settingsAvatar && settingsAvatar !== activeChannel.avatar) {
			updateGroupSetting("avatar", { avatar: settingsAvatar });
		}
		if (settingsVisibility !== activeChannel.visiblity) {
			updateGroupSetting("visibility", {
				visibility: settingsVisibility,
				password: settingsPassword,
			});
		}
		if (settingsAccessPassword.trim()) {
			updateGroupSetting("access_pass", { access_pass: settingsAccessPassword.trim() });
		}
		if (settingsNewMembers.length) {
			updateGroupSetting("members", { members: settingsNewMembers });
		}
		socket?.emit("refresh_channel", { channelId: activeChannel.id });
		setTimeout(() => {
			setIsSavingGroupSettings(false);
		}, 450);
		setShowGroupSettings(false);
	};

	const handleLeaveGroup = () => {
		if (!activeChannel?.id || !user?.id) return;
		socket?.emit("channel_leave", { channelId: activeChannel.id, userId: user.id });
		setShowGroupSettings(false);
	};

	const handleDeleteGroup = () => {
		if (!activeChannel?.id) return;
		socket?.emit("channel_remove", { channelId: activeChannel.id });
		setShowGroupSettings(false);
		setActiveChannel(null);
	};

	const getMemberActions = (member: IchannelMember) => {
		if (!activeChannel || !activeGroupMember || !user?.id) return null;
		if (member.userId === user.id) return null;
		if (member.status === "LEFT") return null;

		const canAdminAct = isOwner || activeGroupMember.role === "ADMIN";
		if (!canAdminAct) return null;

		const isTargetOwner = member.role === "OWNER";
		if (isTargetOwner) return null;

		const isBanned = member.status === "BANNED";

		return {
			canToggleAdmin: isOwner && !isBanned && member.status === "ACTIVE",
			canSetOwner: isOwner && !isBanned && member.status === "ACTIVE",
			canBanOrUnban: true,
			canKick: !isBanned && member.status === "ACTIVE",
			canMute: true,
		};
	};

	const patchMemberInState = (
		channel: Ichannel,
		userIdToPatch: number,
		patch: Partial<IchannelMember>
	): Ichannel => {
		const nextMembers = (channel.channelMembers || []).map((entry) =>
			entry.userId === userIdToPatch ? { ...entry, ...patch } : entry
		);
		return { ...channel, channelMembers: nextMembers };
	};

	const patchActiveChannelMember = (userIdToPatch: number, patch: Partial<IchannelMember>) => {
		setActiveChannel((prev) => {
			if (!prev) return prev;
			return patchMemberInState(prev, userIdToPatch, patch);
		});
		setChannels((prev) =>
			prev.map((channel) =>
				channel.id === activeChannel?.id
					? patchMemberInState(channel, userIdToPatch, patch)
					: channel
			)
		);
		setArchivedChannels((prev) =>
			prev.map((channel) =>
				channel.id === activeChannel?.id
					? patchMemberInState(channel, userIdToPatch, patch)
					: channel
			)
		);
	};

	const getActionState = (member: IchannelMember, action: string) =>
		!!pendingMemberActions[`${member.userId}:${action}`];

	const emitMemberAction = (
		action: "set_admin" | "set_owner" | "ban_user" | "unban_user" | "kick_user" | "mute_user" | "unmute_user",
		member: IchannelMember
	) => {
		if (!activeChannel?.id) return;
		const actions = getMemberActions(member);
		if (!actions) return;
		if (action === "set_admin" && !actions.canToggleAdmin) return;
		if (action === "set_owner" && !actions.canSetOwner) return;
		if ((action === "ban_user" || action === "unban_user") && !actions.canBanOrUnban) return;
		if (action === "kick_user" && !actions.canKick) return;
		if ((action === "mute_user" || action === "unmute_user") && !actions.canMute) return;
		if ((action === "set_admin" || action === "set_owner" || action === "kick_user") && member.status !== "ACTIVE") {
			toast.error("This action requires an active member.");
			return;
		}
		if (action === "mute_user" && member.status !== "ACTIVE") {
			toast.error("Only active members can be muted.");
			return;
		}
		if (action === "unmute_user" && member.status !== "MUTED") return;
		if (action === "ban_user" && member.status === "BANNED") return;
		if (action === "unban_user" && member.status !== "BANNED") return;
		const actionKey = `${member.userId}:${action}`;
		if (pendingMemberActions[actionKey]) return;
		setPendingMemberActions((prev) => ({ ...prev, [actionKey]: true }));
		if (action === "mute_user") {
			const duration = Math.max(1, muteDurationByMember[member.userId] || 60);
			socket?.emit(action, { userId: member.userId, channelId: activeChannel.id, banDuration: duration });
			patchActiveChannelMember(member.userId, {
				status: "MUTED",
			});
		} else {
			socket?.emit(action, { userId: member.userId, channelId: activeChannel.id });
			if (action === "unmute_user") {
				patchActiveChannelMember(member.userId, {
					status: "ACTIVE",
				});
			}
			if (action === "ban_user") {
				patchActiveChannelMember(member.userId, {
					status: "BANNED",
					role: "MEMEBER",
				});
			}
			if (action === "unban_user") {
				patchActiveChannelMember(member.userId, {
					status: "LEFT",
					role: "MEMEBER",
				});
			}
			if (action === "kick_user") {
				patchActiveChannelMember(member.userId, {
					status: "LEFT",
					role: "MEMEBER",
				});
			}
			if (action === "set_admin") {
				patchActiveChannelMember(member.userId, {
					role: member.role === "ADMIN" ? "MEMEBER" : "ADMIN",
				});
			}
			if (action === "set_owner") {
				setActiveChannel((prev) => {
					if (!prev) return prev;
					const nextMembers = (prev.channelMembers || []).map((entry) => {
						if (entry.role === "OWNER") return { ...entry, role: "ADMIN" as const };
						if (entry.userId === member.userId) return { ...entry, role: "OWNER" as const };
						return entry;
					});
					return { ...prev, channelMembers: nextMembers };
				});
			}
		}
		setTimeout(() => {
			setPendingMemberActions((prev) => ({ ...prev, [actionKey]: false }));
		}, 900);
	};

	const handleGoToProfile = (targetUserId?: number) => {
		if (!targetUserId) return;
		router.push(`/profile/${targetUserId}`);
	};

	const handleToggleBlock = async (targetUserId?: number) => {
		if (!targetUserId || !user?.id) return;
		const isBlocked = blockedByMeUserIds.includes(targetUserId);
		const endpoint = isBlocked ? "api/users/unblock-user" : "api/users/block-user";
		await axios.post(
			`${process.env.BACK_END_URL}${endpoint}`,
			{ blockerId: user.id, blockingId: targetUserId },
			{ withCredentials: true }
		);
		await loadBlockState(user.id);
		socket?.emit("blockUser", {
			blockerId: user.id,
			blockedId: targetUserId,
			channelId: activeChannel?.id || contextMenu?.channel.id,
			isBlock: !isBlocked,
		});
	};

	return (
		<div className="grid h-full w-full grid-cols-12 gap-3">
			<aside className="col-span-12 rounded-3xl border border-secondary-700 bg-secondary-900 lg:col-span-4">
				<div className="border-b border-secondary-700 p-4">
					<div className="flex items-center justify-between">
						<p className="text-xs uppercase tracking-[0.25em] text-secondary-400">Inbox</p>
						<button
							onClick={() => setShowComposerModal(true)}
							className="inline-flex items-center gap-1 rounded-xl border border-secondary-600 bg-secondary-700 px-2 py-1 text-xs text-secondary-100 transition hover:bg-secondary-600"
						>
							<Plus className="h-3 w-3" />
							New
						</button>
					</div>
					<div className="relative mt-3">
						<Search className="absolute left-3 top-3 h-4 w-4 text-secondary-400" />
						<input
							value={channelSearch}
							onChange={(e) => setChannelSearch(e.target.value)}
							placeholder="Search conversations..."
							className="w-full rounded-xl border border-secondary-500 bg-secondary-800 py-2 pl-9 pr-3 text-sm text-secondary-50 outline-none transition focus:border-primary-300"
						/>
					</div>
					<div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-secondary-800 p-1">
						<button
							onClick={() => setInboxMode("active")}
							className={twMerge(
								"rounded-lg px-2 py-1 text-xs transition",
								inboxMode === "active"
									? "bg-primary-300 text-secondary-900"
									: "text-secondary-300 hover:bg-secondary-700"
							)}
						>
							Active
						</button>
						<button
							onClick={() => setInboxMode("archived")}
							className={twMerge(
								"rounded-lg px-2 py-1 text-xs transition",
								inboxMode === "archived"
									? "bg-primary-300 text-secondary-900"
									: "text-secondary-300 hover:bg-secondary-700"
							)}
						>
							Archived
						</button>
					</div>
				</div>
				<div
					ref={channelListRef}
					onScroll={() => setChannelScrollTop(channelListRef.current?.scrollTop || 0)}
					className="h-[72vh] overflow-y-auto px-2 pb-2"
				>
					<div style={{ height: channelWindow.offsetTop }} />
					{visibleChannels.map((channel) => {
						const name = getChannelName(channel, user?.id);
						const avatar = getChannelAvatar(channel, user?.id);
						const isActive = activeChannel?.id === channel.id;
						return (
							<button
								key={channel.id}
								onContextMenu={(e) => {
									e.preventDefault();
									setContextMenu({ channel, x: e.clientX, y: e.clientY });
								}}
								onClick={() => {
									setActiveChannel(channel);
									setShowQuickSwitch(false);
								}}
								className={twMerge(
									"my-1 flex h-[64px] w-full items-center gap-3 rounded-2xl px-3 text-left transition",
									isActive ? "bg-secondary-700" : "hover:bg-secondary-800"
								)}
							>
								<img src={avatar} alt={name} className="h-10 w-10 rounded-full object-cover" />
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-semibold text-secondary-50">{name}</p>
									<p className="truncate text-xs text-secondary-300">
										{channel.messages?.[0]?.content || "No messages yet"}
									</p>
								</div>
								<div className="ml-1 flex items-center gap-1">
									{isCurrentUserIn(channel, "pinnedFor") && <Pin className="h-3 w-3 text-primary-300" />}
									{isCurrentUserIn(channel, "mutedFor") && (
										<VolumeX className="h-3 w-3 text-secondary-300" />
									)}
									{isCurrentUserIn(channel, "unreadFor") && (
										<span className="h-2 w-2 rounded-full bg-primary-400" />
									)}
								</div>
							</button>
						);
					})}
					<div style={{ height: channelWindow.offsetBottom }} />
				</div>
			</aside>

			<section className="col-span-12 flex h-[calc(100vh)] min-h-[78vh] flex-col overflow-hidden rounded-3xl border border-secondary-500 bg-secondary-700 lg:col-span-8">
				<div className="flex items-center justify-between border-b border-secondary-500/70 bg-secondary-800/70 px-4 py-3 backdrop-blur-sm">
					<div>
						<p className="text-xs uppercase tracking-[0.25em] text-secondary-300">Workspace</p>
						<p className="text-lg font-semibold text-secondary-50">
							{activeChannel ? getChannelName(activeChannel, user?.id) : "Select a conversation"}
						</p>
					</div>
					<div className="flex items-center gap-2">
						{activeChannel && activeChannel.type !== "CONVERSATION" && (
							<button
								onClick={() => {
									resetGroupSettingsState();
									setShowGroupSettings(true);
								}}
								className="rounded-xl border border-secondary-500 bg-secondary-800 px-3 py-2 text-xs text-secondary-100"
							>
								<Settings className="mr-1 inline h-3 w-3" />
								Group settings
							</button>
						)}
						{activeConversationPeer && (
							<>
								<button
									onClick={() => handleInviteToGame(activeConversationPeer.id)}
									className="rounded-xl border border-secondary-500 bg-secondary-800 px-3 py-2 text-xs text-secondary-100"
								>
									<Gamepad2 className="mr-1 inline h-3 w-3" />
									Invite
								</button>
								<button
									onClick={() => handleGoToProfile(activeConversationPeer.id)}
									className="rounded-xl border border-secondary-500 bg-secondary-800 px-3 py-2 text-xs text-secondary-100"
								>
									<UserCircle className="mr-1 inline h-3 w-3" />
									Profile
								</button>
								<button
									onClick={() => handleToggleBlock(activeConversationPeer.id)}
									className="rounded-xl border border-secondary-500 bg-secondary-800 px-3 py-2 text-xs text-secondary-100"
								>
									<UserX className="mr-1 inline h-3 w-3" />
									{isPeerBlockedByMe ? "Unblock" : "Block"}
								</button>
							</>
						)}
						<button
							onClick={() => setShowQuickSwitch(true)}
							className="rounded-xl border border-secondary-700 bg-secondary-500 px-3 py-2 text-xs text-secondary-100"
						>
							Quick Switch (Cmd/Ctrl+K)
						</button>
					</div>
				</div>

				{activeChannel ? (
					<div className="flex min-h-0 flex-1 flex-col">
						<div className="flex shrink-0 items-center justify-center py-2">
							<button
								onClick={handleLoadOlder}
								disabled={loadingOlder}
								className="flex items-center gap-1 rounded-full border border-secondary-700 px-3 py-1 text-xs text-secondary-100 disabled:opacity-60"
							>
								<ChevronDown className="h-3 w-3" />
								{loadingOlder ? "Loading..." : "Load older"}
							</button>
						</div>

						<div ref={messagesRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 pb-4">
							{activeMessages.map((message) => {
								const mine = message.senderId === user?.id;
								return (
									<div
										key={`${message.id}-${message.date}`}
										className={twMerge("flex", mine ? "justify-end" : "justify-start")}
									>
										<div
											className={twMerge(
												"max-w-[75%] rounded-2xl px-3 py-2 text-sm",
												mine
													? "bg-primary-300 text-secondary-900 rounded-br-sm"
													: "bg-secondary-800 text-secondary-100 rounded-bl-sm"
											)}
										>
											<p className="break-words">{message.content}</p>
											<p className="mt-1 text-[10px] opacity-70">
												{new Date(message.date).toLocaleTimeString([], {
													hour: "2-digit",
													minute: "2-digit",
												})}
											</p>
										</div>
									</div>
								);
							})}
						</div>

						<div className="mt-auto flex shrink-0 flex-col gap-2 border-t border-secondary-700 bg-secondary-700 p-2.5">
							{sendRestrictionMessage && (
								<div className="w-full rounded-xl border border-amber-400/50 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
									{sendRestrictionMessage}
								</div>
							)}
							<div className="flex w-full items-center gap-2">
							<input
								value={composerValue}
								onChange={(e) => setComposerValue(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") handleSend();
								}}
								disabled={!!sendRestrictionMessage}
								placeholder={
									sendRestrictionMessage ? "Messaging disabled in this conversation." : "Write a message..."
								}
								className="flex-1 rounded-xl border border-secondary-500 bg-secondary-900 px-3 py-2 text-sm text-secondary-50 outline-none focus:border-primary-300 disabled:cursor-not-allowed disabled:opacity-60"
							/>
							<button
								onClick={handleSend}
								disabled={!!sendRestrictionMessage}
								className="rounded-xl bg-primary-300 p-2 text-secondary-900 transition hover:bg-primary-200 disabled:cursor-not-allowed disabled:opacity-60"
							>
								<SendHorizonal className="h-4 w-4" />
							</button>
							</div>
						</div>
					</div>
				) : (
					<div className="flex h-full flex-col items-center justify-center gap-2 text-secondary-200">
						<MessageSquare className="h-8 w-8" />
						<p className="text-sm">Pick a chat from the inbox to start messaging.</p>
					</div>
				)}
			</section>

			{showQuickSwitch && (
				<div className="fixed inset-0 z-50 flex items-start justify-center bg-secondary-900/70 pt-20">
					<div className="w-[680px] max-w-[92vw] rounded-2xl border border-secondary-700 bg-secondary-900 p-3 shadow-2xl">
						<input
							autoFocus
							value={channelSearch}
							onChange={(e) => setChannelSearch(e.target.value)}
							placeholder="Jump to conversation..."
							className="w-full rounded-xl border border-secondary-500 bg-secondary-800 px-3 py-2 text-sm text-secondary-50 outline-none"
						/>
						<div className="mt-2 max-h-[50vh] overflow-y-auto">
							{filteredChannels.slice(0, 12).map((channel) => (
								<button
									key={channel.id}
									onClick={() => {
										setActiveChannel(channel);
										setShowQuickSwitch(false);
									}}
									className="my-1 w-full rounded-xl px-3 py-2 text-left text-sm text-secondary-100 hover:bg-secondary-700"
								>
									{getChannelName(channel, user?.id)}
								</button>
							))}
						</div>
					</div>
				</div>
			)}

			{contextMenu && (
				<div
					className="fixed inset-0 z-40"
					onClick={() => setContextMenu(null)}
					onContextMenu={(e) => {
						e.preventDefault();
						setContextMenu(null);
					}}
				>
					<div style={{ left: contextMenu.x, top: contextMenu.y, position: "fixed" }}>
						<div className="w-[260px] overflow-hidden rounded-2xl border border-secondary-500/70 bg-secondary-700/95 shadow-2xl backdrop-blur-md">
							<div className="border-b border-secondary-500/70 px-3 py-2">
								<p className="truncate text-xs uppercase tracking-[0.2em] text-secondary-200">
									Chat Actions
								</p>
								<p className="truncate text-sm font-semibold text-secondary-50">
									{getChannelName(contextMenu.channel, user?.id)}
								</p>
							</div>

							<div className="grid grid-cols-1 gap-1 p-2">
								<button
									onClick={() => {
										emitChannelAction(contextMenu.channel, "pin");
										setContextMenu(null);
									}}
									className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-secondary-100 transition hover:bg-secondary-500/70"
								>
									<Pin className="h-4 w-4" />
									{isCurrentUserIn(contextMenu.channel, "pinnedFor") ? "Unpin chat" : "Pin chat"}
								</button>
								<button
									onClick={() => {
										emitChannelAction(contextMenu.channel, "archive");
										setContextMenu(null);
									}}
									className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-secondary-100 transition hover:bg-secondary-500/70"
								>
									<Archive className="h-4 w-4" />
									{isCurrentUserIn(contextMenu.channel, "archivedFor")
										? "Unarchive chat"
										: "Archive chat"}
								</button>
								<button
									onClick={() => {
										emitChannelAction(contextMenu.channel, "mark");
										setContextMenu(null);
									}}
									className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-secondary-100 transition hover:bg-secondary-500/70"
								>
									<BellDot className="h-4 w-4" />
									{isCurrentUserIn(contextMenu.channel, "unreadFor")
										? "Mark as read"
										: "Mark as unread"}
								</button>
								<button
									onClick={() => {
										emitChannelAction(contextMenu.channel, "mute");
										setContextMenu(null);
									}}
									className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-secondary-100 transition hover:bg-secondary-500/70"
								>
									<VolumeX className="h-4 w-4" />
									{isCurrentUserIn(contextMenu.channel, "mutedFor")
										? "Unmute chat"
										: "Mute chat"}
								</button>

								{contextMenu.channel.type === "CONVERSATION" && (
									<>
										<div className="my-1 border-t border-secondary-500/60" />
										<button
											onClick={() => {
												const peer = getConversationPeer(contextMenu.channel, user?.id);
												handleInviteToGame(peer?.id);
												setContextMenu(null);
											}}
											className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-secondary-100 transition hover:bg-secondary-500/70"
										>
											<Gamepad2 className="h-4 w-4" />
											Invite to game
										</button>
										<button
											onClick={() => {
												const peer = getConversationPeer(contextMenu.channel, user?.id);
												handleGoToProfile(peer?.id);
												setContextMenu(null);
											}}
											className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-secondary-100 transition hover:bg-secondary-500/70"
										>
											<UserCircle className="h-4 w-4" />
											Go to profile
										</button>
										<button
											onClick={async () => {
												const peer = getConversationPeer(contextMenu.channel, user?.id);
												await handleToggleBlock(peer?.id);
												setContextMenu(null);
											}}
											className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-secondary-100 transition hover:bg-secondary-500/70"
										>
											<UserX className="h-4 w-4" />
											{blockedByMeUserIds.includes(
												getConversationPeer(contextMenu.channel, user?.id)?.id || -1
											)
												? "Unblock user"
												: "Block user"}
										</button>
									</>
								)}

								<div className="my-1 border-t border-secondary-500/60" />
								<button
									onClick={() => {
										emitChannelAction(contextMenu.channel, "delete");
										setContextMenu(null);
									}}
									className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-300 transition hover:bg-red-500/20"
								>
									<Trash2 className="h-4 w-4" />
									Delete chat
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{showComposerModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-900/75 backdrop-blur-sm">
					<div className="w-[820px] max-w-[95vw] rounded-3xl border border-secondary-500 bg-secondary-800 p-4 shadow-2xl">
						<div className="mb-4 flex items-center justify-between">
							<div>
								<p className="text-xs uppercase tracking-[0.2em] text-secondary-300">Compose</p>
								<p className="text-lg font-semibold text-secondary-50">Start New Conversation</p>
							</div>
							<button
								onClick={() => setShowComposerModal(false)}
								className="rounded-xl border border-secondary-600 px-3 py-1 text-sm text-secondary-200"
							>
								Close
							</button>
						</div>
						<div className="mb-4 flex gap-2 rounded-2xl bg-secondary-700 p-1">
							<button
								onClick={() => setComposerMode("dm")}
								className={twMerge(
									"flex-1 rounded-xl px-3 py-2 text-sm transition",
									composerMode === "dm"
										? "bg-primary-300 text-secondary-900"
										: "text-secondary-200 hover:bg-secondary-600"
								)}
							>
								Direct Message
							</button>
							<button
								onClick={() => setComposerMode("group")}
								className={twMerge(
									"flex-1 rounded-xl px-3 py-2 text-sm transition",
									composerMode === "group"
										? "bg-primary-300 text-secondary-900"
										: "text-secondary-200 hover:bg-secondary-600"
								)}
							>
								Group Chat
							</button>
						</div>

						{composerMode === "dm" ? (
							<div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
								<div className="relative mb-2">
									<Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-secondary-400" />
									<input
										value={composerMemberSearch}
										onChange={(e) => setComposerMemberSearch(e.target.value)}
										placeholder="Search users by name or status..."
										className="w-full rounded-xl border border-secondary-500 bg-secondary-700 py-2 pl-9 pr-3 text-sm text-secondary-50 outline-none transition focus:border-primary-300"
									/>
								</div>
								{filteredComposerUsers.map((candidate) => (
									<div
										key={candidate.id}
										className="flex items-center justify-between rounded-2xl border border-secondary-600 bg-secondary-700 px-3 py-2"
									>
										<div className="flex items-center gap-3">
											<img
												src={candidate.avatar}
												alt={candidate.username}
												className="h-10 w-10 rounded-full object-cover"
											/>
											<div>
												<p className="text-sm font-semibold text-secondary-50">{candidate.username}</p>
												<p className="text-xs text-secondary-300">{candidate.status}</p>
											</div>
										</div>
										<button
											onClick={() => createDm(candidate.id)}
											className="rounded-xl bg-primary-300 px-3 py-2 text-xs text-secondary-900 transition hover:bg-primary-200"
										>
											Send DM
										</button>
									</div>
								))}
								{filteredComposerUsers.length === 0 && (
									<div className="rounded-xl border border-secondary-600 bg-secondary-700 px-3 py-4 text-center text-sm text-secondary-300">
										No users match your search.
									</div>
								)}
							</div>
						) : (
							<div className="space-y-3">
								<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
									<input
										value={newGroupName}
										onChange={(e) => setNewGroupName(e.target.value)}
										placeholder="Group name"
										className="rounded-xl border border-secondary-500 bg-secondary-700 px-3 py-2 text-sm text-secondary-50 outline-none"
									/>
									<select
										value={newGroupVisibility}
										onChange={(e) => setNewGroupVisibility(e.target.value)}
										className="rounded-xl border border-secondary-500 bg-secondary-700 px-3 py-2 text-sm text-secondary-50 outline-none"
									>
										<option value="PUBLIC">Public</option>
										<option value="PRIVATE">Private</option>
										<option value="PROTECTED">Protected</option>
									</select>
								</div>
								{newGroupVisibility === "PROTECTED" && (
									<input
										value={newGroupPassword}
										onChange={(e) => setNewGroupPassword(e.target.value)}
										placeholder="Channel password (required for protected)"
										type="password"
										className="w-full rounded-xl border border-secondary-500 bg-secondary-700 px-3 py-2 text-sm text-secondary-50 outline-none"
									/>
								)}
								<input
									value={newGroupAccessPassword}
									onChange={(e) => setNewGroupAccessPassword(e.target.value)}
									placeholder="Access password (optional)"
									type="password"
									className="w-full rounded-xl border border-secondary-500 bg-secondary-700 px-3 py-2 text-sm text-secondary-50 outline-none"
								/>
								<div className="relative">
									<Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-secondary-400" />
									<input
										value={composerMemberSearch}
										onChange={(e) => setComposerMemberSearch(e.target.value)}
										placeholder="Search members to add..."
										className="w-full rounded-xl border border-secondary-500 bg-secondary-700 py-2 pl-9 pr-3 text-sm text-secondary-50 outline-none transition focus:border-primary-300"
									/>
								</div>
								{!!selectedGroupMembers.length && (
									<div className="flex flex-wrap gap-1 rounded-xl border border-secondary-600 bg-secondary-800 p-2">
										{selectedGroupMembers.map((memberId) => {
											const selectedUser = chatUsers.find((u) => u.id === memberId);
											if (!selectedUser) return null;
											return (
												<button
													key={memberId}
													onClick={() =>
														setSelectedGroupMembers((prev) =>
															prev.filter((id) => id !== memberId)
														)
													}
													className="rounded-full border border-primary-400/60 bg-primary-500/20 px-2 py-1 text-xs text-primary-200 transition hover:bg-primary-500/30"
												>
													{selectedUser.username} ×
												</button>
											);
										})}
									</div>
								)}
								<div className="max-h-[35vh] space-y-2 overflow-y-auto pr-1">
									{filteredComposerUsers.map((candidate) => {
										const selected = selectedGroupMembers.includes(candidate.id);
										return (
											<button
												key={candidate.id}
												onClick={() =>
													setSelectedGroupMembers((prev) =>
														selected
															? prev.filter((id) => id !== candidate.id)
															: [...prev, candidate.id]
													)
												}
												className={twMerge(
													"flex w-full items-center justify-between rounded-2xl border px-3 py-2 transition",
													selected
														? "border-primary-400 bg-primary-500/20"
														: "border-secondary-600 bg-secondary-700 hover:bg-secondary-600"
												)}
											>
												<div className="flex items-center gap-3">
													<img
														src={candidate.avatar}
														alt={candidate.username}
														className="h-9 w-9 rounded-full object-cover"
													/>
													<div className="text-left">
														<p className="text-sm font-semibold text-secondary-50">{candidate.username}</p>
														<p className="text-xs text-secondary-300">{candidate.status}</p>
													</div>
												</div>
												{selected && <Users className="h-4 w-4 text-primary-300" />}
											</button>
										);
									})}
									{filteredComposerUsers.length === 0 && (
										<div className="rounded-xl border border-secondary-600 bg-secondary-700 px-3 py-4 text-center text-sm text-secondary-300">
											No users match your search.
										</div>
									)}
								</div>
								<div className="flex justify-end">
									<button
										onClick={createGroup}
										disabled={
											!newGroupName.trim() ||
											!selectedGroupMembers.length ||
											(newGroupVisibility === "PROTECTED" && !newGroupPassword.trim())
										}
										className="rounded-xl bg-primary-300 px-4 py-2 text-sm text-secondary-900 transition hover:bg-primary-200 disabled:cursor-not-allowed disabled:opacity-60"
									>
										Create Group
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			)}

			{showGroupSettings && activeChannel && activeChannel.type !== "CONVERSATION" && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-900/80 backdrop-blur-sm">
					<div className="w-[860px] max-w-[95vw] rounded-3xl border border-secondary-500 bg-secondary-800 p-4 shadow-2xl">
						<div className="mb-4 flex items-center justify-between">
							<div>
								<p className="text-xs uppercase tracking-[0.2em] text-secondary-300">Group Settings</p>
								<p className="text-lg font-semibold text-secondary-50">{activeChannel.name}</p>
							</div>
							<button
								onClick={() => setShowGroupSettings(false)}
								className="rounded-xl border border-secondary-600 px-3 py-1 text-sm text-secondary-200"
							>
								Close
							</button>
						</div>

						<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
							<div className="space-y-3 rounded-2xl border border-secondary-600 bg-secondary-700 p-3">
								<p className="text-xs uppercase tracking-[0.2em] text-secondary-300">Basics</p>
								<UpdateAvatar previewImage={settingsAvatar} setPreviewImage={setSettingsAvatar} />
								<p className="text-[11px] text-secondary-300">
									Use JPG/PNG; large images may take a few seconds to sync.
								</p>
								<input
									value={settingsName}
									onChange={(e) => setSettingsName(e.target.value)}
									disabled={!canManageGroup}
									placeholder="Group name"
									className="w-full rounded-xl border border-secondary-500 bg-secondary-800 px-3 py-2 text-sm text-secondary-50 outline-none disabled:opacity-60"
								/>
								<select
									value={settingsVisibility}
									onChange={(e) => setSettingsVisibility(e.target.value)}
									disabled={!canManageGroup}
									className="w-full rounded-xl border border-secondary-500 bg-secondary-800 px-3 py-2 text-sm text-secondary-50 outline-none disabled:opacity-60"
								>
									<option value="PUBLIC">Public</option>
									<option value="PRIVATE">Private</option>
									<option value="PROTECTED">Protected</option>
								</select>
								{settingsVisibility === "PROTECTED" && (
									<input
										value={settingsPassword}
										onChange={(e) => setSettingsPassword(e.target.value)}
										disabled={!canManageGroup}
										placeholder="Protected password"
										type="password"
										className="w-full rounded-xl border border-secondary-500 bg-secondary-800 px-3 py-2 text-sm text-secondary-50 outline-none disabled:opacity-60"
									/>
								)}
								<input
									value={settingsAccessPassword}
									onChange={(e) => setSettingsAccessPassword(e.target.value)}
									disabled={!canManageGroup}
									placeholder="Access password (optional)"
									type="password"
									className="w-full rounded-xl border border-secondary-500 bg-secondary-800 px-3 py-2 text-sm text-secondary-50 outline-none disabled:opacity-60"
								/>
							</div>

							<div className="space-y-3 rounded-2xl border border-secondary-600 bg-secondary-700 p-3">
								<p className="text-xs uppercase tracking-[0.2em] text-secondary-300">Members</p>
								<div className="max-h-[240px] space-y-2 overflow-y-auto pr-1">
									{activeChannel.channelMembers
										?.filter((member) => member.status !== "LEFT")
										.map((member) => {
											const actions = getMemberActions(member);
											return (
												<div
													key={member.userId}
													className="rounded-2xl border border-secondary-600 bg-secondary-800 px-3 py-2"
												>
													<div className="flex items-center justify-between gap-3">
														<div className="flex items-center gap-2">
															<img
																src={member.user.avatar}
																alt={member.user.username}
																className="h-8 w-8 rounded-full object-cover"
															/>
															<div>
																<p className="text-sm text-secondary-50">{member.user.username}</p>
																<p className="text-[11px] text-secondary-300">
																	{member.role} - {member.status}
																</p>
															</div>
														</div>
														<div className="flex items-center gap-1">
															{member.role === "OWNER" && <Crown className="h-4 w-4 text-primary-300" />}
															{member.role === "ADMIN" && (
																<ShieldAlert className="h-4 w-4 text-primary-300" />
															)}
														</div>
													</div>

													{actions && (
														<div className="mt-2 flex flex-wrap gap-2">
															{actions.canToggleAdmin && (
																<button
																	onClick={() => emitMemberAction("set_admin", member)}
																	disabled={member.status !== "ACTIVE" || getActionState(member, "set_admin")}
																	className="rounded-lg border border-secondary-500 px-2 py-1 text-xs text-secondary-100 hover:bg-secondary-700 disabled:cursor-not-allowed disabled:opacity-50"
																>
																	{getActionState(member, "set_admin")
																		? "Updating..."
																		: member.role === "ADMIN"
																		? "Unset admin"
																		: "Set admin"}
																</button>
															)}
															{actions.canSetOwner && (
																<button
																	onClick={() => emitMemberAction("set_owner", member)}
																	disabled={member.status !== "ACTIVE" || getActionState(member, "set_owner")}
																	className="rounded-lg border border-secondary-500 px-2 py-1 text-xs text-secondary-100 hover:bg-secondary-700 disabled:cursor-not-allowed disabled:opacity-50"
																>
																	{getActionState(member, "set_owner") ? "Updating..." : "Set owner"}
																</button>
															)}
															<button
																onClick={() =>
																	emitMemberAction(
																		member.status === "BANNED" ? "unban_user" : "ban_user",
																		member
																	)
																}
																disabled={getActionState(member, member.status === "BANNED" ? "unban_user" : "ban_user")}
																className="rounded-lg border border-secondary-500 px-2 py-1 text-xs text-secondary-100 hover:bg-secondary-700 disabled:cursor-not-allowed disabled:opacity-50"
															>
																{getActionState(member, member.status === "BANNED" ? "unban_user" : "ban_user")
																	? "Updating..."
																	: member.status === "BANNED"
																	? "Unban"
																	: "Ban"}
															</button>
															<button
																onClick={() =>
																	emitMemberAction(
																		member.status === "MUTED" ? "unmute_user" : "mute_user",
																		member
																	)
																}
																disabled={
																	(member.status !== "MUTED" && member.status !== "ACTIVE") ||
																	getActionState(member, member.status === "MUTED" ? "unmute_user" : "mute_user")
																}
																className="rounded-lg border border-secondary-500 px-2 py-1 text-xs text-secondary-100 hover:bg-secondary-700 disabled:cursor-not-allowed disabled:opacity-50"
															>
																{getActionState(member, member.status === "MUTED" ? "unmute_user" : "mute_user")
																	? "Updating..."
																	: member.status === "MUTED"
																	? "Unmute"
																	: "Mute"}
															</button>
															{member.status === "ACTIVE" && (
																<div className="inline-flex items-center gap-1 rounded-lg border border-secondary-600 bg-secondary-900/40 px-2 py-1">
																	<VolumeX className="h-3 w-3 text-secondary-300" />
																	<span className="text-[10px] uppercase tracking-[0.08em] text-secondary-300">
																		Mute
																	</span>
																	<input
																		type="number"
																		min={1}
																		value={muteDurationByMember[member.userId] || 60}
																		onChange={(e) =>
																			setMuteDurationByMember((prev) => ({
																				...prev,
																				[member.userId]: Number(e.target.value) || 60,
																			}))
																		}
																		className="w-12 bg-transparent text-xs text-secondary-50 outline-none"
																	/>
																	<span className="text-[10px] text-secondary-300">sec</span>
																	<button
																		onClick={() => emitMemberAction("mute_user", member)}
																		disabled={getActionState(member, "mute_user")}
																		className="rounded-md border border-secondary-500 px-1.5 py-0.5 text-[10px] text-secondary-100 hover:bg-secondary-700 disabled:cursor-not-allowed disabled:opacity-50"
																	>
																		Apply
																	</button>
																</div>
															)}
															<button
																onClick={() => emitMemberAction("kick_user", member)}
																disabled={member.status !== "ACTIVE" || getActionState(member, "kick_user")}
																className="rounded-lg border border-red-400/60 px-2 py-1 text-xs text-red-300 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
															>
																<UserMinus className="mr-1 inline h-3 w-3" />
																{getActionState(member, "kick_user") ? "Kicking..." : "Kick"}
															</button>
														</div>
													)}
												</div>
											);
										})}
								</div>
								<div className="relative">
									<Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-secondary-400" />
									<input
										value={settingsMemberSearch}
										onChange={(e) => setSettingsMemberSearch(e.target.value)}
										disabled={!canManageGroup}
										placeholder="Search users to add..."
										className="w-full rounded-xl border border-secondary-500 bg-secondary-800 py-2 pl-9 pr-3 text-sm text-secondary-50 outline-none transition focus:border-primary-300 disabled:opacity-60"
									/>
								</div>
								{!!settingsNewMembers.length && (
									<div className="flex flex-wrap gap-1 rounded-xl border border-secondary-600 bg-secondary-800 p-2">
										{settingsNewMembers.map((memberId) => {
											const selectedUser = chatUsers.find((u) => u.id === memberId);
											if (!selectedUser) return null;
											return (
												<button
													key={memberId}
													onClick={() =>
														canManageGroup &&
														setSettingsNewMembers((prev) =>
															prev.filter((id) => id !== memberId)
														)
													}
													className="rounded-full border border-primary-400/60 bg-primary-500/20 px-2 py-1 text-xs text-primary-200 transition hover:bg-primary-500/30"
												>
													{selectedUser.username} ×
												</button>
											);
										})}
									</div>
								)}
								<div className="max-h-[240px] space-y-2 overflow-y-auto pr-1">
									{groupSettingsCandidates.map((candidate) => {
											const selected = settingsNewMembers.includes(candidate.id);
											return (
												<button
													key={candidate.id}
													onClick={() =>
														canManageGroup &&
														setSettingsNewMembers((prev) =>
															selected
																? prev.filter((id) => id !== candidate.id)
																: [...prev, candidate.id]
														)
													}
													className={twMerge(
														"flex w-full items-center justify-between rounded-2xl border px-3 py-2 transition",
														selected
															? "border-primary-400 bg-primary-500/20"
															: "border-secondary-600 bg-secondary-800 hover:bg-secondary-600",
														!canManageGroup && "cursor-not-allowed opacity-60"
													)}
												>
													<div className="flex items-center gap-3">
														<img
															src={candidate.avatar}
															alt={candidate.username}
															className="h-8 w-8 rounded-full object-cover"
														/>
														<p className="text-sm text-secondary-50">{candidate.username}</p>
													</div>
													{selected && <Users className="h-4 w-4 text-primary-300" />}
												</button>
											);
										})}
									{groupSettingsCandidates.length === 0 && (
										<div className="rounded-xl border border-secondary-600 bg-secondary-800 px-3 py-4 text-center text-sm text-secondary-300">
											No users available for this search.
										</div>
									)}
								</div>
								<div className="rounded-xl border border-secondary-600 bg-secondary-800 p-2 text-xs text-secondary-300">
									{activeChannel.channelMembers?.filter(
										(member) => member.status !== "LEFT" && member.status !== "BANNED"
									).length || 0}{" "}
									active members
								</div>
							</div>
						</div>

						<div className="mt-4 flex flex-wrap items-center justify-between gap-2">
							<div className="flex gap-2">
								<button
									onClick={handleLeaveGroup}
									className="rounded-xl border border-secondary-600 px-3 py-2 text-sm text-secondary-100 transition hover:bg-secondary-700"
								>
									<LogOut className="mr-1 inline h-4 w-4" />
									Leave group
								</button>
								{activeGroupMember?.role === "OWNER" && (
									<button
										onClick={handleDeleteGroup}
										className="rounded-xl border border-red-400/70 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/20"
									>
										<Trash2 className="mr-1 inline h-4 w-4" />
										Delete group
									</button>
								)}
							</div>

							<button
								onClick={saveGroupSettings}
								disabled={!canManageGroup || isSavingGroupSettings}
								className="rounded-xl bg-primary-300 px-4 py-2 text-sm text-secondary-900 transition hover:bg-primary-200 disabled:cursor-not-allowed disabled:opacity-60"
							>
								{isSavingGroupSettings ? "Saving..." : "Save settings"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ChatV2;
