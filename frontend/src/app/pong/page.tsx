"use client";

import {
  Button,
  ConfirmationModal,
  ScoreBoard,
} from "@/components";
import React, {
  useContext,
  useEffect,
  useState,
} from "react";
import { GameContext } from "../../context/game.context";
import Layout from "../layout/index";
import { AppContext } from "../../context/app.context";
import Modal from "../../components/modal";
import { AlertTriangle } from 'lucide-react';
import { SocketContext } from "../../context/socket.context";
import GameCards from "./game-cards";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import PongGame from "./pong";

export default function Pong() {
  const [show, setShow] = useState<boolean>(false);
  const [winnerId, setWinnerId] = useState<number>(0);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showInvitaionModal, setShowInvitaionModal] = useState<boolean>(false);
  const [gameData, setGameData] = useState<any>();

  const { socket, playerA, setPlayerA, playerB, setPlayerB, ball, setBall } =
    useContext(GameContext);
  const { user } = useContext(AppContext);
  const notificationSocket = useContext(SocketContext);

  useEffect(() => {
    if (!socket) return;
    socket.on("init-game", () => {
      setShow(true);
      setShowInvitaionModal(false);
    });

    // check for accctive anivitations
    socket.emit("check-for-active-invitations", {
      userId: user?.id,
    });

    socket.on("check-for-active-invitations", (data) => {
      console.log("data", data);
      setShowInvitaionModal(!!data);
      setGameData(data);
    });

    notificationSocket?.on("check-for-active-invitations", (data) => {
      console.log("data", data);
      setShowInvitaionModal(!!data);
      setGameData(data);
    });

    socket.emit("is-already-in-game", {
      userId: user?.id,
    });

    socket.on("is-already-in-game", (data) => {
      setShowModal(data as boolean);
    });

    // diconnect handler
    socket.on("disconnect", () => {
      setShow(false);
    });

    const handleUnload = () => {
      // Perform any additional actions when the page is refreshed
      socket?.emit("leave-game", {
        userId: user?.id,
      });
      socket?.emit("cancel-invite", {
        inviterId: user?.id,
      });
      socket?.emit("leave-queue", {
        userId: user?.id,
      });
      console.log("Refresh Accepted: Additional actions after refresh");
    };

    // window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("unload", handleUnload);

    return () => {

      // window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("unload", handleUnload);
    }

  }, [socket]);

  useEffect(() => {
    if (winnerId === 0) return;
    if (winnerId === user?.id) {
      toast.success("You won the game");
    }
    else {
      toast.error("You lost the game");
    }
    setWinnerId(0)
  }, [winnerId]);

  return (
    <Layout className="grid place-items-center gap-8 !py-2"
      onContextMenu={(e) => e.preventDefault()}
    >
      {showInvitaionModal && (
        <Modal className="flex w-full flex-col items-center justify-between gap-2">
          <h1 className="text-white md:text-2xl">You have an invitation</h1>
          <div className="flex items-center justify-around w-full">
            <ScoreBoard id={gameData?.inviterId} />
            <div className="text-lg">Vs</div>
            <ScoreBoard id={gameData?.invitedFriendId} />
          </div>
          <div className="flex items-center w-full justify-around gap-4">
            <Button
              className="w-full"
              onClick={() => {
                socket?.emit("accept-invitation", {
                  invitedFriendId: user?.id,
                });
                setShowInvitaionModal(false);
              }}
            >
              Accept
            </Button>
            <Button
              className="w-full"
              onClick={() => {
                setShowInvitaionModal(false);
                socket?.emit("reject-invitation", {
                  inviterId: gameData?.inviterId,
                });
              }}
            >
              Reject
            </Button>
          </div>
        </Modal>
      )}
      {!show ? (
        <GameCards />
      ) : (
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
