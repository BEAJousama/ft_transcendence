import { ChannelList, CreateGroupModal, MessageBubble } from "../../components";
import Sidepanel from "../../components/side-panel";
import { SocketContext } from "../../context/socket.context";
import { useContext, useEffect, useState } from "react";
import { useMedia } from "react-use";

export default function Chat() {
  const [open, setOpen] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  let   isMatch = useMedia("(min-width:1024px)", false);
  const [currentChannel, setCurrentChannel] = useState<any>({});
  const [channelMember, setChannelMember] = useState<any>([]);
  const { user } = useContext<any>(SocketContext);
  const socket = useContext(SocketContext);


  useEffect(() => {
    socket?.emit('channel_member', {userId : user?.id, channelId : currentChannel.id });
    socket?.on('channel_member', (data: any) => {
      console.log(data);
      setChannelMember(data);
    }
    );
    socket?.on('set_admin', (data: any) => {
      setCurrentChannel(data);
    }
    );
  }, [channelMember, socket, currentChannel]);

  //add logic to get current channel

  return (
    <div className="grid grid-cols-10 h -screen w-screen bg-secondary-500 overflow-hidden">
      {!open && <Sidepanel className="col-span-2 2xl:col-span-1" />}
      {!open && (
        <ChannelList
          // className="col-span-8 "
          setCurrentChannel={setCurrentChannel}
          setChannelMember={setChannelMember}
          setShowModal={setShowModal}
          />
        )}
      {(open || isMatch) && <MessageBubble currentChannel={currentChannel} setOpen={setOpen} channelMember={channelMember}/>}
      {showModal && <CreateGroupModal setShowModal={setShowModal} />}
    </div>
  );
}
