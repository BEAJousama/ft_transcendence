import { ChannelList, CreateGroupModal, MessageBubble } from "../../components";
import Welcome from "../../components/chat/welcome";
import { useContext, useEffect, useState } from "react";
import { useMedia } from "react-use";
import { ChatContext } from "../../context/chat.context";
import { AppContext, fetcher } from "../../context/app.context";
import Layout from "../layout"; 

export default function Chat() {
  const [open, setOpen] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const  isMatch = useMedia("(min-width:1024px)", false);
  const [currentChannel, setCurrentChannel] = useState<any>({});
  const [channelMember, setChannelMember] = useState<any>([]);
  const { user } = useContext(AppContext);
  const {socket} = useContext(ChatContext);
  const [isMuted, setIsMuted] = useState<boolean>(false);


  useEffect(() => {
    if (currentChannel?.id === undefined) return;
    fetcher(`api/channels/member/${user?.id}/${currentChannel?.id}`)
      .then((data) => {
        setChannelMember(data);
        setIsMuted(data?.status === "MUTED");
      }
    );
  }, [currentChannel, user?.id]);

useEffect(() => {
    socket?.on('channel_member', (data: any) => {
      setChannelMember(data);
      setIsMuted(data?.status === "MUTED");
    });

    socket?.on('channel_join', (data: any) => {
      setCurrentChannel(data);
    });
  
    socket?.on('current_ch_update', (data: any) => {
      if (data?.id === currentChannel?.id )
      {
        setCurrentChannel(data);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {

    socket?.emit('check_mute', {userId : user?.id, channelId : currentChannel?.id});
    socket?.on('check_mute', (data: any) => {
      if (data === false) {
        setIsMuted(!isMuted);
        socket?.off('check_mute');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <Layout className="!py-0 !overflow-y-hidden">
      {
        !isMatch ?
        (
          <div className="grid grid-cols-10 h-full w-full">
            {(!open) && (
              <ChannelList
                className="animate-fade-right"
                setCurrentChannel={setCurrentChannel}
                setChannelMember={setChannelMember}
                setShowModal={setShowModal}
                setOpen={setOpen} 
                />
            )}
            <MessageBubble className="mt-4 mb-4 ml-1 pb-5" currentChannel={currentChannel} setOpen={setOpen} setCurrentChannel={setCurrentChannel} channelMember={channelMember}/>
            {showModal && <CreateGroupModal setShowModal={setShowModal} />}
          </div>
        ) :
        (
          <div className="grid grid-cols-10 h-full w-full">
            <ChannelList
              className="animate-fade-right"
              setCurrentChannel={setCurrentChannel}
              setChannelMember={setChannelMember}
              setShowModal={setShowModal}
              setOpen={setOpen}
              />
          {(currentChannel && Object.keys(currentChannel!).length ) ? <MessageBubble className="mt-4 mb-4 pb-5 ml-1" setCurrentChannel={setCurrentChannel} 
            currentChannel={currentChannel} setOpen={setOpen} channelMember={channelMember}/>
          : 
            < Welcome className="mt-4 mb-4 pb-3 ml-1" />
          }
            {showModal && <CreateGroupModal setShowModal={setShowModal} />}
          </div>
        )
      }
    </Layout>
  );
}
