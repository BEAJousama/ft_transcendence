"use client";

import { Divider, Container, Spinner, FourOFour, Carousel, GameBanner } from "@/components";
import { Link, UserCircle } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { AppContext, fetcher } from "@/context/app.context";
import IAchievement from "@/interfaces/achievement";
import useSwr from "swr";
import IUser from "@/interfaces/user";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { twMerge } from "tailwind-merge";
import useSWR from "swr";

const Layout = dynamic(() => import("../../layout/index"), {
	ssr: false,
});

const ProfileInfo = dynamic(() => import("@/components/profile-info"), {
	ssr: false,
});

const LadderProgressBar = dynamic(
	() => import("@/components/ladder-progres-bar"),
	{
		ssr: false,
	}
);

const Achievement = dynamic(() => import("@/components/achievement"), {
	ssr: false,
});

const Achievements = ({
	userAchievements,
}: {
	userAchievements: IAchievement[];
}) => {
	const { data: achievements, isLoading } = useSwr(
		"api/users/achievements",
		fetcher
	);

	const isDisabled = (name: string) => {
		const achievements = userAchievements;
		if (!achievements) return true;
		return !achievements.find((item: IAchievement) => item.name === name);
	};

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

const MatchHistory = () => {
	const { user } = useContext(AppContext);

	const { data: matches, isLoading } = useSWR(`api/pong/match-history/${user?.id}`, fetcher, {
		errorRetryCount: 0,
	});
	return (<Container title="MATCH HISTORY" icon="/img/history.svg">
		{!isLoading ? (
			matches &&
			matches.map((match: any) => {
				return <Link href={``} key={match?.id}>
					<GameBanner player1={match.player1} player2={match.player2} player1Score={match.player1Score}
						player2Score={match.player2Score} />
				</Link>
			})
		) : (
			<Spinner />
		)}
	</Container>)
}

export default function Profile() {
	const prams = useParams();
	const { id } = prams ? prams : { id: null };
	const { user: currentUser } = useContext(AppContext);
	const { data, isLoading: loading, mutate } = useSwr(`api/users/${id || currentUser?.id}`, fetcher);
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
		<Layout className="flex flex-col items-center gap-4 md:gap-8">
			{isLoading ? (
				<Spinner />
			) : (
				<>
					<div className="flex w-full max-w-[1024px] items-center gap-2 p-2 text-lg font-bold text-white md:gap-4  md:text-2xl">
						<UserCircle size={40} />
						Profile
					</div>
					{!!user && (
						<ProfileInfo user={user} currentUserId={currentUser?.id || 0} />
					)}
					<LadderProgressBar rating={user?.rating || 0} />
					<Divider />
					<div className=" h-fit w-fit">
						<button
							className={twMerge(
								"h-6 w-fit transition-all duration-500 ease-out text-secondary-200 px-2",
								state === "achievements"
									? "underline font-semibold text-primary-500" : "hover:bg-white hover:bg-opacity-10"
							)}
							disabled={state === "achievements"}
							onClick={() => setState("achievements")}
						>
							Achievements
						</button>
						<button
							className={twMerge(
								"h-6 w-fit transition-all duration-500 ease-out text-secondary-200 px-2",
								state === "match-history"
									? "underline font-semibold text-primary-500" : "hover:bg-white hover:bg-opacity-10"
							)}
							disabled={state === "match-history"}
							onClick={() => setState("match-history")}
						>
							Match History
						</button>
					</div>
					<Carousel
						swipeable={false}
						chevrons={false}
						slide={state === "achievements" ? 0 : 1}
						className={`w-full h-full overflow-visible justify-start`}
					>
						<Achievements userAchievements={achievements || []} />
						<MatchHistory />
					</Carousel>
				</>
			)}
		</Layout>
	);
}
