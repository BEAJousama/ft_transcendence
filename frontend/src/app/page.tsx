"use client";
import React, { useState } from "react";
import { Carousel, Login, SignUp } from "@/components";
import { Button } from "@/components";
import { twMerge } from "tailwind-merge";
import Image from "next/image";

const LandingPage = () => {
  const [login, setLogin] = useState<boolean>(true);

  return (
    <div className="overflow-auto scrollbar-hide flex flex-col items-center w-screen h-screen bg-secondary-500">
      <div className="grid w-full max-w-5xl h-fit grid-cols-1 place-items-center justify-center gap-8 md:gap-16 p-8 lg:grid-cols-2">
        <div className="flex w-full max-w-xs items-center justify-center lg:col-span-2 lg:max-w-xl py-16">
          <img src="/img/Logo.svg" alt="logo" className={"w-[80%]"} />
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="overflow-hidden group relative w-fit rounded-xl shadow-lg shadow-secondary-700">
            <div
              className={twMerge(
                "absolute h-10 bg-primary-600 transition-all duration-500 ease-out",
                login ? "left-0 w-24" : "left-24 w-28"
              )}
            ></div>
            <button
              className={twMerge(
                "relative overflow-hidden h-10 w-24 transition-all duration-500 ease-out",
                login
                  ? "font-semibold text-secondary-700"
                  : "text-secondary-100 before:ease before:absolute before:right-0 before:top-0 before:h-12 before:w-6 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-10 before:duration-700 hover:before:-translate-x-40"
              )}
              disabled={login}
              onClick={() => setLogin(true)}
            >
              Login
            </button>
            <button
              className={twMerge(
                "relative overflow-hidden h-10 w-28 transition-all duration-500 ease-out",
                !login
                  ? "font-semibold text-secondary-700"
                  : "text-secondary-100 before:ease before:absolute before:right-0 before:top-0 before:h-12 before:w-6 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-10 before:duration-700 hover:before:-translate-x-40"
              )}
              disabled={!login}
              onClick={() => setLogin(false)}
            >
              Register
            </button>
          </div>
          <Carousel
            swipeable={false}
            chevrons={false}
            indicators={false}
            slide={login ? 0 : 1}
          >
            <Login />
            <SignUp />
          </Carousel>
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="text-justify text-lg text-primary-500">
            Our user-friendly interface and integrated chat feature
            ensure a seamless gaming experience. Get ready to paddle up,
            score points, and rise to the top as you participate in the
            ultimate Pong challenge. May the best player win!
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
