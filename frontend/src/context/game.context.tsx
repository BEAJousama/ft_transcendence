import React, { createContext, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { AppContext } from "./app.context";

export const GameContext = createContext<Socket | null>(null);

enum Keys {
	ArrowUp = "ArrowUp",
	ArrowDown = "ArrowDown",
	// ArrowLeft = "ArrowLeft",
	// ArrowRight = "ArrowRight",
	W = "w",
	S = "s",
	// Space = " ",
}

export default function GameProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const { user } = useContext(AppContext);

	const [socket, setSocket] = useState<Socket | null>(null);

	const keyState: { [key: string]: boolean } = {};

	useEffect(() => {
		if (!user) return
		const newSocket = io(`${process.env.REACT_APP_BACK_END_URL}pong`, {
			query: {
				clientId: user?.id,
			},
			auth: {
				token: localStorage.getItem("access_token"),
			},
		});
		console.log(newSocket);
		newSocket.on("connect", () => {
			console.log("Game Connected");
		});
		setSocket(newSocket);

		return () => {
			newSocket.disconnect();
		};
	}, [user]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			const { key } = event;
			if (Object.values(Keys).includes(key as Keys) && !keyState[key]) {
				keyState[key] = true;
				// console.log(user?.id, "pressed", key);
				// Emit the event for the specific key press
				socket?.emit("keyPressed", { key, userId: user?.id });
			}
		};

		const handleKeyUp = (event: KeyboardEvent) => {
			const { key } = event;
			if (Object.values(Keys).includes(key as Keys)) {
				keyState[key] = false;
				// console.log(user?.id, "released", key);
				// Emit the event for the specific key release
				socket?.emit("keyReleased", { key, userId: user?.id });
			}
		};

		document.addEventListener("keydown", handleKeyDown, false);
		document.addEventListener("keyup", handleKeyUp, false);
		return () => {
			document.removeEventListener("keydown", handleKeyDown, false);
			document.removeEventListener("keyup", handleKeyUp, false);
		};
	}, [socket, user]);

	return (
		<GameContext.Provider value={socket}>
			{children}
		</GameContext.Provider>
	);
}
