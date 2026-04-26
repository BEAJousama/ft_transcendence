"use client"

import {
  Avatar,
  Container,
  ChatBanner,
  GameBanner,
  UserBanner,
  Spinner,
} from "../../components";
import { useContext } from "react";
import { AppContext, fetcher } from "../../context/app.context";
import Layout from "../layout/index";
import useSWR from "swr";
import IUser from "../../interfaces/user";
import Link from "next/link";
import Image from "next/image";

const LeaderBoard = () => {
  const { data: users, isLoading } = useSWR("api/users", fetcher, {
    errorRetryCount: 0,
  });
  return (
    <Container title="Leader Board" icon="/img/3dMedal.svg">
      {!isLoading ? (
        users &&
        users.map((user: IUser, i: number) => {
          return (
            <Link href={`/profile/${user?.id}`} key={user?.username}>
              <UserBanner
                rank={i + 1}
                showRank
                showRating
                user={user}
              />
            </Link>
          );
        })
      ) : (
        <Spinner />
      )}
    </Container>
  );
};

const FriendList = () => {
  const { user } = useContext(AppContext);
  const { data: friends, isLoading } = useSWR(
    `api/users/${user?.id}/friends`,
    fetcher,
    { errorRetryCount: 0 }
  );
  return (
    <Container title="Friend List" icon="/img/friendlist.svg">
      {!isLoading ? (
        friends &&
        friends.map((user: IUser) => {
          return <Link href={`/profile/${user?.id}`} key={user?.id}>
            <UserBanner showRating user={user} />
          </Link>
        })
      ) : (
        <Spinner />
      )}
    </Container>
  );
};

const MatchHistory = () => {
  const { user } = useContext(AppContext);
  const { data: matches, isLoading } = useSWR(`api/pong/match-history/${user?.id}`, fetcher, {
    errorRetryCount: 0,
  });
  return (
    <Container title="Match History" icon="/img/history.svg">
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
    </Container>
  );
};

export default function Home() {
  const { user } = useContext(AppContext);
  const { data: channels, isLoading } = useSWR("api/channels", fetcher, {
    errorRetryCount: 0,
  });

  channels?.sort((a: any, b: any) => {
    return b.channelMembers.length - a.channelMembers.length;
  });

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen bg-secondary-900">
        <Spinner />
      </div>
    );

  const winRate = user && user.totalGames ? ((user.wins / user.totalGames) * 100).toFixed(0) : "0";

  return (
    <Layout className="grid w-full grid-cols-1 items-start gap-6 xl:grid-cols-2 3xl:grid-cols-3">
      <Link
        href={`/profile/${user?.id}`}
        className="group relative col-span-1 flex min-h-[230px] w-full animate-fade-right flex-wrap items-center justify-between gap-5 overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-secondary-700 via-secondary-700 to-secondary-800 p-5 shadow-xl shadow-black/20 transition-all duration-300 hover:border-primary-400/20 hover:shadow-glow xl:col-span-2 xl:min-h-[210px] xl:flex-nowrap xl:p-7 3xl:col-span-3"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary-400/[0.06] blur-3xl" />
        <div className="ui-badge absolute right-4 top-4">
          Player Card
        </div>
        <Avatar
          src={user?.avatar || ""}
          alt=""
          className="h-24 w-24 md:h-28 md:w-28 ring-2 ring-white/[0.06] ring-offset-2 ring-offset-secondary-700"
        />
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
          <span className="truncate text-lg font-semibold tracking-tight text-secondary-50 md:text-xl">
            {user?.fullname || ""}
          </span>
          <span className="truncate text-sm text-secondary-300">@{user?.login || ""}</span>
          <span className="text-xs text-secondary-400">
            {user?.status || "OFFLINE"} - Ladder {user?.ladder || "BEGINNER"}
          </span>
        </div>
        <div className="grid w-full grid-cols-3 gap-2 md:w-auto md:gap-3">
          <div className="ui-stat-card items-center text-center">
            <span className="text-[11px] uppercase tracking-wider text-secondary-400">Score</span>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-lg font-semibold text-secondary-50">{user?.rating}</span>
              <Image src="/img/smalllogo.svg" alt="logo" width={16} height={16} />
            </div>
          </div>
          <div className="ui-stat-card items-center text-center">
            <span className="text-[11px] uppercase tracking-wider text-secondary-400">Win Rate</span>
            <span className="text-lg font-semibold text-primary-400">{winRate}%</span>
          </div>
          <div className="ui-stat-card items-center text-center">
            <span className="text-[11px] uppercase tracking-wider text-secondary-400">Games</span>
            <span className="text-lg font-semibold text-secondary-50">{user ? user.wins + user.losses : 0}</span>
          </div>
        </div>
      </Link>
      <div className="w-full">
        <LeaderBoard />
      </div>
      <div className="w-full">
        <FriendList />
      </div>
      <div className="w-full">
        <MatchHistory />
      </div>
      <Container
        title="Popular Rooms"
        icon="/img/3dchat.svg"
        className="!grid w-full grid-cols-1 gap-3 place-items-stretch xl:grid-cols-2"
      >
        {
          channels?.map((channel: any) => {
            return <ChatBanner key={channel.id} channel={channel} />
          })
        }
      </Container>
    </Layout>
  );
}
