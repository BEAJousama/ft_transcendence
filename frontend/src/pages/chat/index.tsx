import { BiX } from "react-icons/bi";
import { Button, Card, ChannelList, CreateGroupModal, Input, MessageBubble } from "../../components";
import Welcome from "../../components/chat/welcome";
import Sidepanel from "../../components/side-panel";
import { SocketContext } from "../../context/socket.context";
import { useContext, useEffect, useState } from "react";
import { useMedia } from "react-use";
import { ChatContext } from "../../context/chat.context";
import { AppContext } from "../../context/app.context";
import Modal from "../../components/modal"
import Layout from "../layout";

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

  return (
    <Layout className="!py-0 !overflow-y-hidden">
      <div className="grid grid-cols-9 h-full w-full">
        {!open && (
          <ChannelList
            className="col-span-8 animate-fade-right"
            setCurrentChannel={setCurrentChannel}
            setChannelMember={setChannelMember}
            setShowModal={setShowModal}
            />
          )}
        {(currentChannel && Object.keys(currentChannel!).length ) ? <MessageBubble className="mt-4 mb-4 pb-5" currentChannel={currentChannel} setOpen={setOpen} channelMember={channelMember}/>
      : 
        < Welcome className="mt-4 mb-4 pb-3" />
      }
        {showModal && <CreateGroupModal setShowModal={setShowModal} />}
      </div>
    </Layout>
  );
}
