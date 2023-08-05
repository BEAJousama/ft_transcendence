"use client";
import React, { useContext, useEffect, useState } from "react";
import { Carousel, Login, SignUp, CompleteInfo, TwoFactorAuth, Spinner } from "@/components";
import { Button } from "@/components";
import { twMerge } from "tailwind-merge";
import Image from "next/image";
import { AppContext } from "@/context/app.context";

const LandingPage = () => {
	const [slide, setSlide] = useState(1);
	const { user, loading } = useContext(AppContext);
	const [showSpinner, setShowSpinner] = useState(true);

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
		if (getCookieItem("2fa_access_token")) setSlide(0);
		if (!user) return;
		if (user.createdAt === user.updatedAt) setSlide(3);
	}, [user]);

	useEffect(() => {
		if (!loading) {
			setShowSpinner(false);
		} else setShowSpinner(true);
	}, [loading]);

	return (
		<div className="overflow-auto scrollbar-hide flex flex-col items-center w-screen h-screen bg-secondary-500">
			<div className="grid w-full max-w-5xl h-fit grid-cols-1 place-items-center justify-center gap-8 md:gap-16 p-8 lg:grid-cols-2">
				<div className="flex w-full max-w-xs items-center justify-center lg:col-span-2 lg:max-w-xl py-16">
					<img src="/img/Logo.svg" alt="logo" className={"w-[80%]"} />
				</div>
				<div className="relative flex flex-col items-center justify-center w-full h-full">
					{showSpinner && (
						<Spinner
							className={twMerge(
								"absolute flex items-center justify-center w-full h-full transition duration-300 ease-out z-10",
								!loading && "opacity-0"
							)}
						/>
					)}
					<div
						className={twMerge(
							"flex flex-col items-center justify-center w-full h-[600px] transition duration-500 ease-out",
							loading && "opacity-40 blur-sm"
						)}
					>
						<div className="overflow-hidden group relative h-fit w-fit rounded-xl shadow-lg shadow-secondary-700 transition-all duration-200 ease-out">
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
							<TwoFactorAuth selected={slide === 0} />
							<Login selected={slide === 1} />
							<SignUp selected={slide === 2} />
							<CompleteInfo selected={slide === 3} />
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
		</div>
	);
};

export default LandingPage;
