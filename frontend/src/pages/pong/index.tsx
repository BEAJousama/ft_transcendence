import { Sidepanel } from "../../components";
import { useMeasure } from "react-use";
import React, { useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from "../../context/game.context";
import Layout from "../layout";
import { EnumType } from "typescript";
import { AppContext } from "../../context/app.context";

interface Canvas {
	width: number;
	height: number;
}

interface Ball {
	x: number;
	y: number;
	speed: number;
	velocity: {
		x: number;
		y: number;
	};
}

interface Player {
	id: number;
	x: number;
	y: number;
	width: number;
	height: number;
	canvas: Canvas;
	ball: Ball;
	score: number;
	speed: number;
}

interface Game {
	playerA: Player;
	playerB: Player;
	ball: Ball;
}

const PongGame: React.FC = () => {
	const socket = useContext(SocketContext);
	const { user } = useContext(AppContext);

	const [playerA, setPlayerA] = useState<Player>({
		id: 0,
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		canvas: {
			width: 0,
			height: 0,
		},
		ball: {
			x: 0,
			y: 0,
			speed: 0,
			velocity: {
				x: 0,
				y: 0,
			},
		},
		score: 0,
		speed: 0,
	});

	const [playerB, setPlayerB] = useState<Player>({
		id: 0,
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		canvas: {
			width: 0,
			height: 0,
		},
		ball: {
			x: 0,
			y: 0,
			speed: 0,
			velocity: {
				x: 0,
				y: 0,
			},
		},
		score: 0,
		speed: 0,
	});
	const [ball, setBall] = useState<Ball>({
		x: 0,
		y: 0,
		speed: 0,
		velocity: {
			x: 0,
			y: 0,
		},
	});

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [gameInitialized, setGameInitialized] = useState(false);
	const [ref, { width: canvasWidth, height: canvasHeight }] =
		useMeasure<HTMLDivElement>();

	useEffect(() => {
		if (canvasWidth == 0 && playerA.width === 0) return;
		else if (!gameInitialized) {
			socket?.emit("init", {
				userId: user?.id,
				playerCanvas: {
					width: 650,
					height: 480,
				},
			});
			socket?.on("init", (data: Game) => {
				// console.log(data);
				setPlayerA(data.playerA);
				if (data.playerB) {
					setGameInitialized(true);
					setPlayerB(data.playerB);
				}
			});

			const interval = setInterval(() => {
				socket?.emit("update", {
					userId: user?.id,
					playerCanvas: {
						width: 650,
						height: 480,
					},
				});
			}, 20);

			socket?.on("update", (data: Game) => {
				const { playerA, playerB, ball } = data;
				// console.log(playerA, playerB);
				// const playerMe = playerA.id === user?.id ? playerA : playerB;
				// const playerOpponent =
				// 	playerA.id === user?.id ? playerB : playerA;
				// setPlayerA(playerMe);
				// setPlayerB(playerOpponent);
				setPlayerA(playerA);
				setPlayerB(playerB);
				setBall(ball);
			});

			return () => {
				clearInterval(interval);
			};
		}
	}, [canvasWidth, canvasHeight]);

	useEffect(() => {
		const canvas = canvasRef.current;
		const context = canvas?.getContext("2d");
		if (canvas && context) {
			const clearCanvas = () => {
				context.fillStyle = "#0F1019";
				context.fillRect(0, 0, canvas.width, canvas.height);
			};

			const drawRect = (x: number, y: number, w: number, h: number) => {
				context.fillStyle = "#E5AC7C";
				context.beginPath();
				context.roundRect(x, y, w, h, 5);
				context.closePath();
				context.fill();
			};

			const drawBall = (x: number, y: number) => {
				context.fillStyle = "white";
				context.beginPath();
				context.arc(x, y, 10, 0, Math.PI * 2);
				context.closePath();
				context.fill();
			};

			const renderGame = () => {
				clearCanvas();
				drawRect(playerA.x, playerA.y, playerA.width, playerA.height);
				for (let i = 0; i < canvas.height;) {
					drawRect(canvas.width / 2 - 1, i, 2, 8);
					i += 12;
				}
				drawBall(ball.x, ball.y);
				drawRect(playerB.x, playerB.y, playerB.width, playerB.height);
			};

			renderGame();
		}
	}, [playerA, playerB]);

	return (
		<div
			ref={ref}
			className="flex h-full w-full items-center  justify-center"
		>
			<canvas
				ref={canvasRef}
				width={650}
				height={480}
				className="rounded-lg bg-secondary-800"
			/>
		</div>
	);
};

export default function Pong() {
	// const [ref, { width, height }] = useMeasure<HTMLDivElement>();
	return (
		<Layout className="flex items-center justify-center p-4">
			<PongGame />
		</Layout>
	);
}
