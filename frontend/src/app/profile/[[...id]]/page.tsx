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

const Layout = dynamic(() => import("../../layout/index"), { ssr: false });
const ProfileInfo = dynamic(() => import("@/components/profile-info"), { ssr: false });
const LadderProgressBar = dynamic(() => import("@/components/ladder-progres-bar"), { ssr: false });
const Achievement = dynamic(() => import("@/components/achievement"), { ssr: false });

const Achievements = ({ userAchievements }: { userAchievements: IAchievement[] }) => {
	const { data: achievements, isLoading } = useSwr("api/users/achievements", fetcher);

	const isDisabled = (name: string) => {
		if (!userAchievements) return true;
		return !userAchievements.find((item: IAchievement) => item.name === name);
	};

	return (
		<>
			<div className="flex items-center gap-2">
				<h2 className="text-lg font-semibold text-secondary-50 tracking-tight">Achievements</h2>
				{achievements && achievements?.length && (
					<span className="text-sm text-secondary-300">
						<span className="font-semibold text-primary-400">{userAchievements?.length || 0}</span>
						{` / ${achievements?.length}`}
					</span>
				)}
			</div>
			<div className="py-3">
				{isLoading ? (
					<Spinner />
				) : achievements && achievements.length ? (
					<div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:gap-5">
						{achievements
							.sort((a: IAchievement, b: IAchievement) => {
								if (isDisabled(a.name) < isDisabled(b.name)) return -1;
								if (isDisabled(a.name) > isDisabled(b.name)) return 1;
								return 0;
							})
							.map((item: IAchievement) => (
								<Achievement
									key={item.id}
									title={item.name}
									description={item.description}
									image={item.image}
									disabled={isDisabled(item.name)}
								/>
							))}
					</div>
				) : (
					<div className="flex h-[300px] w-full items-center justify-center text-lg text-secondary-300">
						No achievements yet
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
			<h2 className="text-lg font-semibold text-secondary-50 tracking-tight">Match History</h2>
			<div className="flex flex-col justify-start w-full h-96 p-3 gap-2.5 overflow-y-auto scrollbar-hide border border-white/[0.06] rounded-2xl bg-secondary-700">
				{!isLoading ? (
					matches && matches.length ? (
						matches.map((match: any) => (
							<Link className="w-full px-3" href={``} key={match?.id}>
								<GameBanner
									player1={match.player1}
									player2={match.player2}
									player1Score={match.player1Score}
									player2Score={match.player2Score}
								/>
							</Link>
						))
					) : (
						<div className="flex h-full w-full items-center justify-center text-lg text-secondary-300">
							<p>No matches yet</p>
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

	useEffect(() => {
		if (loading) return;
		if (data) {
			setUser(data);
		} else {
			setUser(undefined);
		}
		const id = setInterval(async () => {
			await mutate();
		}, 1000);
		setIsLoading(false);
		return () => clearInterval(id);
	}, [data, loading]);

	const achievements = useMemo(() => {
		return user?.achievements || undefined;
	}, [user?.achievements]);

	if (!data && !isLoading && !user) return <FourOFour />;

	return (
		<Layout className="flex flex-col items-center gap-6 py-8 md:gap-8 md:py-10">
			{isLoading ? (
				<Spinner />
			) : (
				<>
					<div className="ui-page-header w-full max-w-5xl text-lg font-semibold text-secondary-50 md:text-xl tracking-tight">
						<div className="ui-page-header-icon">
							<UserCircle size={24} />
						</div>
						Profile
					</div>
					{!!user && <ProfileInfo user={user} currentUserId={currentUser?.id || 0} />}
					<LadderProgressBar rating={user?.rating || 0} />
					<div className="w-full max-w-5xl">
						<div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
					</div>
					<div className="w-full max-w-5xl flex flex-col gap-4">
						<MatchHistory id={user?.id} />
					</div>
					<div className="w-full max-w-5xl flex flex-col gap-4 max-h-96 scrollbar-hide">
						<Achievements userAchievements={achievements || []} />
					</div>
				</>
			)}
		</Layout>
	);
}
