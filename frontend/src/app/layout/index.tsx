"use client"

import { twMerge } from "tailwind-merge";
import { Sidepanel } from "../../components";

// Below md the side panel becomes a top bar (h-14) plus an off-canvas drawer,
// so the content takes the full width; from md up it is a sticky rail column.
const Layout = ({ children, className,
    onContextMenu,
}: {
    children: React.ReactNode;
    className?: string;
    onContextMenu?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}) => {
    return (
        <div className="min-h-screen w-full bg-secondary-900 md:grid md:grid-cols-10 2xl:grid-cols-12" onContextMenu={onContextMenu}>
            <Sidepanel className="md:col-span-2" />
            <main className={twMerge("min-h-[calc(100dvh-3.5rem)] min-w-0 overflow-x-hidden overflow-y-auto px-4 py-6 scrollbar-hide md:col-span-8 md:min-h-screen md:px-8 md:py-10 2xl:col-span-10", className)}>
                {children}
            </main>
        </div>
    )
}

export default Layout;
