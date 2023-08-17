"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

import io, { Socket } from "socket.io-client";
import { AppContext, getCookieItem } from "./app.context";
import { Ball, Player } from "@/interfaces/game";

enum Keys {
	ArrowUp = "ArrowUp",
	ArrowDown = "ArrowDown",
	Space = " ",
}

export interface IGameContext {
	socket: Socket | null;
	playerA: Player;
	setPlayerA: React.Dispatch<React.SetStateAction<Player>>;
	playerB: Player;
	setPlayerB: React.Dispatch<React.SetStateAction<Player>>;
	ball: Ball;
	setBall: React.Dispatch<React.SetStateAction<Ball>>;
	show?: boolean;
	setShow: React.Dispatch<React.SetStateAction<boolean>>;
	isInGame: React.MutableRefObject<boolean>;
}

export const GameContext = createContext<IGameContext>({
	socket: null,
	playerA: {
		id: 0,
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		score: 0,
	},
	setPlayerA: () => {},
	playerB: {
		id: 0,
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		score: 0,
	},
	setPlayerB: () => {},
	ball: {
		x: 0,
		y: 0,
		radius: 0,
	},
	setBall: () => {},
	isInGame: { current: false },
	show: false,
	setShow: () => {},
});

export default function SocketProvider({ children }: { children: React.ReactNode }) {
	const [playerA, setPlayerA] = useState<Player>({
		id: 0,
		x: 0,
		y: 175,
		width: 10,
		height: 96,
		score: 0,
	});

	const [playerB, setPlayerB] = useState<Player>({
		id: 0,
		x: 640,
		y: 175,
		width: 10,
		height: 96,
		score: 0,
	});
	const [ball, setBall] = useState<Ball>({
		x: 650 / 2,
		y: 480 / 2,
		radius: 10,
	});

	const [show, setShow] = useState<boolean>(false);
	const isInGame = useRef(false);

	const { user } = useContext(AppContext);

	const [socket, setSocket] = useState<Socket | null>(null);

	const keyState: { [key: string]: boolean } = {};

	useEffect(() => {
		if (!user && !socket?.connected) return;
		try {
			const token = getCookieItem("access_token");
			if (!token) return;

			const newSocket = io(`${process.env.BACK_END_URL}pong`, {
				auth: {
					token,
				},
			});

			newSocket.on("connect", () => {});

			newSocket.on("disconnect", () => {});

			setSocket(newSocket);

			return () => {
				newSocket.disconnect();
			};
		} catch (error) {}
	}, [user]);

	useEffect(() => {
		let currentKey: string | null = null; // Keep track of the currently pressed key

		let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (!isInGame.current) return;
			const { key } = event;
			if (Object.values(Keys).includes(key as Keys) && !keyState[key]) {
				keyState[key] = true;

				if (currentKey !== key) {
					if (currentKey) {
						clearTimeout(debounceTimeout || undefined);
						socket?.emit("keyReleased", { key: currentKey, userId: user?.id });
					}

					currentKey = key;
					socket?.emit("keyPressed", { key, userId: user?.id });
				}
			}
		};

		const handleKeyUp = (event: KeyboardEvent) => {
			if (!isInGame.current) return;
			const { key } = event;
			if (Object.values(Keys).includes(key as Keys)) {
				keyState[key] = false;

				if (debounceTimeout) {
					clearTimeout(debounceTimeout);
				}

				debounceTimeout = setTimeout(() => {
					debounceTimeout = null;
					if (key === currentKey) {
						socket?.emit("keyReleased", { key, userId: user?.id });
						currentKey = null;
					}
				}, 100); // Adjust the debounce time as needed
			}
		};

		document.addEventListener("keydown", handleKeyDown, false);
		document.addEventListener("keyup", handleKeyUp, false);
		return () => {
			document.removeEventListener("keydown", handleKeyDown, false);
			document.removeEventListener("keyup", handleKeyUp, false);
		};
	}, [socket, user]);

	const gameContextValue: IGameContext = {
		socket,
		playerA,
		playerB,
		ball,
		setPlayerA,
		setPlayerB,
		setBall,
		isInGame,
		show,
		setShow,
	};

	return <GameContext.Provider value={gameContextValue}>{children}</GameContext.Provider>;
}
