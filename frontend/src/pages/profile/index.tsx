import { BsThreeDotsVertical } from "react-icons/bs";
import {
  Button,
  Divider,
  RightClickMenu,
  RightClickMenuItem,
  Spinner,
  Achievement,
  ConfirmationModal,
  Avatar,
} from "../../components";
import { CgProfile } from "react-icons/cg";
import { useCallback, useContext, useEffect, useState } from "react";
import { AppContext, fetcher } from "../../context/app.context";
import IAchievement from "../../interfaces/achievement";
import useSWR from "swr";
import Layout from "../layout";
import clsx from "clsx";
import { useParams } from "react-router-dom";
import IUser, { IFriend } from "../../interfaces/user";
import axios from "axios";
import { addFriend, cancelFriend, acceptFriend } from "./tools";

const icons = [
  "beginner.svg",
  "amateur.svg",
  "semi_professional.svg",
  "professional.svg",
  "world_class.svg",
  "legendary.svg",
];

const Achievements = ({ user }: { user: IUser }) => {
  const { data: achievements, isLoading } = useSWR(
    "api/users/achievements",
    fetcher
  );

  const isDisabled = useCallback(
    (name: string) => {
      const achievements = user?.achievements;
      if (!achievements) return true;
      return !achievements.find((item: IAchievement) => item.name === name);
    },
    [user?.achievements]
  );


  return (
    <>
      <span className="w-full max-w-[1024px] text-xl font-bold text-white">
        Achievements
        {achievements && achievements?.length && (
          <>
            <span className="text-primary-500"> {user.achievements?.length || 0}</span> /
            {` ${achievements?.length}`}
          </>
        )}
      </span>
      <div className="flex w-full max-w-[1024px] items-center justify-center">
        {isLoading ? (
          <Spinner />
        ) : achievements.length ? (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:gap-8">
            {achievements.sort(
              (a: IAchievement, b: IAchievement) => {
                if (isDisabled(a.name) < isDisabled(b.name)) {
                  return -1;
                }
                if (isDisabled(a.name) > isDisabled(b.name)) {
                  return 1;
                }
                return 0;
              }
            ).map((item: IAchievement) => {
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

const LadderProgressBar = ({ user }: { user: IUser }) => {
  return (
    <>
      <div className="relative hidden h-14 w-full max-w-[1024px] md:block ">
        <div className="absolute -top-5 z-10 flex w-full items-center justify-between">
          {icons.map((item, i) => {
            return (
              <img
                key={i}
                src={`/levels/${item}`}
                alt=""
                width={40}
                className={clsx(
                  i * 20 > (user?.rating / 10000) * 100 && "opacity-60"
                )}
              />
            );
          })}
        </div>
        <div className="absolute top-[45%] mb-4 h-4 w-[99%] rounded-full bg-primary-800 dark:bg-gray-700">
          <div
            className="h-4 rounded-full bg-primary-400"
            style={{ width: `${((user?.rating / 10000) * 100).toString()}%` }}
          ></div>
        </div>
      </div>
    </>
  );
};

const ProfileInfo = ({ user,
  currentUser,
  setModalText,
}: {
  user: IUser
  currentUser?: IUser
  setModalText: React.Dispatch<React.SetStateAction<string>>
}) => {
  const {
    data: friendRequest,
    isLoading,
    mutate,
    error,
  } = useSWR(`api/users/${user?.id}/friend-request`, async (url) => {
    const accessToken = window.localStorage?.getItem("access_token"); // Replace with your actual access token
    const response = await axios.get(
      `${process.env.REACT_APP_BACK_END_URL}${url}`,
      {
        params: {
          senderId: currentUser?.id,
          receiverId: user?.id,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data
  }, {
    refreshInterval: 1,
  });
  const [text, setText] = useState("")
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (friendRequest?.status === "PENDING" && friendRequest?.senderId === currentUser?.id)
      setText("Cancel Request")
    else if (friendRequest?.status === "PENDING" && friendRequest?.senderId !== currentUser?.id)
      setText("Accept")
    else if (friendRequest?.status === "ACCEPTED")
      setText("Remove Friend")
    else
      setText("Add Friend")
  }, [friendRequest, isLoading])

  if (isLoading)
    return <Spinner />

  return <>
    <div className="flex w-full max-w-[1024px] flex-col justify-between gap-4 md:flex-row ">
      <div className="w-full max-w-[400px]">
        <div className="flex w-full items-center justify-between gap-4 font-serif text-white">
          <img
            src={`/levels/${user?.ladder.toLowerCase()}.svg`}
            alt="ladder"
            width={70}
          />
          <div className="place-items-left grid w-full gap-1">
            <span>{user?.fullname}</span>
            <div className="flex items-center gap-2">
              <img src={`/img/smalllogo.svg`} alt="" width={20} />
              <span>{user?.rating}/10000</span>
            </div>
            <div className="mb-4 h-4 w-full rounded-full bg-primary-800 dark:bg-gray-700">
              <div
                className="h-4 rounded-full bg-primary-400"
                style={{
                  width: `${((user?.rating / 10000) * 100).toString()}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <img src={`/img/win.png`} alt=" 12 " width={40} />
            <div className="flex flex-col text-green-500">
              <span>{user?.wins}</span>
              Total Wins
            </div>
          </div>
          <div className="flex items-center gap-2">
            <img src={`/img/lose.png`} alt=" 12 " width={40} />
            <div className="flex flex-col text-red-500">
              <span>{user?.losses}</span>
              Total Losses
            </div>
          </div>
        </div>
      </div>
      <div className="relative flex items-center justify-between gap-2">
        <Button disabled={user?.id === currentUser?.id} className="!text-xs">
          Message
        </Button>
        <Button
          disabled={user?.id === currentUser?.id}
          className="!text-xs"
          onClick={async () => {
            if (text === "Add Friend")
              setModalText(await addFriend(currentUser?.id || 0, user.id))
            else if (text === "Accept")
              setModalText(await acceptFriend(friendRequest.id))
            else
              setModalText(await cancelFriend(friendRequest.id))
            await mutate()
          }}
        >
          {text}
        </Button>
        {/* <Button
          disabled={user?.id === currentUser?.id}
          variant="text"
          className="!hover:bg-secondary-500 !border-none !bg-secondary-500 !text-white"
          onClick={() => {
            setShow((prev) => !prev);
          }}
        >
          <BsThreeDotsVertical />
        </Button>
        {show && (
          <RightClickMenu className="mt-1 translate-x-1/2 translate-y-1/3 transform">
            <RightClickMenuItem
              onClick={() => {
                setShow(false);
              }}
            >
              Block
            </RightClickMenuItem>
          </RightClickMenu>
        )} */}
      </div>
    </div>
  </>
}

export default function Profile() {
  const { id } = useParams();
  const [modalText, setModalText] = useState("");
  const { user: currentUser } = useContext(AppContext);
  const {
    data: user,
    isLoading,
  }: {
    data: IUser;
    isLoading: boolean
  } = useSWR(`api/users/${id || currentUser?.id}`, fetcher);

  return (
    <Layout className="flex flex-col items-center gap-4 md:gap-8">
      {isLoading ? <Spinner /> : (<>
        <div className="flex w-full max-w-[1024px] items-center gap-2 p-2 text-lg font-bold text-white md:gap-4  md:text-2xl">
          <CgProfile />
          Profile
        </div>
        <ProfileInfo user={user} currentUser={currentUser} setModalText={setModalText} />
        <LadderProgressBar user={user} />
        <Divider />
        <Achievements user={user} />
        {!!modalText && (
          <ConfirmationModal
            title={modalText}
            accept={!modalText.includes("Error") ? "Continue" : "Close"}
            icon={
              <Avatar
                src={
                  !modalText.includes("Error")
                    ? "/img/success.png"
                    : "/img/failure.png"
                }
                alt=""
                className="h-32 w-32"
              />
            }
            onAccept={() => {
              setModalText("");
            }}
          />
        )}</>)}
    </Layout>
  );
}
