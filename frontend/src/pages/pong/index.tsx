import {
  Avatar,
  Button,
  Card,
  ConfirmationModal,
  Divider,
  GameBanner,
  Input,
  JoinGameCard,
  Sidepanel,
  Spinner,
  Canvas,
  UserBanner,
} from "../../components";
import { useMeasure } from "react-use";
import React, { useContext, useEffect, useRef, useState } from "react";
import { GameContext } from "../../context/game.context";
import Layout from "../layout";
import { AppContext, fetcher } from "../../context/app.context";
import useSwr from "swr";
import Modal from "../../components/modal";
import { Player, Ball } from "../../interfaces/game";
import useSWR from "swr";
import IUser from "../../interfaces/user";
import { Socket } from "socket.io-client";

export const ScoreBoard = ({ id, score }: { id: number; score: number }) => {
  const { data: user } = useSwr(`api/users/${id}`, fetcher);
  return (
    <div className="flex flex-col items-center gap-2 text-xs text-white md:text-lg">
      <Avatar
        src={user?.avatar || "/img/default.jpg"}
        alt="logo"
        className="!md:h-20 !md:w-20"
      />
      <span>{user?.username}</span>
      <span>{score}</span>
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
  const { socket } = useContext(GameContext);
  const { user } = useContext(AppContext);

  useEffect(() => {
    const id = setInterval(() => {
      socket?.emit("update", {
        userId: user?.id,
        playerCanvas: {
          width: 650,
          height: 480,
        },
      });
    }, 25);

    socket?.on("update", (data: Ball) => {
      // Update the ball position with the scaled values
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

    socket?.on("game-over", (data: { winner: number }) => {
      setShow(false);
      setWinnerId(data.winner);
    });

    socket?.on("disconnect", () => clearInterval(id));

    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-full w-full flex-col items-center justify-around">
      <div className="flex w-full  max-w-[1024px] items-center justify-between">
        <ScoreBoard {...playerA} />
        <ScoreBoard {...playerB} />
      </div>
      <Canvas />
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
        {options.map((option: string) => {
          return (
            <div className="flex items-center">
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
}) => {
  const { data: users, isLoading } = useSWR('api/users', fetcher, {
    errorRetryCount: 0,
  });
  const [value, setValue] = useState<string>("");
  const [show, setShow] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [gameMode, setGameMode] = useState<string>("Normal Mode");
  const [gameOption, setGameOption] = useState<string>("Classic");
  const [selectedUser, setSelectedUser] = useState<IUser>();
  const [filtred, setFiltred] = useState<IUser[]>();
  const { socket } = useContext(GameContext)
  const { user } = useContext(AppContext)

  useEffect(() => {
    if (users && (filtred || !value))
      setFiltred(users.filter((item: IUser) => item.fullname.toLowerCase().includes(value.toLowerCase())))
    else
      setFiltred(users)
  }, [value, users])

  return (
    <Card className={`
	relative flex w-full !max-w-md flex-col items-center gap-4 overflow-hidden bg-gradient-to-tr from-secondary-500  to-secondary-800 text-gray-400 text-white
	${className}
	`}>
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
          ) : (
            filtred?.length ? (
              <div className="flex flex-col h-full max-h-[500px] w-full">
                {filtred.map((item: IUser) => {
                  return (
                    <Button variant="text" className="w-full !bg-inherit !hover:bg-inherit !p-0" onClick={() => {
                      setSelectedUser(item)
                    }}>
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
            ) : <div className="flex items-center justify-center text-xs md:text-2xl text-primary-500">
              No matches found
            </div>
          )}
          <span className="w-full">Selected User : </span>
          {selectedUser && (
            <UserBanner key={selectedUser.id}
              user={selectedUser}
              showRating
              rank={selectedUser.rating} />
          )}
          <div className="w-full flex items-center justify-center gap-4">
            <Button onClick={() => {
              setShowModal(false)
            }}>
              Cancel
            </Button>
            <Button onClick={() => {
              // socket?.emit("invite", {
              //   id: selectedUser?.id,
              //   gameMode,
              //   gameOption,
              // });
              socket?.emit('invite-friend', {
                inviterId: user?.id,
                invitedFriendId: selectedUser?.id,
              })
              setShowModal(false)
              setShow(true)
            }}>
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
              setGameMode(e.target.value);
            }}
            htmlFor={"gamemode" + name}
            label="Select Game Mode"
            options={["Normal Mode", "Ranked Mode", "survival Mode"]}
          />
          <RadioCheck
            value={gameOption}
            onChange={(e) => {
              setGameOption(e.target.value);
              console.log(e.target.value);
            }}
            htmlFor={"gameoption" + name}
            label="Select Game Options"
            options={["Classic", "Power Ups"]}
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
          invite && setShowModal(true)
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

export default function Pong() {
  const [show, setShow] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<{
    invite: boolean;
    join: boolean;
  }>();
  const [winnerId, setWinnerId] = useState<number>(0);
  const { socket, playerA, setPlayerA, playerB, setPlayerB, ball, setBall } =
    useContext(GameContext);
  const { user } = useContext(AppContext);

  useEffect(() => {
    if (!socket) return;
    socket.on("init-game", () => {
      setShow(true);
    });
    socket.emit("accept-invitation", {
      invitedFriendId: 2,
      // invitedFriendId: user?.id,
    });
  }, [socket]);

  return (
    <Layout className="grid place-items-center gap-8 !py-2">
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
            disabled={disabled?.invite}
            onCancel={() => {
              socket?.emit("cancel-invite", {
                userId: user?.id,
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
    </Layout>
  );
}
