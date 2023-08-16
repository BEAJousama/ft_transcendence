"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import io, { Socket } from "socket.io-client";
import { AppContext, fetcher, getCookieItem } from "./app.context";
import { toast } from "react-toastify";
import { Toast } from "../components";

import { INotification } from "./socket.context";
import IUser from "@/interfaces/user";
import useSWR from "swr";
import Link from "next/link";
import { cookies } from "next/dist/client/components/headers";

export interface IchatContext {
	// users: IUser[] | undefined;
	socket: Socket | null;
}

export interface Ichannel {
	id: number | undefined;
	avatar: string;
	name: string;
	description: string;
	channelMembers: IchannelMember[];
	pinnedFor: IUser[];
	unreadFor: IUser[];
	archivedFor: IUser[];
	deletedFor: IUser[];
	mutedFor: IUser[];
	bannedUsers: IUser[];
	kickedUsers: IUser[];
	messages: Imessage[];
	visiblity: string;
	type: string;
	createAt: string;
	updatedAt: string;
	isacessPassword: boolean;
}

export interface Imessage {
	id: number;
	content: string;
	senderId: number;
	receiverId: number;
	date: string;
	sender: IUser | undefined;
	receiver: IUser | undefined;
}

export interface IchannelMember {
	id: number;
	userId: number;
	channelId: number;
	status: string;
	createdAt: string;
	updatedAt: string;
	user: IUser;
	role: string;
	newMessagesCount: number;
}

export const ChatContext = createContext<IchatContext>({
	socket: null,
});

export default function ChatProvider({ children }: { children: React.ReactNode }) {
	const [socket, setSocket] = useState<Socket | null>(null);
	const { user } = useContext(AppContext);
	let count = 0;

	useEffect(() => {
		if (!user && !socket?.connected) return;
		const token = getCookieItem("access_token");
		if (!token) return;
		const newSocket = io(`${process.env.BACK_END_URL}chat`, {
			auth: {
				token: token,
			},
		});
		newSocket.on("notification", (data: INotification) => {
			if (data.sender.id === user?.id) return;
			toast(
				<Link href={data.url}>
					<Toast
						title={data.title}
						content={data.content}
						sender={data.sender.id === user?.id ? data.receiver : data.sender}
					/>
				</Link>,
				{
					className: "md:w-[400px] md:right-[90px]",
				}
			);
		});

		const path = window.location.pathname;
		if (path === "/chat") {
			count = 0;
		}

		newSocket.on("newmessage", (data: INotification) => {
			count++;
			if (count > 8) return;
			const currentUrl = window.location.pathname;
			if (currentUrl === data.url) return;
			toast(
				<Link href={data.url}>
					<Toast
						title={data.title}
						content={data.content}
						sender={data.sender.id === user?.id ? data.receiver : data.sender}
					/>
				</Link>,
				{
					className: "md:w-[400px] md:right-[90px]",
				}
			);
		});

		newSocket.on("error", (data: string) => {
			toast.error(
				<div className="">
					<h1 className="text-white">Error</h1>
					<p className="text-sm text-white">{data}</p>
				</div>
			);
		});
		setSocket(newSocket);
		return () => {
			newSocket.disconnect();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user]);

	const chatContextValue: IchatContext = {
		socket,
	};
	return <ChatContext.Provider value={chatContextValue}>{children}</ChatContext.Provider>;
}
