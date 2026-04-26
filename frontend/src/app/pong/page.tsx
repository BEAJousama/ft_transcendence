"use client";

import { Button, ConfirmationModal, ScoreBoard } from "@/components";
import React, { useContext, useEffect, useState } from "react";
import { GameContext } from "../../context/game.context";
import Layout from "../layout/index";
import { AppContext } from "../../context/app.context";
import Modal from "../../components/modal";
import { AlertTriangle } from "lucide-react";
import { SocketContext } from "../../context/socket.context";
import GameCards from "./game-cards";
import { toast } from "react-toastify";
import PongGame from "./pong";

export default function Pong() {
	const [show, setShow] = useState<boolean>(false);
	const [winnerId, setWinnerId] = useState<number>(0);
	const [showModal, setShowModal] = useState<boolean>(false);
	const [showInvitaionModal, setShowInvitaionModal] = useState<boolean>(false);
	const [gameData, setGameData] = useState<any>();

	const { socket, playerA, setPlayerA, playerB, setPlayerB, ball, setBall, isInGame } =
		useContext(GameContext);
	const { user } = useContext(AppContext);
	const notificationSocket = useContext(SocketContext);

	useEffect(() => {
		if (!socket) return;
		socket.on("init-game", () => {
			setShow(true);
			setShowInvitaionModal(false);
		});

		socket.emit("check-for-active-invitations", { userId: user?.id });

		socket.on("error", (data: string) => {
			toast.error(data);
		});

		socket.on("check-for-active-invitations", (data) => {
			setShowInvitaionModal(!!data);
			setGameData(data);
		});

		notificationSocket?.on("check-for-active-invitations", (data) => {
			setShowInvitaionModal(!!data);
			setGameData(data);
		});

		socket.emit("is-already-in-game", { userId: user?.id });
		socket.on("is-already-in-game", (data) => setShowModal(data as boolean));

		socket.on("disconnect", () => {
			setShow(false);
			isInGame.current = false;
		});

		const handleUnload = () => {
			socket?.emit("leave-game", { userId: user?.id });
			socket?.emit("cancel-invite", { inviterId: user?.id });
			socket?.emit("leave-queue", { userId: user?.id });
		};

		window.addEventListener("unload", handleUnload);
		return () => {
			window.removeEventListener("unload", handleUnload);
		};
	}, [socket]);

	useEffect(() => {
		if (winnerId === 0) return;
		if (winnerId === user?.id) toast.success("You won the game");
		else toast.error("You lost the game");
		setWinnerId(0);
	}, [winnerId]);

	return (
		<Layout
			className="flex min-h-full flex-col items-center justify-center gap-6 !py-2"
			onContextMenu={(e) => e.preventDefault()}
		>
			{!show ? (
				<div className="flex min-h-[82vh] w-full flex-col items-center justify-center gap-6">
					<div className="ui-page-header mb-1 w-full max-w-4xl justify-between">
						<div>
							<p className="ui-label">Playground</p>
							<h1 className="text-lg font-semibold text-secondary-50 tracking-tight md:text-2xl">Pong Arena</h1>
						</div>
						<div className="ui-badge">Live modes</div>
					</div>
					<div className="flex w-full items-center justify-center">
						<GameCards />
					</div>
				</div>
			) : null}
			{showInvitaionModal && (
				<Modal className="flex w-full max-w-2xl flex-col items-center justify-between gap-5 rounded-2xl border border-white/[0.06] bg-secondary-700 p-5">
					<h1 className="text-secondary-50 text-lg font-semibold md:text-2xl tracking-tight">You have an invitation</h1>
					<div className="flex w-full flex-wrap items-center justify-around gap-3">
						<ScoreBoard id={gameData?.inviterId} />
						<div className="rounded-full border border-white/[0.06] bg-secondary-800 px-3.5 py-1.5 text-lg font-semibold text-primary-400">
							VS
						</div>
						<ScoreBoard id={gameData?.invitedFriendId} />
					</div>
					<div className="flex w-full items-center justify-around gap-4">
						<Button
							className="w-full"
							onClick={() => {
								socket?.emit("accept-invitation", { invitedFriendId: user?.id });
								setShowInvitaionModal(false);
							}}
						>
							Accept
						</Button>
						<Button
							type="secondary"
							className="w-full"
							onClick={() => {
								setShowInvitaionModal(false);
								socket?.emit("reject-invitation", { inviterId: gameData?.inviterId });
							}}
						>
							Reject
						</Button>
					</div>
				</Modal>
			)}
			{show ? (
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
			) : null}
			{showModal && (
				<ConfirmationModal
					icon={<AlertTriangle size={100} />}
					title="You are already in a game"
					accept="Ok"
					onAccept={() => {
						setShow(true);
						setShowModal(false);
					}}
				/>
			)}
		</Layout>
	);
}
