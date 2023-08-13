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
import Layout from "../layout/index";
import { AppContext, fetcher } from "../../context/app.context";
import Modal from "../../components/modal";
import { AlertTriangle } from 'lucide-react';
import { Player, Ball } from "../../interfaces/game";
import { SocketContext } from "../../context/socket.context";
import GameCards from "./game-cards";
import { toast } from "react-toastify";


interface TimeDifferenceProps {
    time: Date;
}

const TimeDifference: React.FC<TimeDifferenceProps> = ({ time }) => {
    const [timeDiff, setTimeDiff] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            const currentTime = new Date();
            const diff = time.getTime() - currentTime.getTime();

            if (diff <= 0) {
                // If the countdown has reached or passed the target time, stop the interval
                clearInterval(interval);
                toast.info("Time's up!");
            } else {
                const minutes = Math.floor(diff / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);
                setTimeDiff(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [time]);

    return (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
            {timeDiff}
        </div>
    );
};

export default TimeDifference;