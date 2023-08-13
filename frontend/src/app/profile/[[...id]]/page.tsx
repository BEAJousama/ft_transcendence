"use client"

import {
	Divider,
	Spinner,
	ProfileInfo,
	LadderProgressBar,
	FourOFour
} from "@/components";
import { UserCircle } from 'lucide-react';
import { useContext, useMemo } from "react";
import { AppContext, fetcher } from "../../../context/app.context";
import IAchievement from "../../../interfaces/achievement";
import useSwr from "swr";
import Layout from "../../layout/index";
import IUser from "@/interfaces/user";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";

const Achievement = dynamic(() => import("@/components/achievement/index"), {
	ssr: false,
});

const Achievements = ({ userAchievements }: { userAchievements: IAchievement[] }) => {
	const { data: achievements, isLoading } = useSwr(
		"api/users/achievements",
		fetcher
	);

	const isDisabled = (name: string) => {
		const achievements = userAchievements;
		if (!achievements) return true;
		return !achievements.find(
			(item: IAchievement) => item.name === name
		);
	}

	return (
		<>
			<span className="w-full max-w-[1024px] text-xl font-bold text-white">
				Achievements
				{achievements && achievements?.length && (
					<>
						<span className="text-primary-500">
							{" "}
							{userAchievements?.length || 0}
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
	const prams = useParams()
	const { id } = prams ? prams : { id: null };
	const { user: currentUser } = useContext(AppContext);
	const {
		data,
		isLoading,
	} = useSwr(`api/users/${id || currentUser?.id}`, fetcher, {
		refreshInterval: 0,
	});

	const user = useMemo(() => {
		return data as IUser;
	}, [data]);

	if (!isLoading && !user) {
		return <FourOFour />;
	}

	const achievements = useMemo(() => {
		return user?.achievements || undefined;
	}, [user?.achievements]);

	return (
		<Layout className="flex flex-col items-center gap-4 md:gap-8">
			{isLoading ? (
				<Spinner />
			) : (
				<>
					<div className="flex w-full max-w-[1024px] items-center gap-2 p-2 text-lg font-bold text-white md:gap-4  md:text-2xl">
						<UserCircle size={40} />
						Profile
					</div>
					<ProfileInfo
						user={user}
						currentUserId={currentUser?.id || 0}
					/>
					<LadderProgressBar rating={user?.rating} />
					<Divider />
					<Achievements userAchievements={achievements} />
				</>
			)}
		</Layout>
	);
}
