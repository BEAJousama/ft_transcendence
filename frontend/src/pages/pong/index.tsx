import { Sidepanel } from "../../components";
import { useMeasure } from "react-use";
import React, { useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from "../../context/game.context";
import Layout from "../layout";
import { EnumType } from "typescript";
import { AppContext } from "../../context/app.context";

interface Ball {
	x: number;
	y: number;
}

interface Player {
	x: number;
	y: number;
	width: number;
	height: number;
	score: number;
}

interface Game {
	canvas: any;
	ball: Ball;
	player: Player;
	opponent: Player;
}

const PongGame: React.FC = () => {
	const socket = useContext(SocketContext);

	const [ball, setBall] = useState<Ball>({
		x: 0,
		y: 0,
	});
	const [player, setPlayer] = useState<Player>({
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		score: 0,
	});
	const [opponent, setOpponent] = useState<Player>({
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		score: 0,
	});

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [gameInitialized, setGameInitialized] = useState(false);
	const [ref, { width: canvasWidth, height: canvasHeight }] =
		useMeasure<HTMLDivElement>();

	useEffect(() => {
		if (canvasWidth == 0 && ball.x == 0) return;
		else if (gameInitialized == false) {
			setGameInitialized(true);
			socket?.emit("init", {
				canvasWidth: canvasWidth * 0.8,
				canvasHeight: canvasHeight * 0.8,
			});
			socket?.on("init", (data: Game) => {
				console.log(data);
				setBall(data.ball);
				setPlayer(data.player);
				setOpponent(data.opponent);
			});
			const interval = setInterval(() => {
				socket?.emit("update");
			}, 20);

			socket?.on("update", (data: Game) => {
				const { ball, player, opponent } = data;
				setBall(ball);
				setPlayer(player);
				setOpponent(opponent);
			});

			return () => {
				clearInterval(interval);
			};
		} else {
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
				context.arc(x, y, 15, 0, Math.PI * 2);
				context.closePath();
				context.fill();
			};

			const renderGame = () => {
				clearCanvas();
				drawRect(player.x, player.y, player.width, player.height);
				for (let i = 0; i < canvas.height; ) {
					drawRect(canvas.width / 2 - 1, i, 2, 8);
					i += 12;
				}
				drawBall(ball.x, ball.y);
				drawRect(
					opponent.x,
					opponent.y,
					opponent.width,
					opponent.height
				);
			};

			renderGame();
		}
	}, [player, opponent, ball]);

	return (
		<div
			ref={ref}
			className="flex h-full w-full items-center  justify-center"
		>
			<canvas
				ref={canvasRef}
				width={canvasWidth * 0.8}
				height={canvasHeight * 0.8}
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
