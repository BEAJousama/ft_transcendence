"use client"

import {
	Divider,
	Spinner,
	Achievement,
	ProfileInfo,
	LadderProgressBar,
	FourOFour
} from "@/components";
import { CgProfile } from "react-icons/cg";
import { useCallback, useContext } from "react";
import { AppContext, fetcher } from "../../../context/app.context";
import IAchievement from "../../../interfaces/achievement";
import useSWR from "swr";
import Layout from "../../layout/index";
import IUser from "@/interfaces/user";
import { useParams } from "next/navigation";

const Achievements = ({ user }: { user: IUser }) => {
	const { data: achievements, isLoading } = useSWR(
		"api/users/achievements",
		fetcher
	);

	const isDisabled = useCallback(
		(name: string) => {
			const achievements = user?.achievements;
			if (!achievements) return true;
			return !achievements.find(
				(item: IAchievement) => item.name === name
			);
		},
		[user?.achievements]
	);

	return (
		<>
			<span className="w-full max-w-[1024px] text-xl font-bold text-white">
				Achievements
				{achievements && achievements?.length && (
					<>
						<span className="text-primary-500">
							{" "}
							{user.achievements?.length || 0}
						</span>
						/{` ${achievements?.length}`}
					</>
				)}
			</span>
			<div className="flex w-full max-w-[1024px] items-center justify-center">
				{isLoading ? (
					<Spinner />
				) : achievements && achievements.length ? (
					<div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:gap-8">
						{achievements
							.sort((a: IAchievement, b: IAchievement) => {
								if (isDisabled(a.name) < isDisabled(b.name)) {
									return -1;
								}
								if (isDisabled(a.name) > isDisabled(b.name)) {
									return 1;
								}
								return 0;
							})
							.map((item: IAchievement) => {
								return (
									<Achievement
										key={item.id}
										title={item.name}
										description={item.description}
										image={item.image}
										disabled={isDisabled(item.name)}
									/>
								);
							})}
					</div>
				) : (
					<div className="flex h-[500px] w-full items-center justify-center text-2xl text-primary-500">
						No matches found
					</div>
				)}
			</div>
		</>
	);
};

export default function Profile() {
	const { id } = useParams()
	const { user: currentUser } = useContext(AppContext);
	const {
		data: user,
		isLoading,
	}: {
		data: IUser;
		isLoading: boolean;
	} = useSWR(`api/users/${id || currentUser?.id}`, fetcher, {
		refreshInterval: 1,
	});

	if (!isLoading && !user) {
		return <FourOFour />;
	}
	return (
		<Layout className="flex flex-col items-center gap-4 md:gap-8">
			{isLoading ? (
				<Spinner />
			) : (
				<>
					<div className="flex w-full max-w-[1024px] items-center gap-2 p-2 text-lg font-bold text-white md:gap-4  md:text-2xl">
						<CgProfile />
						Profile
					</div>
					<ProfileInfo
						user={user}
						currentUser={currentUser}

					/>
					<LadderProgressBar user={user} />
					<Divider />
					<Achievements user={user} />
				</>
			)}
		</Layout>
	);
}
