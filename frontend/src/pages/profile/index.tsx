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
import { Navigate, useParams } from "react-router-dom";
import IUser, { IFriend } from "../../interfaces/user";
import axios from "axios";
import { addFriend, cancelFriend, acceptFriend } from "./tools";
import FourOhFour from "../404";

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
						</span>{" "}
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
									i * 20 > (user?.rating / 10000) * 100 &&
										"grayscale-[70%]"
								)}
							/>
						);
					})}
				</div>
				<div className="absolute top-[45%] mb-4 h-4 w-[99%] rounded-full bg-primary-800 dark:bg-gray-700">
					<div
						className="h-4 rounded-full bg-primary-400"
						style={{
							width: `${Math.min(
								(user?.rating / 10000) * 100,
								100
							).toString()}%`,
						}}
					></div>
				</div>
			</div>
		</>
	);
};

const status = {
	ONLINE: { status: "online", color: "text-green-500" },
	OFFLINE: { status: "offline", color: "text-red-500" },
	INGAME: { status: "in game", color: "text-yellow-600" },
};

const ProfileInfo = ({
	user,
	currentUser,
	setModalText,
}: {
	user: IUser;
	currentUser?: IUser;
	setModalText: React.Dispatch<React.SetStateAction<string>>;
}) => {
	const {
		data: friendRequest,
		isLoading,
		mutate,
		error,
	} = useSWR(
		`api/users/${user?.id}/friend-request`,
		async (url) => {
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
			return response.data;
		},
		{
			refreshInterval: 1,
		}
	);
	const [text, setText] = useState("");
	const [show, setShow] = useState(false);

	useEffect(() => {
		if (
			friendRequest?.status === "PENDING" &&
			friendRequest?.senderId === currentUser?.id
		)
			setText("Cancel Request");
		else if (
			friendRequest?.status === "PENDING" &&
			friendRequest?.senderId !== currentUser?.id
		)
			setText("Accept");
		else if (friendRequest?.status === "ACCEPTED") setText("Remove Friend");
		else setText("Add Friend");
	}, [friendRequest, isLoading]);

	if (isLoading) return <Spinner />;

	const userStatus = status[user.status as "ONLINE" | "OFFLINE" | "INGAME"];
	return (
		<>
			<div className="flex w-full max-w-[1024px] flex-col items-center justify-between gap-4 md:flex-row ">
				<div className=" w-full ">
					<div className="flex w-full items-center justify-between gap-4 text-white">
						<div className="flex w-full flex-col items-center justify-between lg:gap-6 gap-4 lg:flex-row">
							<div className="flex w-full flex-col items-center justify-center gap-6 md:flex-row">
								<Avatar
									src={
										user?.avatar ||
										"/img/default-avatar.png"
									}
									alt="avatar"
									className="h-48 w-48 md:h-24 md:w-24"
								/>
								<div className="place-items-left grid w-full gap-1">
									<span className="text-lg font-semibold">
										{user?.fullname}
									</span>
									<div className="flex items-center justify-between w-full">
										<span className="text-sm font-light">
											@{user?.username}
										</span>
										<span
											className={`${userStatus.color}`}
										>
											{userStatus.status}
										</span>
									</div>
									<div className="flex w-full gap-4">
										<Button
											disabled={
												user?.id === currentUser?.id
											}
											className="w-full !text-xs"
											onClick={async () => {
												if (text === "Add Friend")
													setModalText(
														await addFriend(
															currentUser?.id ||
																0,
															user.id
														)
													);
												else if (text === "Accept")
													setModalText(
														await acceptFriend(
															friendRequest.id
														)
													);
												else
													setModalText(
														await cancelFriend(
															friendRequest.id
														)
													);
												await mutate();
											}}
										>
											{text}
										</Button>
										<Button
											disabled={
												user?.id === currentUser?.id
											}
											className="w-full !text-xs"
										>
											Message
										</Button>
									</div>
								</div>
							</div>
							<div className="grid w-full grid-cols-2">
								<div className="flex w-full flex-col place-items-start gap-1">
									<span className="text-sm font-light text-primary-500">
										Score
									</span>
									<span className="text-sm font-light text-primary-500">
										Rank
									</span>
									<span className="text-sm font-light text-primary-500">
										Games Won
									</span>
									<span className="text-sm font-light text-primary-500">
										Win Streak
									</span>
								</div>
								<div className="flex w-full flex-col place-items-end gap-1">
									<div className="flex items-center gap-2">
										<span className=" font-medium">
											{user?.rating}
											<span className=" text-gray-300 ">
												{" "}
												/10000
											</span>
										</span>
										<img
											src={`/img/smalllogo.svg`}
											alt=""
											width={14}
										/>
									</div>
									<span>
										{user.ladder
											.toLowerCase()
											.split("_")
											.map(
												(word: string) =>
													word
														.charAt(0)
														.toUpperCase() +
													word.slice(1)
											)
											.join(" ")}
									</span>
									<span>
										{user.wins} of {user.totalMatches}
									</span>
									<span>{user.winStreak}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default function Profile() {
	const { id } = useParams();
	const [modalText, setModalText] = useState("");
	const { user: currentUser } = useContext(AppContext);
	const {
		data: user,
		isLoading,
	}: {
		data: IUser;
		isLoading: boolean;
	} = useSWR(`api/users/${id || currentUser?.id}`, fetcher);
	if (!user) {
		return <FourOhFour />;
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
						setModalText={setModalText}
					/>
					<LadderProgressBar user={user} />
					<Divider />
					<Achievements user={user} />
					{!!modalText && (
						<ConfirmationModal
							title={modalText}
							accept={
								!modalText.includes("Error")
									? "Continue"
									: "Close"
							}
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
					)}
				</>
			)}
		</Layout>
	);
}
