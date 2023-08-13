"use client"

import React, { createContext, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { toast } from "react-toastify";
import { Toast } from "@/components";
import IUser from "@/interfaces/user";
import { AppContext, getCookieItem } from "./app.context";
import Link from "next/link";



export const SocketContext = createContext<Socket | null>(null);

export interface INotification {
    id: number;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    seen: boolean;
    sender: IUser;
    receiver: IUser;
    url: string;
}

export default function GameProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const { user } = useContext(AppContext);
    // notification

    useEffect(() => {
        const token = getCookieItem("access_token");
        if (!token) return;

        const newSocket = io(`${process.env.NEXT_PUBLIC_BACK_END_URL}notification`, {
            auth: {
                token,
            }
        });


        newSocket.on("connect", () => {

        });

        newSocket.on("notification", (data: INotification) => {

            toast(
                <Link href={data.url}>
                    <Toast
                        title={data.title}
                        content={data.content}
                        sender={data.sender.id === user?.id ? data.receiver : data.sender}
                    />
                </Link>
                ,
                {
                    className: "md:w-[500px] md:right-[90px]",
                }
            );
        });
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    return (
        <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
    );
}
