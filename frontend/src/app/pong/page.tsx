"use client"

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
import React, { ReactNode, useContext, useEffect, useRef, useState } from "react";
import { GameContext } from "../../context/game.context";
import Layout from "../layout/index";
import { AppContext, fetcher } from "../../context/app.context";
import Modal from "../../components/modal";
import { AiFillWarning } from "react-icons/ai";
import { Player, Ball } from "../../interfaces/game";
import useSWR from "swr";
import IUser from "../../interfaces/user";
import { Socket } from "socket.io-client";
import { twMerge } from "tailwind-merge";
import Image from "next/image";
import { SocketContext } from "../../context/socket.context";
import GameCards from "./game-cards";



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


  useEffect(() => {
    isInGame.current = true;

    socket?.on("update", (data: Ball) => {
      // Update the ball position with the scaled values
      setShowPausedModal(false)
      setBall((prev) => {
        return {
          ...prev,
          ...data,
        };
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
    }

  }, [socket, user?.id, setPlayerA, setPlayerB, setBall, setShow, setWinnerId]);

  const [timer, setTimer] = useState(250);
  const [pausedtimer, setPausedTimer] = useState(250);
  let intervalId = useRef<NodeJS.Timer>();

  return (
    <div className="flex h-full w-full flex-col items-center justify-around overflow-hidden pb-16 md:pb-0">
      {
        !!showstartingModal && (
          <Modal>
            <div className="flex w-full flex-col items-center justify-center gap-2">
              <div className="text-white text-2xl">Game Starting in</div>
              <div className="text-white text-2xl">{showstartingModal}</div>
            </div>
          </Modal>
        )
      }
      <div className="flex w-full max-w-[1024px] items-center justify-between">
        <ScoreBoard {...playerA} />
        <ScoreBoard {...playerB} />
      </div>
      <Canvas />
      {show && (
        <PauseGame
          title="Are you sure you want to leave the game ?"
          icon={<AiFillWarning size={100} />}
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
            })
          }}
          onReject={() => {
            clearInterval(intervalId.current)
            socket?.emit("resume-game", {
              userId: user?.id,
            })
            setShowModal(false);
          }

          }
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
            })
          }}
          accept="Exit Game"
        />
      )}
    </div>
  );
};





const GameOver = ({
  winnerId,
  setShow,
  setWinnerId,
}: {
  winnerId: number;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setWinnerId: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const { data: user } = useSWR(`api/users/${winnerId}`, fetcher);
  return (
    <Modal className="flex w-full flex-col items-center justify-center gap-2 ">
      <h1 className="text-white md:text-2xl">Game Over</h1>
      <Avatar
        src={user?.avatar || "/img/default.jpg"}
        alt="logo"
        className="h-20 w-20 md:h-32 md:w-32"
      />
      <h1 className="text-white md:text-2xl">Winner : {user?.username}</h1>
      <Button
        onClick={() => {
          setWinnerId(0);
          setShow(false);
        }}
      >
        Play Again
      </Button>
    </Modal>
  );
};

export default function Pong() {
  const [show, setShow] = useState<boolean>(false);
  const [winnerId, setWinnerId] = useState<number>(0);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showInvitaionModal, setShowInvitaionModal] = useState<boolean>(false);
  const [gameData, setGameData] = useState<any>()

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
    socket.emit(
      "check-for-active-invitations",
      {
        userId: user?.id,
      },
    )

    socket.on("check-for-active-invitations", (data) => {
      console.log('data', data)
      setShowInvitaionModal(!!data);
      setGameData(data)
    })

    notificationSocket?.on("check-for-active-invitations", (data) => {
      console.log('data', data)
      setShowInvitaionModal(!!data);
      setGameData(data)
    })


    socket.emit("is-already-in-game", {
      userId: user?.id,
    })
    socket.on("is-already-in-game", (data) => {
      setShowModal(data as boolean);
    })

    // diconnect handler
    socket.on("disconnect", () => {
      setShow(false);
    });
  }, [socket]);


  return (
    <Layout className="grid place-items-center gap-8 !py-2">
      {
        showInvitaionModal && (
          <Modal className="flex w-full flex-col items-center justify-between gap-2">
            <h1 className="text-white md:text-2xl">You have an invitation</h1>
            <div className="flex items-center justify-around w-full">
              <ScoreBoard
                id={gameData?.inviterId}
              />
              <div className="text-lg">Vs</div>
              <ScoreBoard
                id={gameData?.invitedFriendId}
              />
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
        // <div className="grid w-full place-items-center">

        <GameCards />

        // </div>
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
      {!!winnerId && (
        <GameOver
          winnerId={winnerId}
          setShow={setShow}
          setWinnerId={setWinnerId}
        />
      )}
      {showModal && (
        <ConfirmationModal
          icon={<AiFillWarning size={100} />}
          title="You are already in a game"
          accept="Ok"
          onAccept={() => {
            setShow(true)
            setShowModal(false);
          }}
        />
      )}
    </Layout>
  );
}