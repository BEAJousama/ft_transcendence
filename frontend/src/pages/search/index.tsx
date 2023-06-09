import { Input, Sidepanel, Spinner } from "../../components";
import { UserBanner } from "../home";
import useSWR from "swr";
import { fetcher } from "../../context/app.context";

export default function Search() {
    const { data: users, isLoading } = useSWR("api/users", fetcher);

    return (
        <div className="grid h-screen w-screen grid-cols-10 bg-secondary-500">
            <Sidepanel className="col-span-2 2xl:col-span-1" />
            <div className="col-span-8 flex h-screen flex-col items-center gap-4 overflow-y-scroll  px-4 py-16 scrollbar-hide md:gap-8">
                <div className="flex w-full max-w-[500px] flex-col items-center justify-center gap-4">
                    <Input className="w-full" />
                    <div className="flex w-full flex-col items-center justify-center gap-2">
                        {isLoading ? (
                            <Spinner />
                        ) : (
                            users?.length &&
                            users.map((item: any) => {
                                return (
                                    <UserBanner
                                        key={item.id}
                                        user={item}
                                        showRating
                                        rank={item.rating}
                                    />
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
