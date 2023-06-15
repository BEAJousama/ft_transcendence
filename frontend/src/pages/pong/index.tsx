import { Sidepanel } from "../../components";
import { useMeasure } from "react-use";
import React, { useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from "../../context/game.context";

interface Ball {
	x: number;
	y: number;
}

interface Player {
	x: number;
	y: number;
	score: number;
}

const PongGame: React.FC = () => {
	const socket = useContext(SocketContext);

	const [ball, setBall] = useState<Ball>({
		x: 0,
		y: 0,
	});
	const [player1, setPlayer1] = useState<Player>({
		x: 0,
		y: 0,
		score: 0,
	});
	const [player2, setPlayer2] = useState<Player>({
		x: 0,
		y: 0,
		score: 0,
	});

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const canvasWidth = window.innerWidth * 0.7;
	const canvasHeight = window.innerHeight * 0.7;

	useEffect(() => {
		socket?.emit("init", { width: canvasWidth, height: canvasHeight });
		socket?.on("init", (data: any) => {
			console.log(data);
			const { ball, player1, player2 } = data;
			setPlayer1(player1);
			setPlayer2(player2);
			setBall(ball);
		});

		const keys = {
			w: false,
			s: false,
			up: false,
			down: false,
			reset() {
				this.w = false;
				this.s = false;
				this.up = false;
				this.down = false;
			},
		};

		document.addEventListener(
			"keydown",
			(event) => {
				console.log("clicked");
				keys.reset();
				var name = event.key;
				if (name === "w") keys.w = true;
				else if (name === "s") keys.s = true;
				if (name === "ArrowUp") keys.up = true;
				else if (name === "ArrowDown") keys.down = true;
				socket?.emit("update", keys);
				keys.reset();
			},
			false
		);

		const interval = setInterval(() => {
			socket?.emit("update", keys);
		}, 20);

		socket?.on("update", (data: any) => {
			const { ball, player1, player2 } = data;
			setPlayer1(player1);
			setPlayer2(player2);
			setBall(ball);
		});

		return () => {
			clearInterval(interval);
		};
	}, [socket]);

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

			const putText = (text: string, x: number, y: number) => {
				context.fillStyle = "black";
				context.font = "25px fantasy";
				context.fillText(text, x, y);
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
				drawRect(player1.x, player1.y, 40, 100);
				for (let i = 0; i < canvas.height; ) {
					drawRect(canvas.width / 2 - 1, i, 2, 8);
					i += 12;
				}
				drawBall(ball.x, ball.y);
				drawRect(player2.x, player2.y, 40, 100);
			};

			renderGame();
		}
	}, [player1, player2, ball]);

	return (
		<div>
			<canvas
				ref={canvasRef}
				width={canvasWidth}
				height={canvasHeight}
				className="rounded-lg bg-secondary-800"
			/>
		</div>
	);
};

export default function Pong() {
	const [ref, { width, height }] = useMeasure<HTMLDivElement>();
	return (
		<div
			className="relative grid h-screen grid-cols-9 bg-secondary-700 lg:grid-cols-7"
			ref={ref}
		>
			<Sidepanel className=" col-span-2 lg:col-span-1" />
			<div className="col-span-7 flex items-center  justify-center lg:col-span-6">
				<PongGame />
			</div>
		</div>
	);
}
