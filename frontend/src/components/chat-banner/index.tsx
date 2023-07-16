import { useContext, useState } from "react";
import { AppContext } from "../../context/app.context";
import { ChatContext } from "../../context/chat.context";
import Avatar from "../avatar";
import AvatarGroup from "../avatarGroup";
import Button from "../button";
import { BsKeyFill, BsFillPeopleFill } from "react-icons/bs";
import Input from "../input";
import { useNavigate } from 'react-router-dom';
import Card from "../card";

const ChatBanner = ({
    channel,
}: {
    channel?: any;
}) => {
    const navigate = useNavigate();
    const { user } = useContext(AppContext);
    const {socket} = useContext(ChatContext);
    const [password, setPassword] = useState("");
    const [showModal, setshowModal] = useState(false);
    const channelMembers = channel?.channelMembers?.filter((member : any) =>
    {
        return member.status === "ACTIVE";
    });
    const handleJoin = () => {
        if (channel?.visiblity === "PROTECTED") {
            setshowModal(true);
        } else 
        {
            socket?.emit("channel_join", { channelId: channel?.id, userId: user?.id });
            socket?.emit('channel_member', {userId : user?.id, channelId : channel?.id });
            navigate(`/chat`);
        }
    };
    
    const handleLeave = () => {
        socket?.emit("channel_leave", { channelId: channel?.id, userId: user?.id });
        socket?.emit('channel_member', {userId : user?.id, channelId : channel?.id });
        navigate(`/chat`);      
    };
    return (
        <>
        <div className="flex flex-col  gap-2 border-2 border-secondary-400 rounded-md p-2 sm:p-4 shadow-sm shadow-secondary-400 max-w-[500px] w-full">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="w-full">
                    <div className="text-white text-lg ">{channel?.name}</div>
                    <div className="flex items-center text-sm text-tertiary-200 justify-between w-full sm:justify-start sm:gap-4">
                        <div>{channelMembers?.length} Members</div>
                        <div className="flex items-center gap-2">
                            {channel?.visiblity === "PROTECTED" && <BsKeyFill />}
                            <BsFillPeopleFill /> {channel?.visiblity}
                        </div>
                    </div>
                </div>
                {
                    !channelMembers?.map((item: any) => item.userId).includes(user?.id) || channel?.kickedUsers.map((u : any) => u.id).includes(user?.id) ?
                    <Button onClick={handleJoin} className="w-full sm:w-auto ">Join</Button>
                    :
                    <Button onClick={handleLeave} className="w-full sm:w-auto ">Leave</Button>
                    
                }
            </div>
            <AvatarGroup max={3}>
                {
                    channelMembers &&
                    channelMembers?.map((item: any) => {
                        return (<Avatar key={item.userId} src={item.user.avatar} alt={item.user.username} />)
                    }
                    ) 
                }
            </AvatarGroup>
        </div>
            { showModal && (
                <Card
                setShowModal={setshowModal}
                className="z-10 bg-secondary-800 border-none flex flex-col items-center justify-start shadow-lg shadow-secondary-500 gap-4 text-white min-w-[90%] lg:min-w-[40%] xl:min-w-[50%] animate-jump-in animate-ease-out animate-duration-400 max-w-[100%] w-full"
                >
                    <span className="text-md">This channel is protected</span>
                    <div className="flex flex-col justify-center items-center w-full">
                        <Input
                            label="Password"
                            className="h-[40px] w-[80%] rounded-md border-2 border-primary-500 text-white text-xs bg-transparent md:mr-2"
                            type="password"
                            placeholder="*****************"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            />
                        <Button
                            className="h-8 w-auto md:w-20 bg-primary-500 text-white text-xs rounded-full mt-2"
                            onClick={() => {
                                socket?.emit("channel_join", {channelId: channel?.id, userId: user?.id, password: password});
                                socket?.emit('channel_member', {userId : user?.id, channelId : channel?.id });
                                setshowModal(false);
                                navigate(`/chat`);      
                            }}
                            >
                            <span className="text-xs">Join</span>
                        </Button>
                    </div>
                </Card>
                )
            }
        </>
        
    );
};

export default ChatBanner;
