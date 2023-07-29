import React, { createContext, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { AppContext } from "./app.context";
import { toast } from "react-toastify";
import { Toast } from "../components";
import { Link } from "react-router-dom";
import { INotification } from "./socket.context";
import IUser from "../interfaces/user";
import axios from "axios";

export interface IchatContext {
    users: IUser[] | undefined;
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
};

export interface Imessage {
    id: number;
    content: string;
    senderId: number;
    receiverId: number;
    date: string;
    sender: IUser;
    receiver: IUser;
};

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
};



export const ChatContext = createContext<IchatContext>({
    socket: null,
    users: undefined,
});

export default function ChatProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const { user } = useContext(AppContext);
    const [users, setUsers] = useState<IUser[]>([]);
    const fetchUsers = async () => {
        axios.get(`${process.env.REACT_APP_BACK_END_URL}api/users`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        })
            .then((response) => {
                setUsers(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    useEffect(() => {
        fetchUsers();
        if (!user) return;
        const newSocket = io(`${process.env.REACT_APP_BACK_END_URL}chat`, {
            query: {
                clientId: user?.id,
            },
            auth: {
                token: localStorage.getItem("access_token"),
            },
        });
        newSocket.on("connect", () => {
            console.log("Connected");
        });
        newSocket.on("notification", (data: INotification) => {
            if (data.sender.id === user?.id) return;
            toast(
                <Link to={data.url}>
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
        // add a toast like for error messages

        newSocket.on("error", (data: any) => {
            toast.error(
                <div className="">
                    <h1 className="text-white">Error</h1>
                    <p className="text-sm text-white">{data}</p>
                </div>
            );
        });
        // newSocket.on("exception", (data: any) => {
        //     toast.error(
        //         <div className="">
        //             <h1 className="text-white">Error</h1>
        //             <p className="text-sm text-white">{data.message}</p>
        //         </div>
        //     );
        // });
        setSocket(newSocket);
        return () => {
            newSocket.disconnect();
        };
    }, [user]);
    const chatContextValue: IchatContext = {
        socket,
        users,
    };
    return (
        <ChatContext.Provider value={chatContextValue}>
            {children}
        </ChatContext.Provider>
    );
}