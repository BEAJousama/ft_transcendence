"use client";

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
		<div className="flex h-14 w-full items-center gap-2 rounded-xl border border-white/[0.06] bg-secondary-800/60 px-2 transition-colors duration-150 hover:bg-secondary-700/80 md:gap-3">
			<Avatar src={user?.avatar} alt="avatar" className="h-10 w-10 shrink-0" />
			{showRank && (
				<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary-400/40 bg-primary-400/10 text-xs font-semibold text-primary-400">
					{rank}
				</div>
			)}
			<div
				className={twMerge(
					"flex min-w-0 flex-1 flex-col justify-center text-secondary-50",
					!showRating && "!items-start truncate"
				)}
			>
				<span className="truncate text-left text-sm font-medium">{user?.fullname || ""}</span>
				<span className="truncate text-left text-xs text-secondary-300">@{user?.login || ""}</span>
			</div>
			{showRating && (
				<div className="hidden items-center gap-1.5 text-sm font-medium text-secondary-200 sm:flex">
					{user?.rating}
					<Image src="/img/smalllogo.svg" alt="logo" height={16} width={16} />
				</div>
			)}
		</div>
	);
};

export default UserBanner;
