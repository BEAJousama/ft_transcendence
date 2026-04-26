"use client"
import useSwr from "swr";
import { fetcher } from "@/context/app.context";
import { Avatar } from "..";

const ScoreBoard = ({ id, score }: { id: number; score?: number }) => {
    const { data: user } = useSwr(`api/users/${id || 1}`, fetcher);
    return (
        <div className="flex min-w-[120px] flex-col items-center gap-2.5 rounded-2xl border border-white/[0.06] bg-secondary-700/80 px-4 py-4 text-xs text-secondary-50 shadow-lg shadow-black/20 md:text-lg">
            <Avatar
                src={user?.avatar || "/img/default.jpg"}
                alt="logo"
                className="h-20 w-20 2xl:h-28 2xl:w-28"
            />
            <span className="truncate text-center text-sm font-semibold md:text-base">{user?.username}</span>
            {score !== undefined && <span className="text-2xl font-bold text-primary-400 md:text-3xl">{score}</span>}
        </div>
    );
};

export default ScoreBoard;
