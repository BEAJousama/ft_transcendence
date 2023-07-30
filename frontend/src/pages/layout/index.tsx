import { Sidepanel } from "../../components"
import clsx from "clsx";

const Layout = ({ children, className }: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div className="grid h-screen w-screen grid-cols-10 2xl:grid-cols-12 bg-secondary-500">
            <Sidepanel className="col-span-2" />
            <div className={clsx("col-span-8 2xl:col-span-10 h-screen overflow-y-scroll px-8 py-16 scrollbar-hide", className && className)}>
                {children}
            </div>
        </div>
    )
}

export default Layout;