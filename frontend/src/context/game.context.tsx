"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import { AppContext } from "./app.context";
import { Ball, Player } from "@/interfaces/game";
import { toast } from "react-toastify";

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
	setPlayerA: () => { },
	playerB: {
		id: 0,
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		score: 0,
	},
	setPlayerB: () => { },
	ball: {
		x: 0,
		y: 0,
		radius: 0,
	},
	setBall: () => { },
	isInGame: { current: false },
	show: false,
	setShow: () => { },
});


export default function SocketProvider({
	children,
}: {
	children: React.ReactNode;
}) {
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
	const activatePowerUp = useRef(true);

	const { user } = useContext(AppContext);

	const [socket, setSocket] = useState<Socket | null>(null);

	const keyState: { [key: string]: boolean } = {};

	useEffect(() => {
		if (!user) return
		const newSocket = io(`${process.env.NEXT_PUBLIC_BACK_END_URL}pong`, {
			query: {
				clientId: user?.id,
			},
		});

		newSocket.on("connect", () => {

		});

		newSocket.on("disconnect", () => {

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
				// if (key === " " && !activatePowerUp.current) {
				// 	toast.info("Sorry, you cannot use the power-up right now. It is on cooldown for the next 10 seconds since you've recently used it");
				// 	return
				// }
				// else if (key === " ")
				// 	toast.success("Power-up activated! You can now use the power-up for the next 5 seconds");
				keyState[key] = true;
				// activatePowerUp.current = false;
				const id = setTimeout(() => {
					activatePowerUp.current = true;
					clearTimeout(id);
				}, 10000);
				socket?.emit("keyPressed", { key, userId: user?.id });
			}
		};

		const handleKeyUp = (event: KeyboardEvent) => {
			const { key } = event;
			if (Object.values(Keys).includes(key as Keys)) {
				keyState[key] = false;

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
	}

	return (
		<GameContext.Provider value={gameContextValue}>
			{children}
		</GameContext.Provider>
	);
}
