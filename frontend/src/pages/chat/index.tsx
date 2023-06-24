import { BiX } from "react-icons/bi";
import { Button, ChannelList, CreateGroupModal, MessageBubble } from "../../components";
import Welcome from "../../components/chat/welcome";
import Sidepanel from "../../components/side-panel";
import { SocketContext } from "../../context/socket.context";
import { useContext, useEffect, useState } from "react";
import { useMedia } from "react-use";
import { ChatContext } from "../../context/chat.context";
import { AppContext } from "../../context/app.context";

export default function Chat() {
  const [open, setOpen] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const  isMatch = useMedia("(max-width:1024px)", false);
  const [currentChannel, setCurrentChannel] = useState<any>({});
  const [channelMember, setChannelMember] = useState<any>([]);
  const { user } = useContext(AppContext);
  const socket = useContext(ChatContext);
  const [error, setError] = useState<any>("");
  const [isMuted, setIsMuted] = useState<boolean>(false);


  useEffect(() => {
    socket?.emit('channel_member', {userId : user?.id, channelId : currentChannel?.id });
    socket?.on('channel_member', (data: any) => {
      setChannelMember(data);
      setIsMuted(data?.status === "MUTED");
    }
    );
    socket?.on('current_ch_update', (data: any) => {
      setCurrentChannel(data);
    }
    );
    if (isMuted) {
      socket?.emit("check_mute", {userId : user?.id, channelId : currentChannel?.id});
      socket?.on("check_mute", (data: any) => {
        if (data === false) {
          setIsMuted(!isMuted);
          socket?.off("check_mute");
          socket?.emit("unmute_user", {userId : user?.id, channelId : currentChannel?.id});
        }
      });
    }
  }, [channelMember, socket, currentChannel]);

  useEffect(() => {
    let timeoutId : any = null;
    socket?.on("error", (data: any) => {
      setError(data);
       timeoutId = setTimeout(() => {
         setError("");
        }, 4000);
    });
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="grid grid-cols-10 h-screen w-screen bg-secondary-500 overflow-hidden">
      {!open && <Sidepanel className="col-span-2 2xl:col-span-1" />}
      {
        error &&
        (
          <div className="fixed inset-0 z-20 flex justify-end items-start mt-4 mr-4">
          <div className="bg-red-500 text-white px-4 py-2 rounded-md">
            <p className="font-bold mb-2">Error:</p>
            <p>{error}</p>
          </div>
          </div>
        )
      }
      {!open && (
        <ChannelList
          className="col-span-8 animate-fade-right"
          setCurrentChannel={setCurrentChannel}
          setChannelMember={setChannelMember}
          setShowModal={setShowModal}
          />
        )}
      {(currentChannel && Object.keys(currentChannel!).length ) ? <MessageBubble className="mt-4 mb-4 pb-3" currentChannel={currentChannel} setOpen={setOpen} channelMember={channelMember}/>
    : 
      < Welcome className="mt-4 mb-4 pb-3" />
    }
      {showModal && <CreateGroupModal setShowModal={setShowModal} />}
    </div>
  );
}
