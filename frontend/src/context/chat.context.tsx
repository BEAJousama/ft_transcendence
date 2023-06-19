import React, { createContext, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { AppContext } from "./app.context";

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
        // const newSocket = io(`http://e2r2p14.1337.ma:3000/notification`, {
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
        setSocket(newSocket);
        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    return (
        <ChatContext.Provider value={socket}> {children} </ChatContext.Provider>
    );
}
