"use client"

import React, { createContext, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { toast } from "react-toastify";
import { Toast } from "@/components";
import IUser from "@/interfaces/user";
import { AppContext } from "./app.context";
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

    useEffect(() => {
        if (!user) return;

        const newSocket = io(`${process.env.NEXT_PUBLIC_BACK_END_URL}notification`, {
            query: {
                clientId: user?.id,
            },
        });

        newSocket.on("connect", () => {

        });

        newSocket.on("notification", (data: INotification) => {

            toast(

                <Toast
                    title={data.title}
                    content={data.content}
                    sender={data.sender.id === user?.id ? data.receiver : data.sender}
                />
                ,
                {
                    className: "md:w-[400px] md:right-[90px]",
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
