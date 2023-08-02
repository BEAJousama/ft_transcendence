import {
  Avatar,
  Button,
  Card,
  Input,
  Spinner,
  Canvas,
  UserBanner,
  ConfirmationModal,
} from "../../components";
import React, { ReactNode, useContext, useEffect, useRef, useState } from "react";
import { GameContext } from "../../context/game.context";
import Layout from "../layout";
import { AppContext, fetcher } from "../../context/app.context";
import useSwr from "swr";
import Modal from "../../components/modal";
import { AiFillWarning } from "react-icons/ai";
import { Player, Ball } from "../../interfaces/game";
import useSWR from "swr";
import IUser from "../../interfaces/user";
import { Socket } from "socket.io-client";
import { twMerge } from "tailwind-merge";
import { SocketContext } from "../../context/socket.context";



export const ScoreBoard = ({ id, score }: { id: number; score?: number }) => {
  const { data: user } = useSwr(`api/users/${id}`, fetcher);
  return (
    <div className="flex flex-col items-center gap-2 text-xs text-white md:text-lg">
      <Avatar
        src={user?.avatar || "/img/default.jpg"}
        alt="logo"
        className="h-20 w-20 md:h-28 md:w-28"
      />
      <span>{user?.username}</span>
      {score !== undefined && <span>{score}</span>}
    </div>
  );
};

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

const RadioCheck = ({
  options,
  label,
  htmlFor,
  onChange,
  value,
}: {
  label?: string;
  htmlFor?: string;
  options: string[];
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
}) => {
  return (
    <div className="flex w-full flex-col items-center gap-2 pt-2">
      <div className="text-white">{label}</div>
      <ul>
        {options.map((option: string, i: number) => {
          return (
            <div className="flex items-center" key={i}>
              <input
                checked={value === option}
                id={htmlFor}
                type="radio"
                onChange={onChange}
                value={option}
                name={htmlFor}
                className="border-gray-300ring-offset-gray-800 h-4 w-4 bg-gray-100 text-blue-600 focus:ring-2 "
              />
              <label htmlFor={htmlFor} className="ml-2 text-sm font-medium ">
                {option}
              </label>
            </div>
          );
        })}
      </ul>
    </div>
  );
};

/*



*/

const CreateGameCard = ({
  onClick,
  onCancel,
  title,
  showLoading,
  content,
  showOptions,
  disabled,
  name,
  className,
  invite,
  gameMode,
  setGameMode,
  gameOption,
  setGameOption,

}: {
  onClick: () => void;
  onCancel: () => void;
  title: string;
  showLoading?: boolean;
  showOptions?: boolean;
  content: string;
  disabled?: boolean;
  name?: string;
  className?: string;
  invite?: boolean;

  gameMode?: string;
  setGameMode?: React.Dispatch<React.SetStateAction<string>>;
  gameOption?: string;
  setGameOption?: React.Dispatch<React.SetStateAction<string>>;

}) => {
  const { data: users, isLoading } = useSWR("api/users", fetcher, {
    errorRetryCount: 0,
  });
  const [value, setValue] = useState<string>("");
  const [show, setShow] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<IUser>();
  const [filtred, setFiltred] = useState<IUser[]>();
  const { socket } = useContext(GameContext);
  const { user } = useContext(AppContext);

  useEffect(() => {
    if (users && (filtred || !value))
      setFiltred(
        users.filter((item: IUser) =>
          item.fullname.toLowerCase().includes(value.toLowerCase()) && item.status === "ONLINE" && item.id !== user?.id
        )
      );
    else setFiltred(users?.filter((item: IUser) => item.status === "ONLINE" && item.id !== user?.id));
  }, [value, users]);

  return (
    <Card
      className={`
	relative flex w-full !max-w-md flex-col items-center gap-4 overflow-hidden bg-gradient-to-tr from-secondary-50  to-secondary-800 text-gray-400 
	${className}
	`}
    >
      <h1 className="text-center text-xl text-white">{title}</h1>
      {invite && showModal && (
        <Modal className="flex w-full flex-col items-center justify-center gap-2 ">
          <Input
            className="w-full"
            placeholder="Search Users ...."
            value={value}
            onChange={(e) => {
              const { value } = e.target;
              setValue(value);
            }}
          />
          {isLoading ? (
            <Spinner />
          ) : filtred?.length ? (
            <div className="flex h-full max-h-[500px] w-full flex-col">
              {filtred.map((item: IUser) => {
                return (
                  <Button
                    variant="text"
                    className="!hover:bg-inherit w-full !bg-inherit !p-0"
                    onClick={() => {
                      setSelectedUser(item);
                    }}
                  >
                    <UserBanner
                      key={item.id}
                      user={item}
                      showRating
                      rank={item.rating}
                    />
                  </Button>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center text-xs text-primary-500 md:text-2xl">
              No matches found
            </div>
          )}
          <span className="w-full">Selected User : </span>
          {selectedUser && (
            <UserBanner
              key={selectedUser.id}
              user={selectedUser}
              showRating
              rank={selectedUser.rating}
            />
          )}
          <div className="flex w-full items-center justify-center gap-4">
            <Button
              onClick={() => {
                setShowModal(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                socket?.emit("invite-friend", {
                  inviterId: user?.id,
                  invitedFriendId: selectedUser?.id,
                  bit: gameMode,
                  powerUps: gameOption,
                });
                setShowModal(false);
                setShow(true);
              }}
            >
              Invite
            </Button>
          </div>
        </Modal>
      )}
      {showOptions ? (
        <>
          <RadioCheck
            value={gameMode}
            onChange={(e) => {
              setGameMode && setGameMode(e.target.value);
            }}
            htmlFor={"gamemode" + name}
            label="Select Game Mode"
            options={["50", "100", "150"]}
          />
          <RadioCheck
            value={gameOption}
            onChange={(e) => {
              setGameOption && setGameOption(e.target.value);
              console.log(e.target.value);
            }}
            htmlFor={"gameoption" + name}
            label="Select Game Options"
            options={["Classic", "Speed", "Invisible"]}
          />
        </>
      ) : (
        <>
          <img src="/img/3839218-removebg-preview.png" alt="" width={200} />
        </>
      )}
      <Button
        className="px-16"
        onClick={() => {
          !invite && onClick();
          !invite && setShow(true);
          invite && setShowModal(true);
        }}
        disabled={disabled}
      >
        {content}
      </Button>
      {showLoading && show && (
        <>
          <div className="absolute inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm"></div>
          <div
            role="status"
            className="absolute left-1/2 top-2/4 grid -translate-x-1/2
             -translate-y-1/2 place-items-center gap-4"
          >
            <Spinner />
            <p className="text-white">Waiting for opponent</p>
            <Button
              onClick={() => {
                onCancel();
                setShow(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </>
      )}
    </Card>
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
  const [disabled, setDisabled] = useState<{
    invite: boolean;
    join: boolean;
  }>();
  const [winnerId, setWinnerId] = useState<number>(0);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showInvitaionModal, setShowInvitaionModal] = useState<boolean>(false);
  const [gameData, setGameData] = useState<any>()
  const [gameMode, setGameMode] = useState<string>("50");
  const [gameOption, setGameOption] = useState<string>("Classic");
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

  console.log(gameData)

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
        <div className="grid w-full max-w-[1024px] grid-rows-1 place-items-center gap-8 lg:grid-cols-2">
          <CreateGameCard
            invite
            title="Invite Your Friends to Play"
            content="Select Friend"
            name="Invite"
            onClick={() => {
              setDisabled({
                invite: false,
                join: true,
              });
            }}
            showOptions
            showLoading
            gameMode={gameMode}
            setGameMode={setGameMode}
            gameOption={gameOption}
            setGameOption={setGameOption}
            disabled={disabled?.invite}
            onCancel={() => {
              socket?.emit("cancel-invite", {
                inviterId: user?.id,
              });
              setDisabled({
                invite: false,
                join: false,
              });
            }}
          />
          <CreateGameCard
            title="Train Against Ai"
            content="Play Now"
            onCancel={() => { }}
            onClick={() => {
              socket?.emit("play-with-ai", {
                userId: user?.id,
              });
            }}
          />
          <CreateGameCard
            title="Play Against Random Users"
            content="Join The Queue"
            name="Join"
            gameMode={gameMode}
            setGameMode={setGameMode}
            gameOption={gameOption}
            setGameOption={setGameOption}
            onCancel={() => {
              socket?.emit("leave-queue", {
                userId: user?.id,
              });
              setDisabled({
                invite: false,
                join: false,
              });
            }}
            onClick={() => {
              socket?.emit("join-queue", {
                userId: user?.id,
                bit: gameMode,
                powerUps: gameOption,
              });
              setDisabled({
                invite: true,
                join: false,
              });
            }}
            showLoading
            showOptions
            disabled={disabled?.join}
          />
        </div>
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
