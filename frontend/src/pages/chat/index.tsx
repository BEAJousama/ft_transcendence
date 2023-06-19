<<<<<<< HEAD
import { BiX } from "react-icons/bi";
import { Button, ChannelList, CreateGroupModal, MessageBubble } from "../../components";
import Welcome from "../../components/chat/welcome";
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
  const [error, setError] = useState<any>("");


  useEffect(() => {
    socket?.emit('channel_member', {userId : user?.id, channelId : currentChannel?.id });
    socket?.on('channel_member', (data: any) => {
      setChannelMember(data);
    }
    );
    socket?.on('set_admin', (data: any) => {
      setCurrentChannel(data);
    }
    );
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
          <div className="fixed inset-0 z-20 flex justify-end items-start pt-4 pr-4">
          <div className="bg-red-500 text-white px-4 py-2 rounded-md">
            <p className="font-bold mb-2">Error:</p>
            <p>{error}</p>
          </div>
          </div>
        )
      }
      {!open && (
        <ChannelList
          // className="col-span-8 "
          setCurrentChannel={setCurrentChannel}
          setChannelMember={setChannelMember}
          setShowModal={setShowModal}
          />
        )}
      {(currentChannel && Object.keys(currentChannel!).length ) ? <MessageBubble currentChannel={currentChannel} setOpen={setOpen} channelMember={channelMember}/>
    : 
      < Welcome />
    }
      {showModal && <CreateGroupModal setShowModal={setShowModal} />}
    </div>
=======
import Layout from "../layout";

export default function Chat() {
  return (
    <Layout>

    </Layout>
>>>>>>> fa560532b3c64f59bbb3aafdb5d7187bb303b463
  );
}
