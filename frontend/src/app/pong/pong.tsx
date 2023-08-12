"use client";

import {
    Button,
    Spinner,
    Canvas,
    ConfirmationModal,
    ScoreBoard,
    PauseGame,
} from "@/components";
import React, {
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { GameContext } from "../../context/game.context";
import { AppContext } from "../../context/app.context";
import Modal from "../../components/modal";
import { AlertTriangle } from 'lucide-react';
import { Player, Ball } from "../../interfaces/game";
import TimeDifference from "./time-difference";


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
    const {
        socket,
        isInGame,
        show,
        setShow: setShowModal,
    } = useContext(GameContext);
    const { user } = useContext(AppContext);
    const [showPausedModal, setShowPausedModal] = useState<boolean>(false);
    const [showstartingModal, setshowStartingModal] = useState<number>(5);
    const time = useRef<Date | null>(null);

    useEffect(() => {
        isInGame.current = true;

        socket?.on("update", (data: Ball) => {
            // Update the ball position with the scaled values
            setShowPausedModal(false);
            setBall((prev) => {
                return {
                    ...prev,
                    ...data,
                };
            });
        });

        socket?.on("update-time", (data: string) => {
            if (data && !time.current)
                time.current = new Date(data);
        });

        socket?.on("update-player-a", (data: Player) => {
            setPlayerA((prev) => {
                return { ...prev, ...data };
            });
        });

        socket?.on("update-player-b", (data: Player) => {
            setPlayerB((prev) => {
                return { ...prev, ...data };
            });
        });

        socket?.on("game-paused", () => {
            setShowPausedModal(true);
        });

        socket?.on("game-over", (data: { winner: number }) => {
            setShow(false);
            setWinnerId(data.winner);
            isInGame.current = false;
            setShowModal(false);
        });

        const intervalId = setInterval(() => {
            setshowStartingModal((prev) => {
                if (prev === 0) {
                    clearInterval(intervalId);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, [socket, user?.id, setPlayerA, setPlayerB, setBall, setShow, setWinnerId]);

    const [timer, setTimer] = useState(250);
    const [pausedtimer, setPausedTimer] = useState(250);
    let intervalId = useRef<NodeJS.Timer>();

    return (
        <div className="flex h-full w-full flex-col items-center justify-around overflow-hidden pb-16 md:pb-0 relative">
            {time && time.current && <TimeDifference time={time.current} />}
            {!!showstartingModal && (
                <Modal>
                    <div className="flex w-full flex-col items-center justify-center gap-2">
                        <div className="text-white text-2xl">Game Starting in</div>
                        <div className="text-white text-2xl">{showstartingModal}</div>
                    </div>
                </Modal>
            )}
            <div className="flex w-full max-w-[1024px] items-center justify-between">
                <ScoreBoard {...playerA} />
                <ScoreBoard {...playerB} />
            </div>
            <Canvas />
            {show && (
                <PauseGame
                    title="Are you sure you want to leave the game ?"
                    icon={<AlertTriangle size={100} />}
                    setShowModal={setShowModal}
                    timer={timer}
                    intervalId={intervalId}
                    isInGame={isInGame}
                    socket={socket}
                    user={user}
                    setTimer={setTimer}
                    onAccept={() => {
                        setShowModal(false);
                        isInGame.current = false;
                        socket?.emit("leave-game", {
                            userId: user?.id,
                        });
                    }}
                    onReject={() => {
                        clearInterval(intervalId.current);
                        socket?.emit("resume-game", {
                            userId: user?.id,
                        });
                        setShowModal(false);
                    }}
                    accept="Yes, Leave"
                    reject="No, Stay"
                    showReject
                />
            )}
            {showPausedModal && !show && (
                <PauseGame
                    title="Waiting for opponent to resume the game"
                    icon={<Spinner />}
                    setShowModal={setShowModal}
                    timer={pausedtimer}
                    intervalId={intervalId}
                    isInGame={isInGame}
                    socket={socket}
                    user={user}
                    setTimer={setPausedTimer}
                    onAccept={() => {
                        setShowModal(false);
                        isInGame.current = false;
                        socket?.emit("leave-game", {
                            userId: user?.id,
                        });
                    }}
                    accept="Exit Game"
                />
            )}
        </div>
    );
};

export default PongGame;