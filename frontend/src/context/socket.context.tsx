import React, { createContext, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { toast } from "react-toastify";
import { Toast } from "../components";
import IUser from "../interfaces/user";
import { AppContext } from "./app.context";

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
}

export default function SocketProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const { user } = useContext(AppContext);

    useEffect(() => {
        // const newSocket = io(`http://e2r2p14.1337.ma:3000/notification`, {
        const newSocket = io(`${process.env.REACT_APP_BACK_END_URL}notification`, {
            query: {
                clientId: user?.id,
            },
            auth: {
                token: localStorage.getItem("access_token"),
            },
        });
        // console.log(newSocket)
        newSocket.on("connect", () => {
            console.log("Connected");
        });

        newSocket.on("notification", (data: INotification) => {
            toast(
                <Toast
                    title={data.title}
                    content={data.content}
                    sender={data.sender.id === user?.id ? data.receiver : data.sender}
                />,
                {
                    className: "md:w-[400px] md:right-[90px]",
                }
            );
        });
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}> {children} </SocketContext.Provider>
    );
}
