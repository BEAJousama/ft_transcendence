import { useContext, useEffect, useState } from "react";
import { GameContext } from "../../context/game.context";
import Button from "../button";
import Card from "../card";
import Spinner from "../spinner";
import { AppContext } from "../../context/app.context";

const JoinGameCard = () => {
    const [show, setShow] = useState<boolean>(false)
    const { socket } = useContext(GameContext)
    const { user } = useContext(AppContext)

    useEffect(() => {
        socket?.on("joined", (data) => {
            console.log("joined", data)
        })
        socket?.on("left", (data) => {
            console.log("left", data)
        })
    }, [])

    return (
        <Card
            className="flex w-full !max-w-md flex-col items-center
              justify-center bg-gradient-to-tr from-secondary-500 to-secondary-800 text-white relative overflow-hidden"
        >
            <p>Join A Game</p>
            <p>Let The Fun Begin</p>
            <img src="/img/3839218-removebg-preview.png" alt="" width={280} />
            <Button className="w-full justify-center" onClick={() => {
                socket?.emit("play-with-ai", {
                    userId: user?.id,
                })
                // socket?.emit("join-queue", {
                //     userId: user?.id,
                // })
                setShow(true)
            }}>Play Now</Button>
        </Card>
    );
};

export default JoinGameCard