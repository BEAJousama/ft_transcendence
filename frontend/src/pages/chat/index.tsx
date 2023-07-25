import { ChannelList, CreateGroupModal, MessageBubble } from "../../components";
import Welcome from "../../components/chat/welcome";
import { useContext, useEffect, useRef, useState } from "react";
import { useMedia } from "react-use";
import { ChatContext, Ichannel, IchannelMember, IchatContext, Imessage } from "../../context/chat.context";
import { AppContext, IAppContext, fetcher } from "../../context/app.context";
import Layout from "../layout"; 

export default function Chat() {
  const [open, setOpen] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const  isMatch = useMedia("(min-width:1024px)", false);
  const [currentChannel, setCurrentChannel] = useState<Ichannel>({} as Ichannel);
  const [channelMember, setChannelMember] = useState<IchannelMember>({} as IchannelMember);
  const { user } = useContext<IAppContext>(AppContext);
  const {socket} = useContext<IchatContext>(ChatContext);
  const [isMuted, setIsMuted] = useState<boolean>(channelMember?.status === "MUTED");
  const [messages, setMessages] = useState<Imessage[]>([]);
  const [channelId, setChannelId] = useState<number | undefined>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentChannel?.id === undefined) return;
    const intervalId = setInterval(() => {
      fetcher(`api/channels/member/${user?.id}/${currentChannel?.id}`)
        .then((data) => {
          setChannelMember(data);
          setIsMuted(data?.status === "MUTED");
        });
    }, 300);
    return () => clearInterval(intervalId);
  });

  const sortMessages = (messages: Imessage[]) => {
    return messages.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  };


  useEffect(() => {
    socket?.emit('reset_mssg_count', {channelId: currentChannel?.id});
    socket?.on("getChannelMessages", (mssg: Imessage[]) => {
      if (mssg[0]?.receiverId === currentChannel?.id)
      {
        setMessages(sortMessages(mssg));
      }
      else
        setMessages(sortMessages(messages));
    });

    socket?.on('channel_member', (data: IchannelMember) => {
      setChannelMember(data);
      setIsMuted(data?.status === "MUTED");
    });

    socket?.on('channel_leave', (data: Ichannel) => {
      if (data?.id === currentChannel?.id)
      {
        setCurrentChannel({} as Ichannel);
        setOpen(false);
      }
    });

    socket?.on('channel_join', (data: Ichannel) => {
      setCurrentChannel(data);
    });

    socket?.on("channel_remove", (data: Ichannel) => {
      if (data?.id === currentChannel?.id)
      {
        setCurrentChannel({} as Ichannel);
        setOpen(false);
      }
    });

    socket?.on("channel_create", () => {
      if (!isMatch)
        setOpen(true);
    });

    socket?.on("dm_create", () => {
      if (!isMatch)
        setOpen(true);
    });

    socket?.on('current_ch_update', (data: Ichannel) => {
      setChannelId(data?.id);
      if (channelId === currentChannel?.id) {
        setCurrentChannel(data);
      }
      else
      {
        setCurrentChannel(currentChannel);
      }
    });
  });

  useEffect(() => {
    if (isMuted === true)
    {
      socket?.emit('check_mute', {userId : user?.id, channelId : currentChannel?.id});
      socket?.on('check_mute', (data: boolean) => {
        if (data !== isMuted) {
          setIsMuted(data);
          socket?.off('check_mute');
        }
      });
    }
  });

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
                setMessages={setMessages}
                inputRef={inputRef}
                />
            )}
            {
            currentChannel && Object.keys(currentChannel!).length &&  
            <MessageBubble className="mt-4 mb-4 ml-1 pb-5" currentChannel={currentChannel} setOpen={setOpen} setCurrentChannel={setCurrentChannel} channelMember={channelMember} messages={messages} inputRef={inputRef}/>
            }
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
              setMessages={setMessages}
              inputRef={inputRef}
              />
          {(currentChannel && Object.keys(currentChannel!).length) ? <MessageBubble className="mt-4 ml-1" setCurrentChannel={setCurrentChannel} 
            currentChannel={currentChannel} setOpen={setOpen} channelMember={channelMember} messages={messages} inputRef={inputRef}/>
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