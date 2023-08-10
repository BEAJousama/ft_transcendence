"use client"
import { Button, Card, Carousel, Input, Spinner, UserBanner } from "@/components";
import Modal from "@/components/modal";
import useSwr from "swr";
import { AppContext, fetcher } from "@/context/app.context";
import { GameContext } from "@/context/game.context";
import IUser from "@/interfaces/user";
import { useContext, useEffect, useState } from "react";

import { toast } from "react-toastify";


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
    const { data: users, isLoading } = useSwr("api/users", fetcher, {
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
        // if (users && (filtred || !value))
        //     setFiltred(
        //         users.filter((item: IUser) =>
        //             item.fullname.toLowerCase().includes(value.toLowerCase()) && item.status === "ONLINE" && item.id !== user?.id
        //         )
        //     );
        // else setFiltred(users?.filter((item: IUser) => item.status === "ONLINE" && item.id !== user?.id));
        if (users && (filtred || !value))
            setFiltred(
                users.filter((item: IUser) =>
                    item.fullname.toLowerCase().includes(value.toLowerCase()) && item.id !== user?.id
                )
            );
        else setFiltred(users?.filter((item: IUser) => item.id !== user?.id));
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
                <div className="flex w-full flex-col items-center justify-center gap-2 ">
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
                        <div className="flex h-full max-h-[500px] overflow-auto scrollbar-hide w-full flex-col">
                            {filtred.map((item: IUser) => {
                                return (
                                    <Button
                                        variant="text"
                                        className="!hover:bg-inherit w-full !bg-inherit !p-0"
                                        onClick={() => {
                                            setSelectedUser(item);
                                        }}
                                        key={item.id}
                                    >
                                        <UserBanner
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
                    )
                    }
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
                            disabled={!!!selectedUser}
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
                                    gameMode: gameMode,
                                    powerUps: gameOption,
                                });
                                toast.success("Invitation sent successfully");
                                setShowModal(false);
                                setShow(true);
                            }}
                        >
                            Invite
                        </Button>
                    </div>
                </div>

            )}
            {
                !showModal && (
                    <>
                        {showOptions ? (
                            <>
                                <RadioCheck
                                    value={gameMode}
                                    onChange={(e) => {
                                        setGameMode && setGameMode(e.target.value);
                                    }}
                                    htmlFor={"gamemode" + name}
                                    label="Select Game bet"
                                    options={["Classic Mode", "Ranked Mode", "Time Attack"]}
                                />
                                <RadioCheck
                                    value={gameOption}
                                    onChange={(e) => {
                                        setGameOption && setGameOption(e.target.value);
                                    }}
                                    htmlFor={"gameoption" + name}
                                    label="Select Game Options"
                                    options={["Classic", "Power Shot", "ShrinkingPaddle"]}
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
                    </>
                )
            }
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


export default function GameCards() {
    const [disabled, setDisabled] = useState<{
        invite: boolean;
        join: boolean;
    }>();
    const [gameMode, setGameMode] = useState<string>("Classic Mode");
    const [gameOption, setGameOption] = useState<string>("Classic");
    const { socket } = useContext(GameContext);
    const { user } = useContext(AppContext);
    return (
        <Carousel className="w-full" indicators={false} chevrons={true}>
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
                        gameMode: gameMode,
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
        </Carousel>
    )
}