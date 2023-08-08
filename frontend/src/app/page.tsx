"use client";
import React, { useContext, useEffect, useState } from "react";
import {
	Carousel,
	Login,
	SignUp,
	CompleteInfo,
	TwoFactorAuth,
	Spinner,
	Contributor,
} from "@/components";
import { twMerge } from "tailwind-merge";
import Image from "next/image";
import { AppContext } from "@/context/app.context";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Player } from "@lottiefiles/react-lottie-player";
import { BiLogoTypescript } from "react-icons/bi";
import { SiNestjs, SiNextdotjs } from "react-icons/si";
import { FaNode } from "react-icons/fa";
import IUser from "@/interfaces/user";

const LandingPage = () => {
	const [slide, setSlide] = useState(1);
	const { user, loading, authenticated } = useContext(AppContext);

	const getCookieItem = (key: string): string | undefined => {
		const cookieString = document.cookie;
		const cookiesArray = cookieString.split("; ");

		for (const cookie of cookiesArray) {
			const [cookieKey, cookieValue] = cookie.split("=");
			if (cookieKey === key) {
				return decodeURIComponent(cookieValue);
			}
		}

		return undefined;
	};

	useEffect(() => {
		if (getCookieItem("2fa_access_token") && !getCookieItem("access_token")) setSlide(0);
		if (!user) return;
		if (user.createdAt === user.updatedAt) setSlide(3);
	}, [user]);

	const goToCompleteInfo = () => setSlide(3);

	if (authenticated && user && user.createdAt !== user.updatedAt) {
		redirect("/home");
	}

	return (
		<div className="overflow-auto scrollbar-hide flex flex-col items-center w-screen h-screen bg-secondary-700">
			<div className="fixed inset-0 flex items-center justify-center">
				<Player
					autoplay
					loop
					speed={0.4}
					src="/lottie/handJoystick.json"
					style={{ width: "100%", height: "100%", opacity: 0.3 }}
				/>
			</div>
			<div className="grid w-full max-w-5xl h-fit grid-cols-1 place-items-center justify-center gap-8 md:gap-16 p-8 lg:grid-cols-2 z-10 backdrop-blur-sm backdrop-opacity-10">
				<div className="flex w-full max-w-xs items-center justify-center lg:col-span-2 lg:max-w-xl py-16">
					<Image src="/img/Logo.png" alt="Pong Materz" width={400} height={200} />
				</div>
				<div className="flex flex-col items-center justify-center w-full h-full">
					{loading && (
						<Spinner className="absolute flex items-center justify-center w-full h-full transition duration-300 ease-out z-20" />
					)}
					<div
						className={twMerge(
							"flex flex-col items-center justify-center w-full h-full transition duration-500 ease-out",
							loading && "animate-pulse blur-sm"
						)}
					>
						<div className="overflow-hidden group relative h-fit w-fit rounded-xl shadow-lg shadow-secondary-700 transition-all duration-200 ease-out bg-secondary-500">
							<div
								className={twMerge(
									"absolute h-10 bg-primary-600 transition-all duration-500 ease-out",
									slide <= 1 ? "left-0 w-24" : "left-24 w-28"
								)}
							></div>
							<button
								className={twMerge(
									"relative overflow-hidden h-10 w-24 transition-all duration-500 ease-out",
									slide <= 1
										? "font-semibold text-secondary-700"
										: "text-secondary-100 before:ease before:absolute before:right-0 before:top-0 before:h-12 before:w-6 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-10 before:duration-700 hover:before:-translate-x-40"
								)}
								disabled={slide <= 1}
								onClick={() => setSlide(1)}
							>
								Login
							</button>
							<button
								className={twMerge(
									"relative overflow-hidden h-10 w-28 transition-all duration-500 ease-out",
									slide > 1
										? "font-semibold text-secondary-700"
										: "text-secondary-100 before:ease before:absolute before:right-0 before:top-0 before:h-12 before:w-6 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-10 before:duration-700 hover:before:-translate-x-40"
								)}
								disabled={slide > 1}
								onClick={() => setSlide(2)}
							>
								Register
							</button>
						</div>
						<Carousel
							swipeable={false}
							chevrons={false}
							indicators={false}
							slide={slide}
							className="w-full h-full"
						>
							<TwoFactorAuth />
							<Login />
							<SignUp goToCompleteInfo={goToCompleteInfo} />
							<CompleteInfo />
						</Carousel>
					</div>
				</div>

				<div className="flex flex-col items-center justify-center w-full h-fit">
					<p className="text-justify text-lg text-primary-500">
						Our user-friendly interface and integrated chat feature ensure a seamless
						gaming experience. Get ready to paddle up, score points, and rise to the top
						as you participate in the ultimate Pong challenge. May the best player win!
					</p>
					<div className="flex items-center justify-center gap-4 py-4">
						<BiLogoTypescript size={"34px"} className="text-gray-400" />
						<SiNestjs size={"34px"} className="text-gray-400" />
						<SiNextdotjs size={"34px"} className="text-gray-400" />
						<FaNode size={"40px"} className="text-gray-400" />
					</div>
				</div>
			</div>
			<div className="grid md:grid-cols-3 w-full max-w-5xl place-items-center justify-center px-8 pb-16 pt-4 gap-8">
				<div className="flex flex-wrap justify-center text-justify col-span-3 z-20">
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
				<Contributor
					name="Hicham Bel Houcin"
					role="Developer"
					image="/img/hbel-hou.jpg"
					linkedin="hicham-bel-houcin"
					github="Hicham-BelHoucin"
					instagram="hicham_belhoucin"
				/>
				<Contributor
					name="Oussama Beaj"
					role="Developer"
					image="/img/obeaj.jpg"
					linkedin="ousama-b-a8a84a247"
					github="BEAJousama"
					instagram="obeaj29"
				/>
				<Contributor
					name="Soufiane El Marsi"
					role="Developer"
					image="/img/sel-mars.jpg"
					linkedin="soufiane-el-marsi"
					github="soofiane262"
					instagram="soufiane.elmarsi"
				/>
			</div>
			<div className="flex items-center justify-center h-16">
				<p className="text-gray-200 text-lg font-medium z-10">Crafted with</p>
				<div className="-mx-12">
					<Player
						autoplay
						loop
						src="/lottie/heart.json"
						style={{ width: "140px", height: "140px" }}
					/>
				</div>
				<p className="text-gray-200 text-lg font-medium z-10">from</p>
				<div className="px-2">
					<Player
						autoplay
						loop
						src="/lottie/moroccanFlag.json"
						style={{ width: "24px", height: "24px" }}
					/>
				</div>
			</div>
		</div>
	);
};

export default LandingPage;
