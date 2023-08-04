"use client"


import { twMerge } from "tailwind-merge";
import Image from "next/image";


const Container = ({
    children,
    title,
    icon,
    className,
}: {
    children?: React.ReactNode;
    title: string;
    icon: string;
    className?: string;
}) => {
    return (
        <div className="flex w-full max-w-[800px] animate-fade-right flex-col gap-2 md:w-full mt-4">
            <div className="relative flex h-[500px] rounded-lg border-[1px] border-secondary-400 ">
                <img
                    src={icon}
                    alt="icon"
                    className="absolute -top-10 left-1/2 -translate-x-1/2 transform "
                />
                <span className="absolute left-1/2 top-2 z-10 -translate-x-1/2 transform text-sm font-bold text-white md:text-xl">
                    {title}
                </span>
                <div
                    className={twMerge(
                        "absolute top-12 flex h-[90%] w-full flex-col gap-2 overflow-y-auto overflow-x-hidden px-2 scrollbar-hide md:gap-4",
                        className
                    )}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Container;
