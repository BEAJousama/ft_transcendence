"use client"

import { twMerge } from "tailwind-merge";

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
        <div className="mt-4 flex w-full max-w-[880px] animate-fade-right flex-col gap-3 md:w-full">
            <div className="relative flex h-[500px] rounded-2xl border border-white/[0.06] bg-secondary-700 shadow-xl shadow-black/20 overflow-hidden">
                <div className="absolute inset-x-0 top-0 flex items-center justify-center gap-2 bg-secondary-800/60 backdrop-blur-sm py-3 px-4 border-b border-white/[0.04] z-10">
                    <img
                        src={icon}
                        alt="icon"
                        className="h-6 w-6 object-contain"
                    />
                    <span className="text-sm font-semibold text-secondary-50 tracking-tight">
                        {title}
                    </span>
                </div>
                <div
                    className={twMerge(
                        "absolute top-14 flex h-[calc(100%-3.5rem)] w-full flex-col gap-2 overflow-y-auto overflow-x-hidden px-3 pb-3 scrollbar-hide md:gap-3",
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
