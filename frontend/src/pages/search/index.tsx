import { useEffect, useState } from "react";
import { Input, Sidepanel, Spinner } from "../../components";
import axios from "axios";
import { UserBanner } from "../home";

export default function Search() {
    const [users, setUsers] = useState<any[] | undefined>(undefined);
    useEffect(() => {
        (async () => {
            const accessToken = window.localStorage.getItem("access_token"); // Replace with your actual access token
            const response = await axios.get(
                `${process.env.REACT_APP_BACK_END_URL}api/users`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            if (response.data) {
                setUsers(response.data);
                console.log(response.data)
            }
        })()
    }, [])
    return (
        <div className="grid h-screen w-screen grid-cols-10 bg-secondary-500">
            <Sidepanel className="col-span-2 2xl:col-span-1" />
            <div className="col-span-8 flex h-screen flex-col items-center gap-4 overflow-y-scroll  px-4 py-16 scrollbar-hide md:gap-8">
                <div className="w-full flex flex-col items-center justify-center max-w-[500px] gap-4">
                    <Input className="w-full" />
                    <div className="w-full flex items-center justify-center flex-col gap-2">
                        {users?.length &&
                            users.map((item) => {
                                return <UserBanner key={item.id} user={item} showRating rank={item.rating} />
                            })
                        }
                        {!users && (
                            <Spinner className="!static !h-auto" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
