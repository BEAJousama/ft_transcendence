"use client";

import {
  Avatar,
  Button,
  Card,
  Input,
  Spinner,
  Canvas,
  UserBanner,
  ConfirmationModal,
  Carousel,
  ScoreBoard,
  PauseGame,
} from "@/components";
import React, {
  ReactNode,
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
import useSWR from "swr";
import IUser from "../../interfaces/user";
import { Socket } from "socket.io-client";
import { twMerge } from "tailwind-merge";
import Image from "next/image";
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
    <Layout className="grid place-items-center gap-8 !py-2">
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
