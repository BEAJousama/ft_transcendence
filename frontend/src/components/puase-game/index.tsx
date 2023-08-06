"use client"

import IUser from "@/interfaces/user";
import { ReactNode, useEffect } from "react";
import { Socket } from "socket.io-client";
import { twMerge } from "tailwind-merge";
import Modal from "../modal";
import { Button } from "..";

const PauseGame = ({
    setShowModal,
    timer,
    intervalId,
    isInGame,
    socket,
    user,
    setTimer,
    title,
    icon,
    onAccept,
    onReject,
    accept,
    reject,
    showReject
}: {
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
    timer: number;
    setTimer: React.Dispatch<React.SetStateAction<number>>;
    intervalId: React.MutableRefObject<NodeJS.Timer | undefined>;
    isInGame: React.MutableRefObject<boolean>;
    socket: Socket | null;
    user: IUser | undefined;
    onAccept?: () => void;
    onReject?: () => void;
    icon: ReactNode;
    title: string;
    accept?: string;
    reject?: string;
    showReject?: boolean;
    className?: string
    danger?: boolean;
}) => {
    useEffect(() => {
        intervalId.current = setInterval(() => {
            setTimer((prev: number) => {
                if (prev === 0) {
                    clearInterval(intervalId.current);
                    setShowModal(false);
                    isInGame.current = false;
                    socket?.emit("leave-game", {
                        userId: user?.id,
                    })
                    return 250;
                }
                return prev - 1;
            });
        }, 1000);
        return () => {
            clearInterval(intervalId.current);
        };
    }, [setShowModal, isInGame, socket, user]);

    return (
        <Modal className={twMerge("!w-[50%] !max-w-md relative")}>
            <div className="text-xl absolute top-2 right-3 rounded-md">
                {timer}
            </div>
            {icon}
            <div className="max-w-xs text-center text-2xl">
                {title}
            </div>
            <Button onClick={onAccept}>
                {accept}
            </Button>
            {showReject && (<Button
                variant="text"
                className="!hover:bg-inherit !bg-inherit text-primary-500"
                onClick={onReject}
            >
                {reject}
            </Button>)}
        </Modal>
    )
}

export default PauseGame;