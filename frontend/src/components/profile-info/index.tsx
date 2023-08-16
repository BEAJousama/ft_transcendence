"use client";

import useSwr from "swr";
import IUser, { IBlock } from "@/interfaces/user";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import {
    addFriend,
    cancelFriend,
    acceptFriend,
    BlockUser,
    UnBlockUser,
    isBlocked,
} from "./tools";
import { Spinner, Avatar, Button } from "@/components";
import { ChatContext } from "@/context/chat.context";
import { useRouter } from "next/navigation";
import { AppContext } from "@/context/app.context";


const status = {
    ONLINE: { status: "online", color: "text-green-500" },
    OFFLINE: { status: "offline", color: "text-red-500" },
    INGAME: { status: "in game", color: "text-yellow-600" },
};

const ProfileInfo = ({
    user,
    currentUserId,
}: {
    user: IUser;
    currentUserId: number;
}) => {
    const router = useRouter();
    const { socket } = useContext(ChatContext);
    const { user: __user, updateUser } = useContext(AppContext)
    const {
        data: friendRequest,
        isLoading,
        mutate,
    } = useSwr(
        `api/users/${user?.id}/friend-request`,
        async (url) => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACK_END_URL}${url}`,
                    {
                        withCredentials: true,
                        params: {
                            senderId: currentUserId,
                            receiverId: user?.id,
                        },
                    }
                );
                return response.data;
            }
            catch (error) {
                return null;
            }
        },
        {
            refreshInterval: 1,
            errorRetryCount: 0,
            shouldRetryOnError: false,
        }
    );
    let blocked = false;
    let __blocked = false;

    const [text, setText] = useState("");

    useEffect(() => {
        console.clear();
        console.log('friend: ', friendRequest);
        if (
            friendRequest?.status === "PENDING" &&
            friendRequest?.senderId === currentUserId
        )
            setText("Cancel Request");
        else if (
            friendRequest?.status === "PENDING" &&
            friendRequest?.senderId !== currentUserId
        )
            setText("Accept");
        else if (friendRequest?.status === "ACCEPTED") setText("Remove Friend");
        else setText("Add Friend");
    }, [friendRequest, isLoading, currentUserId]);

    if (isLoading) return <Spinner />;

    const userStatus = status[user.status as "ONLINE" | "OFFLINE" | "INGAME"];

    const _isBlocked = (id: number, blockers?: IBlock[]) => {
        if (blockers) {
            const res = blockers.map((block: IBlock) => {
                if (block.blockingId === id) {
                    return true;
                }
                return false;
            });
            return res.includes(true);
        }
        return false;
    };

    blocked = _isBlocked(user.id, __user?.blockers);

    let block: IBlock | undefined = isBlocked(currentUserId, __user?.blockers)
    if (!block) {
        block = isBlocked(user.id, __user?.blocking)
    }

    if (block) {
        __blocked = block.blockerId === user.id
    }

    return (
        <>
            <div className="flex w-full max-w-[1024px] flex-col items-center justify-between gap-4 md:flex-row ">
                <div className=" w-full ">
                    <div className="flex w-full items-center justify-between gap-4 text-white">
                        <div className="flex w-full flex-col items-center justify-between lg:gap-6 gap-4 lg:flex-row">
                            <div className="flex w-full flex-col items-center justify-center gap-6 md:flex-row">
                                <div className="basis-1/3">
                                    <Avatar
                                        src={user?.avatar || "/img/default-avatar.png"}
                                        alt="avatar"
                                        className="h-48 w-48 md:h-24 md:w-24"
                                    />
                                </div>
                                <div className="place-items-left grid w-full gap-1">
                                    <span className="text-lg font-semibold">
                                        {user?.fullname}
                                    </span>
                                    <div className="flex items-center justify-between w-full">
                                        <span className="text-sm font-light">
                                            @{user?.username}
                                        </span>
                                        <span className={`${userStatus.color}`}>
                                            {userStatus.status}
                                        </span>
                                    </div>
                                    <div className="flex w-full gap-4">
                                        <Button
                                            disabled={user?.id === currentUserId || (blocked || __blocked)}
                                            className="w-full !text-xs"
                                            onClick={async () => {
                                                if (text === "Add Friend") {
                                                    await addFriend(currentUserId || 0, user.id);
                                                }
                                                else if (text === "Accept") {
                                                    await acceptFriend(friendRequest.id);
                                                }
                                                else {
                                                    await cancelFriend(friendRequest.id);

                                                }
                                                await mutate();
                                            }}
                                        >
                                            {text}
                                        </Button>
                                        <Button
                                            disabled={user?.id === currentUserId || (blocked || __blocked)}
                                            className="w-full !text-xs"
                                            onClick={() => {
                                                socket?.emit("dm_create", {
                                                    senderId: currentUserId,
                                                    receiverId: user?.id,
                                                });
                                                router.push(`/chat`);
                                            }}
                                        >
                                            Message
                                        </Button>
                                        <Button
                                            disabled={user?.id === currentUserId || __blocked}
                                            type={blocked ? "success" : "danger"}
                                            onClick={async () => {
                                                blocked
                                                    ? UnBlockUser(currentUserId || 0, user.id)
                                                    : BlockUser(currentUserId || 0, user.id);
                                                await mutate();
                                                await updateUser();
                                            }}
                                        >
                                            {blocked ? "UnBlock" : "block"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="grid w-full justify-between grid-cols-1">
                                <div className="flex w-full justify-between gap-1">
                                    <span className="text-sm font-light text-primary-500">
                                        Score
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className=" font-medium">
                                            {user?.rating}
                                            <span className=" text-gray-300 ">/10000</span>
                                        </span>
                                        <img src={`/img/smalllogo.svg`} alt="" width={14} />
                                    </div>
                                </div>
                                <div className="flex w-full justify-between gap-1">
                                    <span className="text-sm font-light text-primary-500">
                                        Rank
                                    </span>
                                    <span>
                                        {user.ladder
                                            .toLowerCase()
                                            .split("_")
                                            .map(
                                                (word: string) =>
                                                    word.charAt(0).toUpperCase() + word.slice(1)
                                            )
                                            .join(" ")}
                                    </span>
                                </div>
                                <div className="flex w-full justify-between gap-1">
                                    <span className="text-sm font-light text-primary-500">
                                        Games Won
                                    </span>
                                    <span>
                                        {user.wins} of {user.totalGames}
                                    </span>
                                </div>
                                <div className="flex w-full justify-between gap-1">
                                    <span className="text-sm font-light text-primary-500">
                                        Win Streak
                                    </span>
                                    <span>{user.winStreak}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProfileInfo;
