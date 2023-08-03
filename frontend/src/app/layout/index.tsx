import { twMerge } from "tailwind-merge";
import { Sidepanel } from "../../components";

const Layout = ({ children, className }: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div className="grid h-screen w-screen grid-cols-10 2xl:grid-cols-12 bg-secondary-50" >
            <Sidepanel className="col-span-2" />
            <div className={twMerge("col-span-8 2xl:col-span-10 h-screen overflow-y-scroll px-4 py-16 scrollbar-hide", className)}>
                {children}
            </div>
        </div>
    )
}

export default Layout;