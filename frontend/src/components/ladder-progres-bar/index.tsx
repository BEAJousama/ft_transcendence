"use client"


import { twMerge } from "tailwind-merge";
import IUser from "../../interfaces/user";
import Image from "next/image";


const icons = [
    "beginner.svg",
    "amateur.svg",
    "semi_professional.svg",
    "professional.svg",
    "world_class.svg",
    "legendary.svg",
];

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
                                className={twMerge(
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
export default LadderProgressBar;