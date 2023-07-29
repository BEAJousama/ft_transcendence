import { useContext, useEffect, useState } from "react";
import { Avatar, Button, Card, RightClickMenu, RightClickMenuItem, Spinner } from "../../components";
import { AppContext, fetcher } from "../../context/app.context";
import Layout from "../layout";
import useSwr from "swr";
import IUser from "../../interfaces/user";
import React from "react";
import { INotification } from "../../context/socket.context";
import { Link } from "react-router-dom";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useClickAway } from "react-use";
import clsx from "clsx";

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
    // const markAsRead = () => {
    //     console.log("Mark as read");
    // };

    // const removeNotification = () => {
    //     console.log("Remove notification");
    // };


    const toastId = React.useRef<HTMLDivElement>(null);
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

    const [show, setShow] = useState<boolean>(false)
    useClickAway(toastId, () => {
        setShow(false)
    })


    return (
        <div
            className="relative flex w-full items-center justify-between gap-4 rounded-full  bg-tertiary-500 max-w-[500px] overflow-hidden"
            role="alert"
            ref={toastId}
        >
            <Link to={url} className="w-full flex items-center justify-between gap-4">
                <Avatar src={sender.avatar} alt="" className="!h-[70px] !w-[70px]" />
                <div className="w-full flex flex-col truncate">
                    <p className="text-white md:text-lg leading-4">{title}</p>
                    <p className="text-tertiary-200 text-xs md:text-base ">
                        {content || sender.fullname}
                    </p>
                    <p className="text-xs text-primary-500">{timeAgoString}</p>
                </div>
            </Link>
            {show && (
                <div className="absolute -bottom-16 -right-20 z-10">
                    <RightClickMenu className="!static">
                        <RightClickMenuItem>Mark as read</RightClickMenuItem>
                        <RightClickMenuItem>Remove Notification</RightClickMenuItem>
                    </RightClickMenu>
                </div>
            )}
            <Button className="!bg-tertiary-500 !hover:bg-tertiary-500 rounded-full" onClick={() => {
                setShow(prev => !prev)
            }}>
                <BsThreeDotsVertical />
            </Button>
        </div>
    );
};

export default function Notifications() {

    const { user } = useContext(AppContext);

    const { data, isLoading } = useSwr(
        `api/notification/${user?.id}`,
        fetcher
    );
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [filter, setFilter] = useState<boolean>(false);

    useEffect(() => {
        if (!filter)
            setNotifications(data);
        else {
            setNotifications(data?.filter((notification: INotification) => {
                return notification.seen === false
            }))
        }
    }, [data, filter]);

    return (
        <Layout>
            <div className="flex w-full items-center justify-center">
                <Card className="w-full flex flex-col gap-4 !max-w-[680px] !bg-secondary-600 border-none h-[90vh] shadow-md shadow-secondary-800 overflow-auto scrollbar-hide">
                    <h1 className="text-2xl text-bold text-white">Notifications</h1>
                    {/* <div className="flex gap-2">
                        <Button className={
                            clsx("!bg-tertiary-500 !hover:bg-tertiary-500 rounded-full", !filter && "!text-primary-500")
                        } onClick={() => {
                            setFilter(false)
                        }}>
                            All
                        </Button>
                        <Button className={
                            clsx("!bg-tertiary-500 !hover:bg-tertiary-500 rounded-full", filter && "!text-primary-500")
                        } onClick={() => {
                            setFilter(true)
                        }}>
                            Unread
                        </Button>
                    </div> */}
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
