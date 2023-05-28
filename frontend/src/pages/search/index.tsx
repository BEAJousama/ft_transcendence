import { Input, Sidepanel } from "../../components";

export default function Search() {
    return (
        <div className="grid h-screen w-screen grid-cols-10 bg-secondary-500">
            <Sidepanel className="col-span-2 2xl:col-span-1" />
            <div className="col-span-8 flex h-screen flex-col items-center gap-4 overflow-y-scroll  px-4 py-16 scrollbar-hide md:gap-8">
                <div className="w-full flex flex-col items-center justify-center max-w-[500px]">
                    <Input className="w-full" />
                </div>
            </div>
        </div>
    );
}
