"use client";
import React, { useContext, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { AppContext, deleteCookieItem } from "@/context/app.context";
import CountUp from "react-countup";
import axios from "axios";
import { useRouter } from "next/navigation";

import { Carousel, Login, Register } from "@/components";
import LandingPageSelector from "@/components/landing-page-selector";
const Contributor = dynamic(() => import("@/components/contributor"), { ssr: false });
const Tfa = dynamic(() => import("@/components/tfa"), { ssr: false });
const CompleteInfo = dynamic(() => import("@/components/complete-info"), { ssr: false });

const LottiePlayer = dynamic(
	() => import("@lottiefiles/react-lottie-player").then((mod) => mod.Player),
	{ ssr: false }
);

const Contributors = [
	{
		name: "Hicham Bel Houcin",
		role: "Full Stack Developer",
		image: "/img/hbel-hou.jpg",
		linkedin: "hicham-bel-houcin",
		github: "Hicham-BelHoucin",
		instagram: "hicham_belhoucin",
	},
	{
		name: "Oussama Beaj",
		role: "Developer",
		image: "/img/obeaj.jpg",
		linkedin: "ousama-b-a8a84a247",
		github: "BEAJousama",
		instagram: "obeaj29",
	},
	{
		name: "Soufiane El Marsi",
		role: "Developer",
		image: "/img/sel-mars.jpg",
		linkedin: "soufiane-el-marsi",
		github: "soofiane262",
		instagram: "soufiane.elmarsi",
	},
];

const LandingPage = () => {
	const router = useRouter();
	const [slide, setSlide] = useState(0);
	const { user, authenticated } = useContext(AppContext);
	const [selectable, setSelectable] = useState(true);
	const [numUsers, setNumUsers] = useState(0);
	const [numGames, setNumGames] = useState(0);
	const [state, setState] = useState<"login" | "register" | "2fa" | "complete">("login");
	const [ok, setOk] = useState(false);

	useEffect(() => {
		if (authenticated && user && user.createdAt !== user.updatedAt) router.push("/home");
		const fetchStats = async () => {
			const res = await axios.get(`${process.env.NEXT_PUBLIC_BACK_END_URL}api/users/stats`);
			setNumUsers(res.data.users);
			setNumGames(res.data.games);
		};
		fetchStats();
	}, []);

	useEffect(() => {
		if (ok) {
			if (state === "2fa") deleteCookieItem("2fa_access_token");
			setTimeout(() => {
				router.push("/home");
			}, 1000);
		}
	}, [ok]);

	useEffect(() => {
		if (state === "login") setSlide(0);
		else if (state === "register") setSlide(1);
		else {
			setSelectable(false);
			setTimeout(() => {
				setSlide(2);
			}, 1000);
		}
	}, [state]);

	return (
		<div className="overflow-auto scrollbar-hide flex flex-col items-center w-screen h-screen bg-secondary-700">
			<div className="fixed inset-0 flex items-center justify-center opacity-30">
				<LottiePlayer
					loop
					autoplay
					src="/anim/handJoystick.json"
					style={{ width: 100 + "%", height: 100 + "%", opacity: 0.3 }}
				/>
			</div>
			<div className="grid w-full max-w-5xl h-fit grid-cols-1 place-items-center justify-center gap-8 md:gap-16 p-8 lg:grid-cols-2 z-10 backdrop-blur-sm backdrop-opacity-10">
				<div className="flex w-full max-w-xs items-center justify-center lg:col-span-2 lg:max-w-xl py-16">
					<Image
						src="/img/logo.svg"
						priority
						alt="Pong Maters"
						width={400}
						height={45}
						className="animate-fade"
					/>
				</div>
				<div className="flex flex-col items-center justify-center w-full h-full">
					<div className="flex flex-col items-center justify-center w-full h-full transition duration-500 ease-out">
						<LandingPageSelector
							state={state}
							setState={setState}
							selectable={selectable}
						/>
						<Carousel
							swipeable={false}
							chevrons={false}
							slide={slide}
							className="w-full h-full animate-fade-down animate-ease-out"
						>
							<Login
								setSelectable={setSelectable}
								setState={setState}
								loginOk={() => setOk(true)}
							/>
							<Register registrOk={() => setState("complete")} />
							{state === "2fa" && <Tfa tfaOk={() => setOk(true)} />}
							{state === "complete" && (
								<CompleteInfo completeOk={() => setOk(true)} />
							)}
						</Carousel>
					</div>
				</div>
				<div className="flex flex-col items-center justify-between w-full h-fit">
					<div className="grid grid-cols-2 w-full place-items-end gap-4 px-4 py-2 text-right">
						<CountUp end={numUsers} duration={4}>
							{({ countUpRef }) => (
								<div className="w-full">
									<span
										ref={countUpRef}
										className="text-6xl font-semibold text-primary-400"
									/>
									<span className="text-base text-primary-600"> Users</span>
								</div>
							)}
						</CountUp>
						<CountUp end={numGames} duration={6}>
							{({ countUpRef }) => (
								<div className="w-full">
									<span
										ref={countUpRef}
										className="text-6xl font-semibold text-primary-400"
									/>
									<span className="text-base text-primary-600"> Games</span>
								</div>
							)}
						</CountUp>
					</div>
					<p className="text-primary-500 w-full text-lg">
						Pong Maters is a multiplayer online game that allows you to play Pong with
						your friends and other players around the world. Our platform is designed to
						provide you with a fun and competitive gaming experience. Our user-friendly
						interface and integrated chat feature ensure a seamless gaming experience.
						Get ready to paddle up, score points, and rise to the top as you participate
						in the ultimate Pong challenge. May the best player win!
					</p>
					<Link
						href="https://github.com/Hicham-BelHoucin/ft_transcendence"
						className="p-4"
						target="_blank"
						rel="noopener noreferrer"
					>
						<Image
							src="/img/githubCard.svg"
							width={120}
							height={40}
							alt={"Github"}
							className="animate-flip-down animate-delay-[2000ms]"
						/>
					</Link>
					<Image
						src="/img/techs.png"
						width={260}
						height={50}
						alt={"Technologies"}
						className="animate-fade"
					/>
				</div>
			</div>
			<div className="grid md:grid-cols-3 w-full max-w-5xl place-items-center justify-center px-8 pb-16 pt-4 gap-8">
				<div className="flex flex-wrap justify-center text-justify md:col-span-3 z-20">
					<h1 className="text-primary-400 text-4xl font-bold mb-8">Meet the Team</h1>
					<p className="text-primary-600 w-full text-lg">
						We are a vibrant group of talented students hailing from the prestigious{" "}
						<Link
							href={"https://1337.ma/"}
							target={"_blank"}
							rel={"noopener noreferrer"}
							className="underline text-primary-500 font-semibold"
						>
							1337 Coding School
						</Link>{" "}
						in Morocco, part of the global{" "}
						<Link
							href={"https://42.fr/"}
							target={"_blank"}
							rel={"noopener noreferrer"}
							className="underline text-primary-500 font-semibold"
						>
							42 Network
						</Link>{" "}
						an institution renowned for its innovative educational approach and
						groundbreaking impact on the tech industry.
						<br />
						At 1337, we embrace innovative self-directed learning and collaboration,
						honing our technical and soft skills. Powered by peer-to-peer evaluation and
						a growth mindset, we thrive in creating meaningful projects that shape the
						future of technology.
					</p>
				</div>
				{Contributors.map((contributor, index) => (
					<Contributor key={index} {...contributor} />
				))}
			</div>
			<div className="flex items-center justify-center h-16">
				<p className="text-gray-200 text-lg font-medium z-10">Crafted with</p>
				<div className="-mx-12">
					<LottiePlayer
						autoplay
						loop
						src="/anim/heart.json"
						style={{ width: "140px", height: "140px" }}
					/>
				</div>
				<p className="text-gray-200 text-lg font-medium z-10">from</p>
				<div className="px-2">
					<LottiePlayer
						autoplay
						loop
						src="/anim/moroccanFlag.json"
						style={{ width: "24px", height: "24px" }}
					/>
				</div>
			</div>
		</div>
	);
};

export default LandingPage;
