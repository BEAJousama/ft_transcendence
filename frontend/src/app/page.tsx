"use client";
import React, { useContext, useEffect, useState } from "react";

import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { AppContext, deleteCookieItem, getCookieItem } from "@/context/app.context";
import CountUp from "react-countup";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

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
		role: "Full Stack Developer",
		image: "/img/obeaj.jpg",
		linkedin: "ousama-b-a8a84a247",
		github: "BEAJousama",
		instagram: "obeaj29",
	},
	{
		name: "Soufiane El Marsi",
		role: "Front End Developer",
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
	const [disabled, setDisabled] = useState(false);

	useEffect(() => {
		if (navigator.cookieEnabled === false) {
			toast.error(
				<Link
					href="https://support.google.com/accounts/answer/61416"
					target="_blank"
					rel="noopener noreferrer"
				>
					<div className="text-sm w-full h-full">
						<p className="text-lg font-semibold animate-pulse">
							Cookies are disabled !
						</p>
						Please enable cookies and refresh the page to use this website.
					</div>
				</Link>,
				{ autoClose: false, closeOnClick: false }
			);
			setSelectable(false);
			setDisabled(true);
			return;
		}
		if (authenticated && user && getCookieItem("complete_info")) {
			setDisabled(true);
			setState("complete");
		} else if (authenticated && user) {
			setDisabled(true);
			router.push("/home");
		}
		const fetchStats = async () => {
			const res = await axios.get(`${process.env.BACK_END_URL}api/users/stats`);
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
			setTimeout(() => setSlide(2), 1000);
		}
	}, [state]);

	return (
		<div className="scrollbar-hide flex min-h-screen w-screen flex-col items-center overflow-x-hidden bg-secondary-900">
			<div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.08),transparent_35%)]" />
			<div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(100,116,139,0.1),transparent_40%)]" />
			<div className="fixed inset-0 flex items-center justify-center opacity-20">
				<LottiePlayer
					loop
					autoplay
					src="/anim/handJoystick.json"
					style={{ width: "100%", height: "100%", opacity: 0.3 }}
				/>
			</div>
			<div className="z-10 mt-8 grid h-fit w-[94%] max-w-6xl grid-cols-1 place-items-center justify-center gap-8 rounded-2xl border border-white/[0.06] bg-secondary-700/60 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl md:mt-10 md:gap-10 md:p-8 lg:grid-cols-2">
				<div className="flex w-full max-w-xs items-center justify-center py-8 lg:col-span-2 lg:max-w-xl">
					<Image
						src="/img/Logo.svg"
						priority
						alt="Pong Maters"
						width={400}
						height={45}
						className="animate-fade"
					/>
				</div>
				<div className="flex h-full w-full flex-col items-center justify-center">
					<div className="flex w-full max-w-xl flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-secondary-800/70 backdrop-blur-sm p-5 transition duration-500 ease-out md:p-6">
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
								disabled={disabled}
							/>
							<Register registrOk={() => setState("complete")} />
							{state === "2fa" && <Tfa tfaOk={() => setOk(true)} />}
							{state === "complete" && (
								<CompleteInfo completeOk={() => setOk(true)} />
							)}
						</Carousel>
					</div>
				</div>
				<div className="flex h-fit w-full max-w-xl flex-col items-center justify-between gap-5">
					<div className="grid grid-cols-2 w-full place-items-end gap-4 px-4 py-2 text-right">
						<CountUp end={numUsers} duration={4}>
							{({ countUpRef }) => (
								<div className="w-full">
									<span ref={countUpRef} className="text-5xl font-bold text-primary-400" />
									<span className="text-sm text-secondary-300 ml-1">Users</span>
								</div>
							)}
						</CountUp>
						<CountUp end={numGames} duration={6}>
							{({ countUpRef }) => (
								<div className="w-full">
									<span ref={countUpRef} className="text-5xl font-bold text-primary-400" />
									<span className="text-sm text-secondary-300 ml-1">Games</span>
								</div>
							)}
						</CountUp>
					</div>
					<p className="w-full rounded-2xl border border-white/[0.06] bg-secondary-800/60 p-5 text-sm leading-relaxed text-secondary-200 md:text-base">
						Pong Maters is a multiplayer online game that allows you to play Pong with
						your friends and other players around the world. Our platform is designed to
						provide you with a fun and competitive gaming experience. Our user-friendly
						interface and integrated chat feature ensure a seamless gaming experience.
						Get ready to paddle up, score points, and rise to the top as you participate
						in the ultimate Pong challenge. May the best player win!
					</p>
					<Link
						href="https://github.com/Hicham-BelHoucin/ft_transcendence"
						className="rounded-xl border border-white/[0.06] bg-secondary-800 px-5 py-3 transition-all duration-200 hover:bg-secondary-700 hover:border-primary-400/20"
						target="_blank"
						rel="noopener noreferrer"
					>
						<Image src="/img/githubCard.svg" width={120} height={40} alt={"Github"} />
					</Link>
					<Image src="/img/tech.png" width={250} height={50} alt={"Technologies"} />
				</div>
			</div>
			<div className="z-10 mt-8 grid w-[94%] max-w-6xl place-items-center justify-center gap-8 rounded-2xl border border-white/[0.06] bg-secondary-700/50 px-6 pb-12 pt-8 shadow-2xl shadow-black/25 backdrop-blur-xl md:grid-cols-3 md:px-8">
				<div className="flex flex-wrap justify-center text-justify md:col-span-3">
					<h1 className="mb-6 text-3xl font-bold text-primary-400 tracking-tight md:text-4xl">Meet the Team</h1>
					<p className="w-full text-sm leading-relaxed text-secondary-200 md:text-base">
						We are a vibrant group of talented students hailing from the prestigious{" "}
						<Link
							href={"https://1337.ma/"}
							target={"_blank"}
							rel={"noopener noreferrer"}
							className="font-semibold text-primary-400 underline decoration-primary-400/30 underline-offset-2"
						>
							1337 Coding School
						</Link>{" "}
						in Morocco, part of the global{" "}
						<Link
							href={"https://42.fr/"}
							target={"_blank"}
							rel={"noopener noreferrer"}
							className="font-semibold text-primary-400 underline decoration-primary-400/30 underline-offset-2"
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
			<div className="z-10 my-10 flex h-16 items-center justify-center">
				<p className="text-secondary-200 text-base font-medium z-10">Crafted with</p>
				<div className="-mx-12">
					<LottiePlayer
						autoplay
						loop
						src="/anim/heart.json"
						style={{ width: "140px", height: "140px" }}
					/>
				</div>
				<p className="text-secondary-200 text-base font-medium z-10">from</p>
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
