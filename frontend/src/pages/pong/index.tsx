import { Avatar, Button, Card, ConfirmationModal, Divider, GameBanner, Input, JoinGameCard, Sidepanel, Spinner } from "../../components";
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
				className="!md:h-20 !md:w-20"
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
	const { socket } = useContext(GameContext);
	const { user } = useContext(AppContext);
	const [widthScaleFactor, setWidthScaleFactor] = useState<number>((window.innerWidth * 0.8) / 650)
	const [heightScaleFactor, setHeightScaleFactor] = useState<number>((window.innerHeight * 0.4) / 480)

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [ref, { width: canvasWidth, height: canvasHeight }] =
		useMeasure<HTMLDivElement>();

	useEffect(() => {
		// const widthScaleFactor = (window.innerWidth * 0.8) / 650;
		// const heightScaleFactor = (window.innerHeight * 0.4) / 480;
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

		socket?.on("game-over", (data: { winner: number }) => {
			setShow(false);
			setWinnerId(data.winner);
		});

		socket?.on("disconnect", () => clearInterval(id));

		return () => clearInterval(id);
	}, []);


	useEffect(() => {
		// (window.innerWidth * 0.8) / 650
		// 	(window.innerHeight * 0.4) / 480

		const canvas = canvasRef.current;
		if (!canvas) return
		setWidthScaleFactor(canvas.width / 650)
		setHeightScaleFactor(canvas.height / 480)
		console.log(canvasHeight, canvasWidth)
	}, [canvasHeight, canvasWidth]);

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
					// playerB.x,
					canvas.width - playerB.width,
					playerB.y,
					playerB.width,
					playerB.height,
					[5, 0, 0, 5]
				);
			};

			renderGame();
		}
	}, [playerA, playerB, ball, canvasHeight, canvasWidth, widthScaleFactor, heightScaleFactor]);

	return (
		<div ref={ref} className="flex w-full items-center justify-center">
			<canvas
				ref={canvasRef}
				width={window.innerWidth * 0.8}
				height={window.innerHeight * 0.4}
				className="rounded-lg bg-secondary-800 transform rotate-90 md:rotate-0"
			/>
		</div>
	);
};

const RadioCheck = ({ options, label, htmlFor }: {
	label?: string;
	htmlFor?: string
	options: string[]
}) => {
	return (
		<div className="flex flex-col gap-2 w-full items-center pt-2">
			<div className="text-white">{label}</div>
			<ul>
				{options.map((option: string) => {
					return (
						<div className="flex items-center">
							<input checked id={htmlFor} type="radio" value="" name={htmlFor} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300ring-offset-gray-800 focus:ring-2 " />
							<label htmlFor={htmlFor} className="ml-2 text-sm font-medium ">{option}</label>
						</div>
					)
				})}
			</ul>
		</div>
	)
}

const InviteFriend = () => {
	return (
		<Card className="text-white flex flex-col gap-4 items-center divide-y text-gray-400 !md:max-w-lg  bg-gradient-to-tr from-secondary-500 to-secondary-800">
			<h1 className="text-xl text-center text-white">Invite Your Friends to Play</h1>
			<RadioCheck htmlFor="gamemode" label="Select Game Mode" options={["Normal Mode", "Ranked Mode", "survival Mode"]} />
			<RadioCheck htmlFor="gameoption" label="Select Game Options" options={["Classic", "Power Ups"]} />
		</Card>
	)
}

export default function Pong() {

	const [show, setShow] = useState<boolean>(false);
	const [showLoading, setShowLoading] = useState<boolean>(false);
	const [winnerId, setWinnerId] = useState<number>(0);
	const { socket, playerA,
		setPlayerA,
		playerB,
		setPlayerB,
		ball,
		setBall, } = useContext(GameContext);
	const { user } = useContext(AppContext)

	useEffect(() => {
		if (!socket) return;
		socket.on("init-game", () => {
			setShow(true);
		});
	}, [socket]);

	return (
		<Layout className="grid place-items-center gap-8 p-4">
			{!show ? (
				<div className="grid lg:grid-cols-2 grid-rows-1 place-items-center w-full max-w-[1024px] gap-8">
					<Card className="text-white flex flex-col gap-4 items-center text-gray-400 w-full !max-w-md  bg-gradient-to-tr from-secondary-500 to-secondary-800">
						<h1 className="text-xl text-center text-white">Invite Your Friends to Play</h1>
						<RadioCheck htmlFor="gamemode" label="Select Game Mode" options={["Normal Mode", "Ranked Mode", "survival Mode"]} />
						<RadioCheck htmlFor="gameoption" label="Select Game Options" options={["Classic", "Power Ups"]} />
						<Button className="px-16" disabled={show}>
							Invite
						</Button>
					</Card>
					<Card className="text-white flex flex-col gap-4 items-center text-gray-400 w-full !max-w-md  bg-gradient-to-tr from-secondary-500 to-secondary-800">
						<h1 className="text-xl text-center text-white">Play Against Ai</h1>
						<img src="/img/3839218-removebg-preview.png" alt="" width={200} />
						<Button className="px-16" disabled={show} onClick={() => {
							socket?.emit("play-with-ai", {
								userId: user?.id,
							})
						}}>
							Play Now
						</Button>
					</Card>
					<Card className="text-white relative overflow-hidden flex flex-col gap-4 items-center text-gray-400 w-full !max-w-md  bg-gradient-to-tr from-secondary-500 to-secondary-800">
						<h1 className="text-xl text-center text-white">Play Against Random Users</h1>
						<RadioCheck htmlFor="gamemode" label="Select Game Mode" options={["Normal Mode", "Ranked Mode", "survival Mode"]} />
						<RadioCheck htmlFor="gameoption" label="Select Game Options" options={["Classic", "Power Ups"]} />
						<Button className="px-16" onClick={() => {
							socket?.emit("join-queue", {
								userId: user?.id,
							})
							// setShow(true)
							setShowLoading(true)
						}}>
							Join The Queue
						</Button>
						{
							showLoading && (
								<>
									<div className="absolute inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm"></div>
									<div role="status" className="absolute -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2
             grid place-items-center gap-4">
										<Spinner />
										<p className="text-white">Waiting for opponent</p>
										<Button onClick={() => {
											socket?.emit("leave-queue", {
												userId: user?.id,
											})
											setShow(false)
										}}>
											Cancel
										</Button>
									</div>
								</>
							)
						}
					</Card>
					<Card className="text-white h-full max-h-[350px] overflow-auto scrollbar-hide flex flex-col gap-4 items-center text-gray-400 w-full !max-w-md  bg-gradient-to-tr from-secondary-500 to-secondary-800">
						<h1 className="text-xl text-center text-white">Watch Live Games</h1>

					</Card>
				</div>) : (
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
			)}
		</Layout>
	);
}
