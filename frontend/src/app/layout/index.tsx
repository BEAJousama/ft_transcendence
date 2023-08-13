"use client"


import { twMerge } from "tailwind-merge";
import { Sidepanel } from "../../components";

const Layout = ({ children, className,
    onContextMenu,
}: {
    children: React.ReactNode;
    className?: string;
    onContextMenu?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}) => {
    return (
        <div className="grid h-screen w-screen grid-cols-10 2xl:grid-cols-12 bg-secondary-50" onContextMenu={onContextMenu}>
            <Sidepanel className="col-span-2" />
            <div className={twMerge("col-span-8 2xl:col-span-10 h-screen overflow-y-scroll px-4 py-16 scrollbar-hide", className)}>
                {children}
            </div>
        </div>
    )
}

export default Layout;