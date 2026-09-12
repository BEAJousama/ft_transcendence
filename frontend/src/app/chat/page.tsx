"use client";

import { ChannelList, CreateGroupModal, MessageBubble, ChatV2 } from "../../components";
import Welcome from "../../components/chat/welcome";
import { useContext, useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useMedia } from "react-use";
import { ChatContext, Ichannel, IchatContext, IchannelMember, Imessage } from "../../context/chat.context";
import { AppContext, IAppContext, fetcher } from "../../context/app.context";
import Layout from "../layout/index";
import IUser from "../../interfaces/user";

export default function Chat() {
  const isChatV2Enabled = process.env.NEXT_PUBLIC_CHAT_V2_ENABLED === "true";
  const [open, setOpen] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const isMatch = useMedia("(min-width:1024px)", false);
  const [currentChannel, setCurrentChannel] = useState<Ichannel | undefined>({} as Ichannel);
  const { socket } = useContext<IchatContext>(ChatContext);
  const [messages, setMessages] = useState<Imessage[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useContext<IAppContext>(AppContext);

  const [blocking, setBlocking] = useState<any[]>(user?.blocking?.map((blocking) => { return blocking.blockerId }) as any[]);
  const [blocked, setBlocked] = useState<any[]>(user?.blockers?.map((blocker) => { return blocker.blockingId }) as any[]);

  const conversationTargetId = useMemo(() => {
    if (currentChannel?.type !== "CONVERSATION") return undefined;
    return currentChannel?.channelMembers?.find((member: IchannelMember) => member.userId !== user?.id)?.user?.id;
  }, [currentChannel, user?.id]);

  const isBlocked = currentChannel?.type === "CONVERSATION" && blocked.includes(conversationTargetId);
  const isBlocking = currentChannel?.type === "CONVERSATION" && blocking.includes(conversationTargetId);
  const [users, setUsers] = useState<IUser[]>([]);

  const fetchUsers = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    const getUsers = async () => {
      await fetchUsers();
    }
    getUsers();
  }, [fetchUsers]);

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

  const handleSocketEvent = useCallback(async () => {
    const [blockingUsers, blockedUsers] = await Promise.all([getBlocking(), getBlocked()]);
    setBlocking(blockingUsers || []);
    setBlocked(blockedUsers || []);
    socket?.emit("get_client_messages", { channelId: currentChannel?.id });
    await fetchUsers();
  }, [getBlocking, getBlocked, socket, currentChannel?.id, fetchUsers]);

  useEffect(() => {
    if (!socket) return;

    if (currentChannel?.id) {
      socket.emit("reset_mssg_count", { channelId: currentChannel.id });
    }

    const handleChannelMessages = (mssg: Imessage[]) => {
      if (mssg?.[0]?.receiverId === currentChannel?.id) {
        setMessages(mssg);
      }
    };

    const handleMessage = (data: Imessage) => {
      if (data?.receiverId !== currentChannel?.id) return;
      setMessages((prev) => [...(prev || []), data]);
    };

    const handleChannelExit = (data: Ichannel | { id: number }) => {
      if (data?.id !== currentChannel?.id) return;
      setCurrentChannel({} as Ichannel);
      setOpen(false);
    };

    const handleChannelJoin = (data: { channel: Ichannel; messages: Imessage[] }) => {
      setCurrentChannel(data.channel);
      setMessages(data.messages);
    };

    const handleChannelCreate = () => {
      if (!isMatch) setOpen(true);
      setMessages([]);
    };

    const handleCurrentChannelUpdate = (data: Ichannel) => {
      if (data?.id === currentChannel?.id) {
        setCurrentChannel(data);
      }
    };

    socket.on("getChannelMessages", handleChannelMessages);
    socket.on("get_client_messages", handleChannelMessages);
    socket.on("message", handleMessage);
    socket.on("channel_leave", handleChannelExit);
    socket.on("kick_user", handleChannelExit);
    socket.on("channel_remove", handleChannelExit);
    socket.on("channel_join", handleChannelJoin);
    socket.on("channel_create", handleChannelCreate);
    socket.on("dm_create", handleChannelCreate);
    socket.on("current_ch_update", handleCurrentChannelUpdate);
    socket.on("blockUser", handleSocketEvent);

    return () => {
      socket.off("getChannelMessages", handleChannelMessages);
      socket.off("get_client_messages", handleChannelMessages);
      socket.off("message", handleMessage);
      socket.off("channel_leave", handleChannelExit);
      socket.off("kick_user", handleChannelExit);
      socket.off("channel_remove", handleChannelExit);
      socket.off("channel_join", handleChannelJoin);
      socket.off("channel_create", handleChannelCreate);
      socket.off("dm_create", handleChannelCreate);
      socket.off("current_ch_update", handleCurrentChannelUpdate);
      socket.off("blockUser", handleSocketEvent);
    };
  }, [socket, currentChannel?.id, isMatch, handleSocketEvent]);

  return (
    <Layout className="!py-0 !px-0 !overflow-hidden !h-[calc(100dvh-3.5rem)] !min-h-0 md:!h-screen">

      {isChatV2Enabled ? (
        <ChatV2 />
      ) : (
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
                <MessageBubble className="!mt-3 !mr-3 !mb-0 ml-1" currentChannel={currentChannel} setOpen={setOpen} setCurrentChannel={setCurrentChannel}
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
              {(currentChannel && Object.keys(currentChannel!).length) ? <MessageBubble className="!mt-3 !mr-3 !mb-0 ml-1" setCurrentChannel={setCurrentChannel}
                currentChannel={currentChannel} setOpen={setOpen} messages={messages} inputRef={inputRef} isBlocked={isBlocked} isBlocking={isBlocking} checkBlock={checkBlock} users={users} />
                :
                < Welcome className="mt-4 mb-4 pb-3 ml-1" setShowModal={setShowModal} />
              }
              {showModal && <CreateGroupModal setShowModal={setShowModal} users={users} />}
            </div>
          )
      )}
    </Layout>
  );
}