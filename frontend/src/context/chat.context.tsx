import React, { createContext, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { AppContext } from "./app.context";
import { toast } from "react-toastify";
import { Toast } from "../components";
import { Link } from "react-router-dom";
import { INotification } from "./socket.context";

export const ChatContext = createContext<Socket | null>(null);

export  default function ChatProvider ({
    children,
}: {
    children: React.ReactNode;
}) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const { user } = useContext(AppContext);

    useEffect(() => {
        if (!user) return;
        const newSocket = io(`${process.env.REACT_APP_BACK_END_URL}chat`, {
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
        setSocket(newSocket);
        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    return (
        <ChatContext.Provider value={socket}> {children} </ChatContext.Provider>
    );
}
