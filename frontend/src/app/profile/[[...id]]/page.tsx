"use client";

import { Divider, Container, Spinner, FourOFour, Carousel, GameBanner, Card } from "@/components";
import { UserCircle } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { AppContext, fetcher } from "@/context/app.context";
import IAchievement from "@/interfaces/achievement";
import useSwr from "swr";
import IUser from "@/interfaces/user";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { twMerge } from "tailwind-merge";
import useSWR from "swr";
import Link from "next/link";

const Layout = dynamic(() => import("../../layout/index"), {
	ssr: false,
});

const ProfileInfo = dynamic(() => import("@/components/profile-info"), {
	ssr: false,
});

const LadderProgressBar = dynamic(() => import("@/components/ladder-progres-bar"), {
	ssr: false,
});

const Achievement = dynamic(() => import("@/components/achievement"), {
	ssr: false,
});

const Achievements = ({ userAchievements }: { userAchievements: IAchievement[] }) => {
	const { data: achievements, isLoading } = useSwr("api/users/achievements", fetcher);

	const isDisabled = (name: string) => {
		const achievements = userAchievements;
		if (!achievements) return true;
		return !achievements.find((item: IAchievement) => item.name === name);
	};

	return (
		<>
			<span className="w-full max-w-5xl text-xl font-bold text-white">
				Achievements
				{achievements && achievements?.length && (
					<>
						<span className="text-primary-500"> {userAchievements?.length || 0}</span>/
						{` ${achievements?.length}`}
					</>
				)}
			</span>
			<div className="py-4">
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

const MatchHistory = ({ id }: { id?: number }) => {
	const { data: matches, isLoading } = useSWR(`api/pong/match-history/${id}`, fetcher, {
		errorRetryCount: 0,
	});
	return (
		<>
			<span className="w-full max-w-5xl text-xl font-bold text-white">Match History</span>
			<div
				className={`flex flex-col justify-start w-full h-96 p-4
        gap-3 overflow-y-auto scrollbar-hide border-tertiary-500 border-2 rounded-md`}
			>
				{!isLoading ? (
					matches && matches.length ? (
						matches.map((match: any) => {
							return (
								<Link className="w-full px-4" href={``} key={match?.id}>
									<GameBanner
										player1={match.player1}
										player2={match.player2}
										player1Score={match.player1Score}
										player2Score={match.player2Score}
									/>
								</Link>
							);
						})
					) : (
						<div className="flex h-full w-full items-center justify-center text-xl text-tertiary-200">
							<p>No matches found</p>
						</div>
					)
				) : (
					<Spinner />
				)}
			</div>
		</>
	);
};

export default function Profile() {
	const prams = useParams();
	const { id } = prams ? prams : { id: null };
	const { user: currentUser } = useContext(AppContext);
	const {
		data,
		isLoading: loading,
		mutate,
	} = useSwr(`api/users/${id || currentUser?.id}`, fetcher);
	const [user, setUser] = useState<IUser | undefined>(undefined);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [state, setState] = useState<"achievements" | "match-history">("achievements");

	useEffect(() => {
		if (loading) return;
		if (data) {
			setUser(data);
		}
		const id = setInterval(async () => {
			await mutate();
		}, 500);
		setTimeout(() => {
			setIsLoading(false);
		}, 500);
		return () => clearInterval(id);
	}, [data]);

	const achievements = useMemo(() => {
		return user?.achievements || undefined;
	}, [user?.achievements]);

	if (!isLoading && !user && !data) {
		return <FourOFour />;
	}
	return (
		<Layout className="flex flex-col items-center gap-4 md:gap-8 py-8 md:py-16">
			{isLoading ? (
				<Spinner />
			) : (
				<>
					<div className="flex w-full max-w-5xl items-center gap-2 p-2 text-lg font-bold text-white md:gap-4  md:text-2xl">
						<UserCircle size={40} />
						Profile
					</div>
					{!!user && <ProfileInfo user={user} currentUserId={currentUser?.id || 0} />}
					{/* <div className="basis-[50%]"> */}
					<LadderProgressBar rating={user?.rating || 0} />
					{/* </div> */}
					<Divider />
					<div className="w-full flex flex-col gap-4 max-w-5xl">
						<MatchHistory id={user?.id} />
					</div>
					<div className="w-full flex flex-col gap-4 max-h-96 scrollbar-hide max-w-5xl">
						<Achievements userAchievements={achievements || []} />
					</div>
				</>
			)}
		</Layout>
	);
}
