import React, { createContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

export const SocketContext = createContext<Socket | null>(null);

export default function SocketProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [socket, setSocket] = useState<Socket | null>(null);

	useEffect(() => {
		const newSocket = io(`${process.env.REACT_APP_BACK_END_URL}pong`, {
			auth: {
				token: localStorage.getItem("access_token"),
			},
		});
		console.log(newSocket);
		newSocket.on("connect", () => {
			console.log("Connected");
		});
		setSocket(newSocket);
		return () => {
			newSocket.disconnect();
		};
	}, []);

	return (
		<SocketContext.Provider value={socket}>
			{" "}
			{children}{" "}
		</SocketContext.Provider>
	);
}
