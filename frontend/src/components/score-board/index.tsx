"use client"
import useSwr from "swr";
import { fetcher } from "@/context/app.context";
import { Avatar } from "..";

const ScoreBoard = ({ id, score }: { id: number; score?: number }) => {
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

export default ScoreBoard;