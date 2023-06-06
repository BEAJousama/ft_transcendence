import clsx from "clsx";
import { Avatar, Sidepanel } from "../../components";
import { useMedia } from "react-use";
import { useContext } from "react";
import { AppContext } from "../../context/app.context";
import { Link } from "react-router-dom";
import IUser from "../../interfaces/user";

const Game = ({ player1, player2 }: {
  player1?: IUser;
  player2?: IUser;
}) => {
  return (
    <div className="my-4 flex h-12 w-full items-center justify-center rounded-full bg-tertiary-500">
      <div className="flex w-full items-center justify-start">
        <Avatar
          src={`https://randomuser.me/api/portraits/women/${2}.jpg`}
          className="h-16 w-16"
          alt=""
        />
        <div className="w-full flex-col items-end justify-end px-2 text-white sm:flex md:px-4 ">
          <span className="w-full text-center font-bold">3</span>
          <span className="hidden w-full text-center font-bold md:block">
            hbel-hou
          </span>
        </div>
      </div>
      <p className=" relative w-10 text-2xl text-primary-500 md:text-4xl">•</p>
      <div className="flex w-full items-center justify-end">
        <div className="w-full flex-col items-start justify-center px-2 text-white sm:flex md:px-4 ">
          <span className="flex w-full items-center justify-center font-bold">
            0
          </span>
          <span className="hidden w-full items-center justify-center font-bold md:flex">
            mel-hous
          </span>
        </div>
        <Avatar
          src={`https://randomuser.me/api/portraits/women/${4}.jpg`}
          className="h-16 w-16"
          alt=""
        />
      </div>
    </div>
  );
};

const UserBanner = ({
  showRank,
  rank,
  showRating,
  user,
}: {
  showRank?: boolean;
  showRating?: boolean;
  rank?: number;
  user?: any;
}) => {
  const isMatch = useMedia("(max-width: 400px)");
  return (
    <div className="my-3 flex h-12 w-full items-center justify-between rounded-full bg-tertiary-500">
      <Avatar
        src={user?.avatar || `https://randomuser.me/api/portraits/women/${rank || 25}.jpg`}
        className="h-16 w-16"
        alt=""
      />
      {showRank && (
        <div className="w-[20%] px-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary-500 text-white">
            {rank}
          </div>
        </div>
      )}
      <div
        className={clsx(
          "flex w-full flex-col items-start justify-center px-4 text-white md:p-4",
          !showRating && "!items-start"
        )}
      >
        <span
          className={clsx(
            "max-w-[80px] truncate text-left text-xs sm:max-w-full",
            !isMatch && showRating && "!max-w-[90px]",
            !isMatch && !showRating && "!max-w-full",
            true && "!xl:max-w-full !w-full"
          )}
        >
          {user?.fullname || ""}
        </span>
        <span
          className={clsx(
            "max-w-[80px] truncate text-left text-xs sm:max-w-full",
            !isMatch && showRating && "!max-w-[90px]",
            !isMatch && !showRating && "!max-w-full",
            true && "!xl:max-w-full !w-full"
          )}
        >
          @{user?.login || ""}
        </span>
      </div>
      <div
        className={clsx(
          "flex items-center gap-2 pr-8 text-xs",
          (isMatch || !showRating) && "hidden"
        )}
      >
        {user?.rating}
        <img src="/img/smalllogo.svg" alt="logo" width={20} />
      </div>
    </div>
  );
};


const ChatBanner = () => {
  return <div></div>
}

const Container = ({
  children,
  title,
  icon,
}: {
  children?: React.ReactNode;
  title: string;
  icon: string;
}) => {
  return (
    <div className="flex w-full max-w-[800px] flex-col gap-2 md:w-[88%]  animate-fade-right">
      <div className="relative flex h-[500px] rounded border-2 border-secondary-400 shadow-sm shadow-secondary-400">
        <img
          src={icon}
          alt="icon"
          className="absolute -top-10 left-1/2 -translate-x-1/2 transform "
        />
        <span className="text-sm md:text-xl absolute left-1/2 top-2 z-10 -translate-x-1/2 transform font-bold text-white">
          {title}
        </span>
        <div className="absolute top-12 flex h-[90%] w-full flex-col overflow-y-auto overflow-x-hidden px-2 scrollbar-hide">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const { user } = useContext(AppContext);
  return (
    <div className="grid h-screen w-screen grid-cols-10 bg-secondary-500">
      <Sidepanel className="col-span-2 2xl:col-span-1" />
      <div className="col-span-8 flex h-screen flex-col items-center gap-10 overflow-y-scroll px-4 py-16 scrollbar-hide 2xl:col-span-9 2xl:grid 2xl:grid-cols-2 3xl:grid-cols-3 2xl:place-items-center">
        <Link to={`/profile`} className=" animate-fade-right flex h-[500px] w-[88%] max-w-[800px] flex-wrap items-center justify-center gap-4 rounded border-2 border-secondary-400 p-4 md:h-[200px] md:flex-nowrap">
          <Avatar
            src={user?.avatar || ""}
            alt=""
            className="h-28 w-28 md:h-36 md:w-36"
          />
          <div className="flex flex-col justify-center gap-2 p-2">
            <span className="text-lg font-bold text-white">
              {user?.fullname || ""}
            </span>
            <span className="text-sm text-tertiary-50">@{user?.login || ""}</span>
          </div>
          <div className="flex items-start justify-between gap-4 text-sm">
            <div className="flex flex-col text-secondary-100 ">
              <span>Score</span>
              <span>Winning Rate</span>
              <span>Total Games</span>
            </div>
            <div className="flex flex-col text-white">
              <div className="flex gap-2">
                <span>3,785</span>
                <img src="/img/smalllogo.svg" alt="logo" width={20} />
              </div>
              <div className="flex ">
                <span>87 %</span>
              </div>
              <div className="flex">
                <span>99</span>
              </div>
            </div>
          </div>
        </Link>
        <Container title="Leader Board" icon="/img/3dMedal.svg">
        </Container>
        <Container title="FRIEND LIST" icon="/img/friendlist.svg">
        </Container>
        <Container title="LIVE FEED" icon="/img/3dCam.svg">
        </Container>
        <Container title="MATCH HISTORY" icon="/img/history.svg">
        </Container>
        <Container title="POPULAR ROOMS" icon="/img/3dchat.svg">
        </Container>
      </div>
    </div>
  );
}

export { UserBanner };