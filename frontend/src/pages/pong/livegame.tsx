import { useContext, useEffect } from "react";
import { Canvas } from "../../components";
import Layout from "../layout";
import { GameContext } from "../../context/game.context";
import { useParams } from "react-router-dom";
import { Ball, Player } from "../../interfaces/game";
import { ScoreBoard } from ".";

export default function LivePong() {
    const { id: gameId } = useParams();
    const {
        socket,
        setPlayerA,
        playerA,
        playerB,
        setPlayerB,
        setBall
    } = useContext(GameContext);

    useEffect(() => {
        if (!socket) return;

        const id = setInterval(() => {
            socket?.emit("update", {
                userId: parseInt(gameId as string),
                playerCanvas: {
                    width: 650,
                    height: 480,
                },
            });
        }, 25);

        socket?.on("update", (data: Ball) => {

            setBall((prev) => {

                return {
                    ...prev,
                    ...data,
                }
            });
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

        socket?.on("game-over", (data: { winner: number }) => {

        });

        socket?.on("disconnect", () => clearInterval(id));

        return () => clearInterval(id);
    }, [socket, gameId, setPlayerA, setPlayerB, setBall]);

    return (
        <Layout className="!py-4 h-full flex flex-col items-center justify-around">
            <div className="flex w-full items-center justify-between max-w-[1024px]">
                <ScoreBoard {...playerA} />
                <ScoreBoard {...playerB} />
            </div>
            <Canvas />
        </Layout>
    )
}