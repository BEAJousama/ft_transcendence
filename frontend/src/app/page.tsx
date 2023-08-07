"use client";
import React, { useContext, useEffect, useState } from "react";
import { Carousel, Login, SignUp, CompleteInfo, TwoFactorAuth, Spinner } from "@/components";
import { Button } from "@/components";
import { twMerge } from "tailwind-merge";
import Image from "next/image";
import { AppContext } from "@/context/app.context";
import Link from "next/link";
import { IoLogoGithub, IoLogoInstagram, IoLogoLinkedin } from "react-icons/io5";
import { redirect } from "next/navigation";
if (typeof window !== "undefined") require("@lottiefiles/lottie-player");

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

	if (authenticated && user && user.createdAt !== user.updatedAt) {
		console.log("to home");
		redirect("/home");
	}

	return (
		<div className="overflow-auto scrollbar-hide relative flex flex-col items-center w-screen h-screen bg-secondary-500">
			<div className="absolute flex h-screen w-screen items-center justify-center">
				<lottie-player
					autoplay
					loop
					mode="normal"
					intermission={3000}
					src="/lottie/handJoystick.json"
					style={{ width: 100 + "%", height: 100 + "%", opacity: 0.3 }}
				/>
			</div>
			<div className="grid w-full max-w-5xl h-fit grid-cols-1 place-items-center justify-center gap-8 md:gap-16 p-8 lg:grid-cols-2 z-10 backdrop-blur-sm backdrop-opacity-10">
				<div className="flex w-full max-w-xs items-center justify-center lg:col-span-2 lg:max-w-xl py-16">
					<img src="/img/Logo.svg" alt="logo" className={"w-[80%]"} />
				</div>
				<div className="relative flex flex-col items-center justify-center w-full h-full">
					{loading && (
						<Spinner className="absolute flex items-center justify-center w-full h-full transition duration-300 ease-out z-20" />
					)}
					<div
						className={twMerge(
							"flex flex-col items-center justify-center w-full h-[600px] transition duration-500 ease-out",
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
							<SignUp />
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
				</div>
			</div>
			<div className="relative flex flex-wrap justify-center text-center w-full max-w-5xl px-8 py-16">
				<h1 className="text-primary-400 text-4xl font-bold mb-8">Meet the Team</h1>
				<p className="text-primary-600 w-full text-lg font-light">
					We are a group of students from the{" "}
					<Link
						href={"https://1337.ma/"}
						target={"_blank"}
						rel={"noopener noreferrer"}
						className="underline text-primary-500 font-semibold"
					>
						1337 Coding School
					</Link>{" "}
					in Morocco.
					<br />
					We are passionate about coding and we love to create new things.
					<br />
					We created this project to learn more about web development and to develop our
					skills.
				</p>
			</div>
			<div className="grid md:grid-cols-3 w-full place-items-center justify-center px-24 py-16 gap-8">
				<div className="flex flex-col px-4">
					<img
						className="rounded-2xl drop-shadow-md hover:drop-shadow-xl transition-all duration-200 delay-100"
						src="https://images.unsplash.com/photo-1634926878768-2a5b3c42f139?fit=clamp&w=400&h=400&q=80"
					/>

					<div className="flex flex-col items-center justify-center text-center">
						<h1 className="text-gray-100 text-xl font-bold">Hicham Bel Houcin</h1>

						<div className="text-gray-300 font-light">
							<span className="text-primary-300">Full Stack Developer</span> |{" "}
						</div>

						<div
							className="grid grid-cols-3 w-fit place-items-center gap-4 opacity-70 hover:opacity-100
                                transition-opacity duration-300"
						>
							<Link
								href="#"
								className="text-gray-300 hover:text-primary-300 transition"
							>
								<IoLogoLinkedin size={"20px"} />
							</Link>
							<Link
								href="#"
								className="text-gray-300 hover:text-primary-300 transition"
							>
								<IoLogoGithub size={"20px"} />
							</Link>
							<Link
								href="#"
								className="text-gray-300 hover:text-primary-300 transition"
							>
								<IoLogoInstagram size={"20px"} />
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LandingPage;
