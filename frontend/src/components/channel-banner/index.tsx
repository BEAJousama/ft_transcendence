import { useMedia } from "react-use";
import Avatar from "../avatar";
import clsx from "clsx";
import Button from "../button";
import { AppContext } from "../../context/app.context";
import { useContext, useState } from "react";
import { ChatContext } from "../../context/chat.context";
import Modal from "../modal";
import Card from "../card";
import Input from "../input";
import { Link } from "react-router-dom";

const ChannelBanner = ({
    showRank,
    rank,
    showRating,
    channel,
}: {
    showRank?: boolean;
    showRating?: boolean;
    rank?: number;
    channel?: any;
}) => {
    const isMatch = useMedia("(max-width: 530px)");
    const {user} = useContext(AppContext);
    const  socket= useContext(ChatContext);
    const [password, setPassword] = useState("");
    const [showModal, setshowModal] = useState(false);

    const handleJoin = () => {
        if (channel.visiblity === "PROTECTED") {
            setshowModal(true);
        } else 
            socket?.emit("channel_join", {channelId: channel.id, userId: user?.id});
    }

    return (
        <div className="my-3 flex h-12 w-full items-center gap-2 justify-between rounded-full bg-tertiary-500">
            <Avatar
                src={channel?.avatar || ""}
                className="h-16 w-16"
                alt=""
            />
            {showRank && (
                <div className="w-[20%]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary-500 text-white">
                        {rank}
                    </div>
                </div>
            )}
            <div
                className={clsx(
                    "flex w-full flex-col items-start justify-center text-white md:p-4",
                    !showRating && "!items-start"
                )}
            >
                <span
                    className={clsx(
                        "max-w-[80px] truncate text-left text-xs sm:max-w-full",
                        !isMatch && showRating && "!max-w-[150px]",
                        !isMatch && !showRating && "!max-w-full",
                        true && "!xl:max-w-full !w-full"
                    )}
                >
                    {channel.name || ""}
                </span>
            </div>
            {
                !channel.channelMembers?.map((item: any) => item.userId).includes(user?.id) &&
                <Button
                    className="h-8 w-20 bg-primary-500 text-white text-xs rounded-full mr-4"
                    onClick={handleJoin}
                >
                    <span className="text-xs">Join</span>
                </Button>
            }
            { showModal && (
                <Card
                    setShowModal={setshowModal}
                    className="z-10 bg-secondary-800 
                    border-none flex flex-col items-center justify-start shadow-lg shadow-secondary-500 gap-4 text-white min-w-[90%]
                     lg:min-w-[40%] xl:min-w-[800px] animate-jump-in animate-ease-out animate-duration-400"
                >
                    <span className="text-xs">This channel is protected</span>
                    <Input
                        className="h-[40px] rounded-md border-2 border-primary-500 text-white text-xs bg-transparent"
                        type="text"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        />
                    <Button
                        className="h-8 w-20 bg-primary-500 text-white text-xs rounded-full mr-4"
                        onClick={() => {
                            socket?.emit("channel_join", {channelId: channel.id, userId: user?.id, password: password});
                            setshowModal(false);
                        }}
                        >
                        <span className="text-xs">Join</span>
                    </Button>
                </Card>
                )
                }
            {/* <div
                className={clsx(
                    "flex items-center gap-2 pr-8 text-xs text-white",
                    (isMatch || !showRating) && "hidden"
                )}
            >
                {channel?.rating}
                <img src="/img/smalllogo.svg" alt="logo" width={20} />
            </div> */}
        </div>
    );
};

export default ChannelBanner;