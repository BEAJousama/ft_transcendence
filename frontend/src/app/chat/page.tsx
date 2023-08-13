"use client";

import { ChannelList, CreateGroupModal, MessageBubble } from "../../components";
import Welcome from "../../components/chat/welcome";
import { useContext, useEffect, useRef, useState, useCallback } from "react";
import { useMedia } from "react-use";
import { ChatContext, Ichannel, IchatContext, IchannelMember, Imessage } from "../../context/chat.context";
import { AppContext, IAppContext, fetcher } from "../../context/app.context";
import Layout from "../layout/index";
import IUser from "../../interfaces/user";

export default function Chat() {
  const [open, setOpen] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const isMatch = useMedia("(min-width:1024px)", false);
  const [currentChannel, setCurrentChannel] = useState<Ichannel | undefined>({} as Ichannel);
  const { socket } = useContext<IchatContext>(ChatContext);
  const [messages, setMessages] = useState<Imessage[]>([]);
  const [channelId, setChannelId] = useState<number | undefined>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useContext<IAppContext>(AppContext);

  const [blocking, setBlocking] = useState<any[]>(user?.blocking?.map((blocking) => { return blocking.blockerId }) as any[]);
  const [blocked, setBlocked] = useState<any[]>(user?.blockers?.map((blocker) => { return blocker.blockingId }) as any[]);

  const isBlocked = (currentChannel?.type === "CONVERSATION" && blocked.includes(currentChannel?.channelMembers?.filter((member: IchannelMember) => member.userId !== user?.id)[0].user?.id));
  const isBlocking = (currentChannel?.type === "CONVERSATION" && blocking.includes(currentChannel?.channelMembers?.filter((member: IchannelMember) => member.userId !== user?.id)[0].user?.id));
  const [users, setUsers] = useState<IUser[]>([]);

  const fetchUsers = (async () => {
    try {
      if (user === undefined) {
        return;
      }
      const res = await fetcher(`api/users/non-blocked-users/${user?.id}`);
      if (res === undefined) {
        return;
      }
      setUsers(res);
    } catch (err) {
      throw new Error("Error while getting users");
    }
  })

  useEffect(() => {
    const getUsers = async () => {
      await fetchUsers();
    }
    getUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getBlocking = useCallback(async () => {
    try {
      if (user === undefined) {
        return;
      }
      const res = await fetcher(`api/users/${user?.id}/blocking-users`);
      if (res === undefined) {
        return;
      }
      return res.map((blocking: any) => { return blocking?.blockerId });
    } catch (err) {
      throw new Error("Error while getting blocking users");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const getBlocked = useCallback(async () => {
    try {
      if (user === undefined) {
        return;
      }
      const res = await fetcher(`api/users/${user?.id}/blocked-users`);
      if (res === undefined) {
        return;
      }
      return res.map((blocker: any) => { return blocker.blockingId });
    } catch (err) {
      throw new Error("Error while getting blocked users");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const checkBlock = (userId: number | undefined) => {
    return (blocking?.includes(userId) || blocked?.includes(userId));
  }

  useEffect(() => {
    getBlocking().then((blocking) => {
      if (blocking) {
        setBlocking(blocking);
      }
    });
    getBlocked().then((blocked) => {
      if (blocked) {
        setBlocked(blocked);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChannel]);

  const handleSocketEvent = async () => {
    const [blockingUsers, blockedUsers] = await Promise.all([getBlocking(), getBlocked()]);
    setBlocking(blockingUsers || []);
    setBlocked(blockedUsers || []);
    socket?.emit("get_client_messages", { channelId: currentChannel?.id });
    await fetchUsers();
  };

  useEffect(() => {
    socket?.emit('reset_mssg_count', { channelId: currentChannel?.id });
    socket?.on("getChannelMessages", (mssg: Imessage[]) => {
      if (mssg[0]?.receiverId === currentChannel?.id) {
        setMessages(mssg);
      }
      else
        setMessages(messages);
    });

    socket?.on('message', (data: Imessage) => {
      if(data?.receiverId === currentChannel?.id)
        setMessages([...messages, data]);
    }
    );


    socket?.on("get_client_messages", (mssg: Imessage[]) => {
      if (mssg[0]?.receiverId === currentChannel?.id) {
        setMessages(mssg);
      }
      else
        setMessages(messages);
    });

    socket?.on('channel_leave', (data: Ichannel) => {
      if (data?.id === currentChannel?.id) {
        setCurrentChannel({} as Ichannel);
        setOpen(false);
      }
    });

    socket?.on('kick_user', (data: Ichannel) => {
      if (data?.id === currentChannel?.id) {
        setCurrentChannel({} as Ichannel);
        setOpen(false);
      }
    });

    socket?.on('channel_join', (data: {channel : Ichannel, messages : Imessage[]}) => {
      setCurrentChannel(data.channel);
      setMessages(data.messages);
    });

    socket?.on("channel_remove", (data: {id: number}) => {
      if (data?.id === currentChannel?.id)
      {
        setCurrentChannel({} as Ichannel);
        setOpen(false);
      }
    });

    socket?.on("channel_create", () => {
      if (!isMatch)
        setOpen(true);
      setMessages([]);
    });

    socket?.on("dm_create", () => {
      if (!isMatch)
        setOpen(true);
      setMessages([]);
    });

    socket?.on('current_ch_update', (data: Ichannel) => {
      setChannelId(data?.id);
      if (channelId === currentChannel?.id) {
        setCurrentChannel(data);
      }
      else {
        setCurrentChannel(currentChannel);
      }
    });
    socket?.on("blockUser", handleSocketEvent);
    return () => {
      socket?.off("blockUser");
      // socket?.off('channel_member');
      // socket?.off('channel_leave');
      // socket?.off('channel_join');
      // socket?.off('channel_remove');
      // socket?.off('channel_create');
      // socket?.off('dm_create');
      // socket?.off('current_ch_update');
      // socket?.off('getChannelMessages');
      // socket?.off('reset_mssg_count');
    };
  });

  return (
    <Layout className="!py-0 !px-0 !overflow-y-hidden">
      {
        !isMatch ?
          (
            <div className="grid grid-cols-10 h-full w-full ">
              {(!open) && (
                <ChannelList
                  className="animate-fade-right"
                  setCurrentChannel={setCurrentChannel}
                  setShowModal={setShowModal}
                  setOpen={setOpen}
                  setMessages={setMessages}
                  inputRef={inputRef}
                  checkBlock={checkBlock}
                />
              )}
              {
                currentChannel && Object.keys(currentChannel!).length &&
                <MessageBubble className="!mt-3 !mr-3 mb-4 ml-1" currentChannel={currentChannel} setOpen={setOpen} setCurrentChannel={setCurrentChannel}
                  messages={messages} inputRef={inputRef} isBlocked={isBlocked} isBlocking={isBlocking} checkBlock={checkBlock} users={users} />
              }
              {showModal && <CreateGroupModal setShowModal={setShowModal} users={users} />}
            </div>
          ) :
          (
            <div className="grid grid-cols-10 h-full w-full">
              <ChannelList
                className="animate-fade-right"
                setCurrentChannel={setCurrentChannel}
                setShowModal={setShowModal}
                setOpen={setOpen}
                setMessages={setMessages}
                inputRef={inputRef}
                checkBlock={checkBlock}
              />
              {(currentChannel && Object.keys(currentChannel!).length) ? <MessageBubble className="!mt-3 !mr-3 mb-4 ml-1" setCurrentChannel={setCurrentChannel}
                currentChannel={currentChannel} setOpen={setOpen} messages={messages} inputRef={inputRef} isBlocked={isBlocked} isBlocking={isBlocking} checkBlock={checkBlock} users={users} />
                :
                < Welcome className="mt-4 mb-4 pb-3 ml-1" setShowModal={setShowModal} />
              }
              {showModal && <CreateGroupModal setShowModal={setShowModal} users={users} />}
            </div>
          )
      }
    </Layout>
  );
}