"use client"


import Avatar from "../avatar";
import IUser from "../../interfaces/user";
import { twMerge } from "tailwind-merge";
import Image from "next/image";

const UserBanner = ({
    showRank,
    rank,
    showRating,
    user,
}: {
    showRank?: boolean;
    showRating?: boolean;
    rank?: number;
    user?: IUser;
}) => {
    return (
        <div className="my-3 flex h-12 w-full items-center gap-1 rounded-full bg-tertiary-500 pr-2 md:gap-2">
            <div className="basis-3/12 md:basis-0">
                <Avatar src={user?.avatar} alt="avatar" className="h-16 w-16" />
            </div>
            <div className="basis-3/12 md:basis-0">
                {showRank && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary-500 text-white">
                        {rank}
                    </div>
                )}
            </div>
            <div
                className={twMerge(
                    "flex w-full flex-col items-start justify-center truncate text-white md:p-4",
                    !showRating && "!items-start truncate"
                )}
            >
                <span className="text-left text-xs">{user?.fullname || ""}</span>
                <span className="text-left text-xs">@{user?.login || ""}</span>
            </div>
            <div
                className={twMerge(
                    "hidden items-center gap-2 pr-8 text-xs text-white sm:flex"
                )}
            >
                {user?.rating}
                <Image src="/img/smalllogo.svg" alt="logo" width={20} />
            </div>
        </div>
    );
};

export default UserBanner;
