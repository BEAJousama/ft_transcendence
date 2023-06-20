import { Avatar, Button, ConfirmationModal, JoinGameCard, Sidepanel } from "../../components";
import { useMeasure } from "react-use";
import React, { useContext, useEffect, useRef, useState } from "react";
import { GameContext } from "../../context/game.context";
import Layout from "../layout";
import { AppContext, fetcher } from "../../context/app.context";
import useSwr from "swr";
import Modal from "../../components/modal";

// interface Canvas {
// 	width: number;
// 	height: number;
// }

interface Ball {
	x: number;
	y: number;
	speed: number;
	radius: number;
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
	score: number;
}

interface Game {
	playerA: Player;
	playerB: Player;
	ball: Ball;
}

const ScoreBoard = ({ id, score }: { id: number; score: number }) => {
	const { data: user } = useSwr(`api/users/${id}`, fetcher);
	return (
		<div className="flex flex-col items-center gap-2 text-lg text-white">
			<Avatar
				src={user?.avatar || "/img/default.jpg"}
				alt="logo"
				className="!h-20 !w-20"
			/>
			<span>{score}</span>
		</div>
	);
};

const PongGame = ({
	playerA,
	setPlayerA,
	playerB,
	setPlayerB,
	ball,
	setBall,
	setShow,
	setWinnerId,
}: {
	playerA: Player;
	setPlayerA: React.Dispatch<React.SetStateAction<Player>>;
	playerB: Player;
	setPlayerB: React.Dispatch<React.SetStateAction<Player>>;
	ball: Ball;
	setBall: React.Dispatch<React.SetStateAction<Ball>>;
	setShow: React.Dispatch<React.SetStateAction<boolean>>;
	setWinnerId: React.Dispatch<React.SetStateAction<number>>;
}) => {
	const socket = useContext(GameContext);
	const { user } = useContext(AppContext);



	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [ref, { width: canvasWidth, height: canvasHeight }] =
		useMeasure<HTMLDivElement>();

	useEffect(() => {
		const widthScaleFactor = 450 / 650;
		const heightScaleFactor = 280 / 480;
		const id = setInterval(() => {
			socket?.emit("update", {
				userId: user?.id,
				playerCanvas: {
					width: 650,
					height: 480,
				},
			});
		}, 25);

		socket?.on("update", (data: any) => {
			// Update the ball position with the scaled values
			setBall((prev) => {
				const scaledBall = {
					x: data.x * widthScaleFactor,
					y: data.y * heightScaleFactor,
					radius: data.radius * Math.min(widthScaleFactor, heightScaleFactor),
				};
				return {
					...prev,
					...scaledBall,
				}
			});
		});

		socket?.on("update-player-a", (data: any) => {
			// Convert the received positions and dimensions to frontend coordinates


			// Update player A position with the scaled values
			setPlayerA((prev) => {
				const scaledData = {
					...data,
					x: data.x * widthScaleFactor,
					y: data.y * heightScaleFactor,
					width: data.width * widthScaleFactor,
					height: data.height * heightScaleFactor,
				};
				return { ...prev, ...scaledData };
			});
		});

		socket?.on("update-player-b", (data: any) => {
			// Convert the received positions and dimensions to frontend coordinates


			// Update player B position with the scaled values
			setPlayerB((prev) => {
				const scaledData = {
					...data,
					x: data.x * widthScaleFactor,
					y: data.y * heightScaleFactor,
					width: data.width * widthScaleFactor,
					height: data.height * heightScaleFactor,
				};
				return { ...prev, ...scaledData };
			});
		});

		// socket?.on("update", (data: any) => {
		// 	data.x =
		// 		data.y =
		// 		setBall(data);
		// });
		// socket?.on(
		// 	"update-player-a",
		// 	(data: any) => {
		// 		// (data: { x: number; y: number; score: number }) => {
		// 		setPlayerA((prev) => {
		// 			return { ...prev, ...data };
		// 		});
		// 	}
		// );
		// socket?.on(
		// 	"update-player-b",
		// 	// (data: { x: number; y: number; score: number }) => {
		// 	(data: any) => {
		// 		setPlayerB((prev) => {
		// 			return { ...prev, ...data };
		// 		});
		// 	}
		// );

		socket?.on("game-over", (data: { winner: number }) => {
			//setShow(false)
			setShow(false);
			setWinnerId(data.winner);
		});


		socket?.on("disconnect", () => clearInterval(id));

		return () => clearInterval(id);
	}, [canvasWidth, canvasHeight]);


	// function rotateCanvas() {
	// 	const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	// 	const canvas = canvasRef.current;
	// 	const context = canvas?.getContext("2d");

	// 	if (isMobile && canvas && context) {
	// 		canvas.style.transform = 'rotate(90deg)';
	// 		canvas.width = window.innerHeight;
	// 		canvas.height = window.innerWidth;
	// 		context.translate(canvas.height, 0);
	// 		context.rotate(Math.PI / 2);
	// 	} else {
	// 		// if (canvas && context) {

	// 		// 	canvas.style.transform = 'none';
	// 		// 	canvas.width = 500; // Set your desired width
	// 		// 	canvas.height = 500; // Set your desired height
	// 		// 	context.setTransform(1, 0, 0, 1, 0, 0);
	// 		// }
	// 	}

	// 	// Your drawing code goes here
	// }

	useEffect(() => {
		const canvas = canvasRef.current;
		const context = canvas?.getContext("2d");
		if (canvas && context) {

			const clearCanvas = () => {
				context.fillStyle = "#0F1019";
				context.fillRect(0, 0, canvas.width, canvas.height);
			};

			const drawRect = (
				x: number,
				y: number,
				w: number,
				h: number,
				r: number[] | number
			) => {
				context.fillStyle = "#E5AC7C";
				context.beginPath();
				context.roundRect(x, y, w, h, r);
				context.closePath();
				context.fill();
			};

			const drawBall = (x: number, y: number, raduis: number) => {
				context.fillStyle = "white";
				context.beginPath();
				context.arc(x, y, raduis, 0, Math.PI * 2);
				context.closePath();
				context.fill();
			};

			const renderGame = () => {
				clearCanvas();
				for (let i = 0; i < canvas.height;) {
					drawRect(canvas.width / 2 - 1, i, 2, 8, 5);
					i += 12;
				}
				drawBall(ball.x, ball.y, ball.radius);
				drawRect(
					playerA.x,
					playerA.y,
					playerA.width,
					playerA.height,
					[0, 5, 5, 0]
				);
				drawRect(
					playerB.x,
					playerB.y,
					playerB.width,
					playerB.height,
					[5, 0, 0, 5]
				);
			};

			renderGame();
		}
	}, [playerA, playerB, ball]);

	return (
		<div ref={ref} className="flex w-full items-center  justify-center">
			<canvas
				ref={canvasRef}
				width={450}
				height={280}
				className="rounded-lg bg-secondary-800 transform rotate-90"
			/>
		</div>
	);
};

export default function Pong() {
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
		speed: 0,
		radius: 10,
		velocity: {
			x: 0,
			y: 0,
		},
	});

	const [show, setShow] = useState<boolean>(false);
	const [winnerId, setWinnerId] = useState<number>(0);
	const socket = useContext(GameContext);

	useEffect(() => {
		if (!socket) return;
		socket.on("init-game", () => {
			setShow(true);
			console.log("starting the fucking game : => ");
		});
	}, [socket]);

	return (
		<Layout className="flex flex-col items-center justify-center gap-8 p-4">
			{!show && winnerId === 0 ? (
				<JoinGameCard />
			) : winnerId !== 0 ? (
				<>
					<Modal>
						<ScoreBoard id={winnerId} score={7} />
						<Button onClick={() => {
							setWinnerId(0)
						}}>
							close
						</Button>
					</Modal>
				</>
			) : (
				<>
					<div className="flex w-full max-w-[650px] items-center justify-between">
						<ScoreBoard id={playerA.id} score={playerA.score} />
						<ScoreBoard id={playerB.id} score={playerB.score} />
					</div>
					<PongGame
						playerA={playerA}
						setPlayerA={setPlayerA}
						playerB={playerB}
						setPlayerB={setPlayerB}
						ball={ball}
						setBall={setBall}
						setShow={setShow}
						setWinnerId={setWinnerId}
					/>
				</>
			)}
		</Layout>
	);
}
