import { useContext } from "react";
import { Avatar, Card, Spinner } from "../../components";
import { AppContext, fetcher } from "../../context/app.context";
import Layout from "../layout";
import useSwr from "swr";
import IUser from "../../interfaces/user";
import { INotification } from "../../context/socket.context";
import { Link } from "react-router-dom";

const Notification = ({
    id,
    title,
    content,
    sender,
    createdAt,
    url,
}: {
    id: number;
    title: string;
    content: string;
    sender: IUser;
    createdAt: Date;
    url: string;
}) => {

    const timeDifference = Math.floor(
        (Date.now() - new Date(createdAt).getTime()) / 1000
    ); // Calculate the time difference in seconds

    let timeAgoString = "";
    if (timeDifference < 60) {
        timeAgoString = `${timeDifference} seconds ago`;
    } else if (timeDifference < 3600) {
        const minutes = Math.floor(timeDifference / 60);
        timeAgoString = `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    } else if (timeDifference < 86400) {
        const hours = Math.floor(timeDifference / 3600);
        timeAgoString = `${hours} hour${hours === 1 ? "" : "s"} ago`;
    } else {
        const days = Math.floor(timeDifference / 86400);
        timeAgoString = `${days} day${days === 1 ? "" : "s"} ago`;
    }


    return (
        <div
            className="grid w-full items-center justify-between gap-4 rounded-full  bg-tertiary-500 max-w-[500px] overflow-hidden"
            role="alert"
        >
            <Link to={url} className="w-full flex items-center justify-between gap-4">
                <Avatar src={sender.avatar} alt="" className="h-[70px] w-[70px]" />
                <div className="flex flex-col truncate">
                    <p className="text-white md:text-lg leading-4">{title}</p>
                    <p className="text-tertiary-200 text-xs md:text-base ">
                        {content || sender.fullname}
                    </p>
                    <p className="text-xs text-primary-500">{timeAgoString}</p>
                </div>
            </Link>
        </div>
    );
};

export default function Notifications() {

    const { user } = useContext(AppContext);

    const { data: notifications, isLoading } = useSwr(
        `api/notification/${user?.id}`,
        fetcher
    );


    return (
        <Layout>
            <div className="flex w-full items-center justify-center">
                <Card className="w-full flex flex-col gap-4 !max-w-[680px] !bg-secondary-600 border-none h-[90vh] shadow-md shadow-secondary-800 overflow-auto scrollbar-hide">
                    <h1 className="text-2xl text-bold text-white">Notifications</h1>

                    {isLoading ? (
                        <Spinner />
                    ) : (
                        <div className="flex w-full flex-col items-center justify-center gap-4">
                            {notifications?.filter((notif: INotification) => user?.id !== notif.sender?.id).map((notification: INotification) => {
                                return (
                                    <Notification key={notification.id} {...notification} />
                                );
                            })}
                        </div>
                    )}
                </Card>
            </div>
        </Layout>
    );
}