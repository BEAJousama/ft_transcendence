import { useContext, useEffect, useState } from "react";
import Channel from "./channel";
import {IAppContext, fetcher} from "../../context/app.context"
import { AppContext } from "../../context/app.context";
import {BsFillChatLeftTextFill} from "react-icons/bs";
import {BiFilter} from "react-icons/bi";
import { ChatContext, Ichannel, IchannelMember, IchatContext } from "../../context/chat.context";
import clsx from "clsx";
import Modal from "../modal";
import Input from "../input";
import Button from "../button";
import axios from "axios";
import { toast } from "react-toastify";
import { throttle } from "lodash";
import React from "react";

interface ChannelListProps {
  className?: string;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentChannel: any;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setMessages: any;
  inputRef?: any;
  checkBlock: any;
}


const ChannelList : React.FC<ChannelListProps> = ({className, setShowModal, setCurrentChannel, setOpen, setMessages, inputRef, checkBlock} : ChannelListProps) => {
  
  const[channels, setChannels] = useState<Ichannel[]>([]);
  const [archiveChannels, setArchiveChannels] = useState<Ichannel[]>([]);
  const [showArchive, setShowArchive] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("")
  const [selectedChannel, setSelectedChannel] = useState<Ichannel | undefined>({} as Ichannel)
  const [modal, setModal] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [tempChannel, setTempChannel] = useState<Ichannel>();
  const {socket} = useContext<IchatContext>(ChatContext);
  const {user} = useContext<IAppContext>(AppContext)
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const iRef = React.useRef<HTMLInputElement>(null);

  // const checkBlock = async (userId : number | undefined) =>
  // {
  //   const blockers = await fetcher(`api/users/${user?.id}/blocking-users`);
  //   const blocking = await fetcher(`api/users/${user?.id}/blocked-users`);
  //   return (blockers[0]?.blockingId === userId || blocking[0]?.blockerId === userId)
  // }

  const loadMessages = async (channelId: number | undefined) => {
    const messages = fetcher(`api/messages/${channelId}/${user?.id}`)
    return messages;
  }


  
  const onClick = throttle(async (channel: Ichannel): Promise<void | undefined> => {
    socket?.emit('reset_mssg_count', {channelId: channel.id});
    const [member, messages] = await Promise.all([
      fetcher(`api/channels/member/${user?.id}/${channel.id}`),
      loadMessages(channel.id)
    ]);
  
    socket?.emit("channel_member", {channelId: channel.id, userId: user?.id});
    if (channel.isacessPassword && member.role !== "OWNER") {
      if (selectedChannel && selectedChannel.id === channel.id) {
        setOpen(true);
        setCurrentChannel(channel);
        setSelectedChannel(channel);
        setMessages(messages);
        inputRef?.current?.focus();
      } else {
        setModal(true);
        setTempChannel(channel);
      }
    } else {
      setOpen(true);
      setCurrentChannel(channel);
      setSelectedChannel(channel);
      setMessages(messages);
      inputRef?.current?.focus();
    }
    //eslint-disable-next-line
  }, 1000);

  const accessChannel = async () => {
    const accesstoken = window.localStorage.getItem("access_token");
    const res = await axios.post(`${process.env.REACT_APP_BACK_END_URL}api/channels/checkpass`,
                                  {password, channelId: tempChannel?.id},
                                  {headers: {Authorization: `Bearer ${accesstoken}`}});
    if(res.data === true)
    {
      setOpen(true);
      setCurrentChannel(tempChannel);
      setSelectedChannel(tempChannel);
      const messages = await loadMessages(tempChannel?.id);
      setMessages(messages);
      inputRef?.current?.focus();
    }
    else
    {
      toast.error("Wrong access password !");
    }
  }

  useEffect(() => {
    fetcher(`api/channels/${user?.id}`)
    .then((channels) => {
      channels.forEach((channel: Ichannel) => {
        if (channel.type === "CONVERSATION") {
            channel.name = channel.channelMembers?.filter((member: IchannelMember) => member.userId !== user?.id)[0].user?.username;
            channel.avatar = channel.channelMembers?.filter((member: IchannelMember) => member.userId !== user?.id)[0].user?.avatar;
        }
      });
      channels.sort((a: Ichannel, b: Ichannel) => {
        if (a.updatedAt < b.updatedAt) return 1;
        else return -1;
      });
      setChannels(channels);
    });

    fetcher(`api/channels/archived/${user?.id}`)
    .then((channels) => {
      channels.sort((a: Ichannel, b: Ichannel) => {
        if (a.updatedAt < b.updatedAt) return 1;
        else return -1;
      });
      setArchiveChannels(channels); 
    });
  }, [socket, user?.id]);

  useEffect(() => {
    if (search === "") {
      getuserChannels();
      getNewChannel();
      getArchiveChannels();
    }
    socket?.on('channel_leave', () => {
      setCurrentChannel();
      inputRef?.current?.blur();
      setOpen(false);
    });

    socket?.on('channel_access', (data: Ichannel) => {
        setOpen(true);
        setCurrentChannel(data);
        setSelectedChannel(data);
        socket?.emit('getChannelMessages', {channelId: data.id});
        inputRef?.current?.focus();
    });
    
    socket?.on('channel_delete', () => {
      setCurrentChannel();
      inputRef?.current?.blur();
      setOpen(false);
    });

    socket?.on('block-user', () => {

    });
    return () => {
      socket?.off('channel_leave');
      socket?.off('channel_delete');
      socket?.off('channel_remove');
      socket?.off('getChannels');
      socket?.off('getArchiveChannels');
      socket?.off('channel_create');
      socket?.off('dm_create');
      socket?.off('channel_member');
    }
    //eslint-disable-next-line
  });

  const getuserChannels = async () => {
        socket?.on('getChannels', (channels: Ichannel[]) => {
          if (!channels) return;   
          channels?.forEach((channel: Ichannel) => {
            if (channel.type === "CONVERSATION") {
              channel.name = channel.channelMembers?.filter((member: IchannelMember) => member.userId !== user?.id)[0].user?.username;
              channel.avatar = channel.channelMembers?.filter((member: IchannelMember) => member.userId !== user?.id)[0].user?.avatar;
            }
          });
          channels?.sort((a: Ichannel, b: Ichannel) => {
            if (a.updatedAt < b.updatedAt) return 1;
            else return -1;
          });
          setChannels(channels);
        });
  }
      
  const getArchiveChannels = async () => {
    socket?.on('getArchiveChannels', (channels: Ichannel[]) => {
      if (!channels) return;   
      channels?.sort((a: Ichannel, b: Ichannel) => {
        if (a.updatedAt < b.updatedAt) return 1;
        else return -1;
      });
      setArchiveChannels(channels); 
  });
}


  const getNewChannel = async () => {
    socket?.on('channel_create', (channel: Ichannel) => {
        setCurrentChannel(channel);
        setSelectedChannel(channel);
        inputRef?.current?.focus();

      });
      socket?.on('dm_create', (channel: Ichannel) => {
        setCurrentChannel(channel);
        setSelectedChannel(channel);
        inputRef?.current?.focus();

    });
  }

  const onChange = (e: any) => {
    e.preventDefault();
    setSearch(e.target.value)
    if (search.trim() !== "") {
      setChannels(channels.filter((item: Ichannel) => item.name.toLowerCase().includes(search.toLowerCase())));
    } else {
      getuserChannels();
    }
  }

  return (
  <>
    <div className={clsx("lg:col-span-3 relative col-span-10 flex flex-col justify-start gap-4 py-2 w-full h-screen overflow-y-scroll scrollbar-hide", className && className)}>
      <div className=" sticky top-0 z-30 flex items-center gap-2 w-full pr-2 bg-secondary-600 py-2">
        <form className="pl-4 pr-1 w-full">
                <div className="relative">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="absolute top-0 bottom-0 w-6 h-6 my-auto text-secondary-400 text-xs left-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search chats..."
                        className="w-full py-2 pl-12 pr-4 text-secondary-400 border border-tertiary-700 rounded-md outline-none bg-secondary-300 focus:text-primary-400 focus:border-primary-200 placeholder-secondary-400 placeholder-text-sm"
                        value={search}
                        onChange={onChange}
                        onKeyDown={
                          (e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              inputRef?.current?.blur();
                        }
                      }
                    }
                    />
                </div>
            </form>
            <BsFillChatLeftTextFill style={{color: "#727587", fontSize: "30px", cursor: "pointer"}}
            onClick={
              () => {
                setShowModal(true);
              }
            }/>
            <BiFilter
            style={{ color: isFocused ? "#E5AC7C" : "#727587", fontSize: "40px", cursor: "pointer" }}
            onClick={
              () => {
                setIsFocused(!isFocused);
                setShowArchive(!showArchive);
              }
            }/>
        </div>
      {
        showArchive &&
        (
          <div className="flex items-center flex-col gap-2 text-primary-500 font-bold text-md">
            FILTERED BY ARCHIVED
          </div>
        )
      }

      {
        !showArchive ? 
        (
          
          channels?.filter(
            (channel: Ichannel) => channel.pinnedFor?.map((user: any) => user.id).includes(user?.id)
          )?.map((channel: Ichannel) => {
            const isActive = channel.id === selectedChannel?.id;
            return (
              <Channel
              key={channel.id}
              id={channel.id}
              name={channel.type !== "CONVERSATION" ? channel.name : channel.channelMembers?.filter((member: any) => member.userId !== user?.id)[0].user?.username}
              pinned={channel.pinnedFor?.map((user: any) => user.id).includes(user?.id)}
              muted={channel.mutedFor?.map((user: any) => user.id).includes(user?.id)}
              archived={channel.archivedFor?.map((user: any) => user.id).includes(user?.id)}
              unread={channel.unreadFor?.map((user: any) => user.id).includes(user?.id)}
              avatar={channel.type !== "CONVERSATION" ? channel.avatar :
              channel.channelMembers?.filter((member: IchannelMember) => member.userId !== user?.id)[0].user?.avatar}
              description={(channel.messages  && !(channel.bannedUsers?.map((user:any) => user.id).includes(user?.id)) && !(channel.kickedUsers?.map((user:any) => user.id).includes(user?.id)) )  ? channel.messages[channel.messages.length - 1]?.content : ""}
              updatedAt={
                channel.messages && 
                !channel.bannedUsers?.map((user:any) => user.id).includes(user?.id) && 
                !channel.kickedUsers?.map((user:any) => user.id).includes(user?.id) 
                  ? channel.messages[channel.messages.length - 1]?.date || channel.updatedAt || ""
                  : channel.createAt || ""
              }
              newMessages={channel.channelMembers?.filter((member: IchannelMember) => member.userId === user?.id)[0].newMessagesCount}
              userStatus={channel.type !== "CONVERSATION" ? false : (channel.channelMembers?.filter((member: IchannelMember) => member.userId !== user?.id)[0].user?.status === "ONLINE") && !checkBlock(channel.channelMembers?.filter((member: IchannelMember) => member.userId !== user?.id)[0].user?.id)}
              onClick={(e:any) => {
                e.preventDefault();
                onClick(channel)
              }}
              selected={isActive}
                />
                )
              }).concat(
                      channels?.filter(
                        (channel: Ichannel) => ((!channel.pinnedFor?.map((user: any) => user.id).includes(user?.id)))
                        ).map((channel: Ichannel) => {
                          const isActive = channel.id === selectedChannel?.id;
                          return (
                            <Channel
                            key={channel.id}
                            id={channel.id}
                            name={channel.type !== "CONVERSATION" ? channel.name : channel.channelMembers?.filter((member: IchannelMember) => member.userId !== user?.id)[0].user?.username}
                            pinned={channel.pinnedFor?.map((user: any) => user.id).includes(user?.id)}
                            muted={channel.mutedFor?.map((user: any) => user.id).includes(user?.id)}
                            archived={channel.archivedFor?.map((user: any) => user.id).includes(user?.id)}
                            unread={channel.unreadFor?.map((user: any) => user.id).includes(user?.id)}
                            avatar={channel.type !== "CONVERSATION" ? channel.avatar :
                                    channel.channelMembers?.filter((member: IchannelMember) => member.userId !== user?.id)[0].user?.avatar
                                    }
                            description={(channel.messages  && !(channel.bannedUsers?.map((user:any) => user.id).includes(user?.id)) && !(channel.kickedUsers?.map((user:any) => user.id).includes(user?.id)) )  ? channel.messages[channel.messages.length - 1]?.content : ""}
                            updatedAt={
                              channel.messages && 
                              !channel.bannedUsers?.map((user:any) => user.id).includes(user?.id) && 
                              !channel.kickedUsers?.map((user:any) => user.id).includes(user?.id) 
                                ? channel.messages[channel.messages.length - 1]?.date || channel.updatedAt || ""
                                : channel.createAt || ""
                            }
                            newMessages={channel.channelMembers?.filter((member: IchannelMember) => member.userId === user?.id)[0].newMessagesCount}
                            userStatus={channel.type !== "CONVERSATION" ? false : (channel.channelMembers?.filter((member: IchannelMember) => member.userId !== user?.id)[0].user?.status === "ONLINE") && !checkBlock(channel.channelMembers?.filter((member: IchannelMember) => member.userId !== user?.id)[0].user?.id)}
                            onClick={() => onClick(channel)}
                            selected={isActive}
                              />
                              )
                            })
              )) :
              (
                archiveChannels?.filter(
                  (channel: Ichannel) => channel.pinnedFor?.map((user: any) => user.id).includes(user?.id)
                  )?.map((channel: Ichannel) => {
                    //list the pinned channels first
                    const isActive = channel.id === selectedChannel?.id;
                    return (
                      <Channel
                      key={channel.id}
                      id={channel.id}
                      name={channel.type !== "CONVERSATION" ? channel.name : channel.channelMembers?.filter((member: IchannelMember) => member.userId !== user?.id)[0].user?.username}
                      pinned={channel.pinnedFor?.map((user: any) => user.id).includes(user?.id)}
                      muted={channel.mutedFor?.map((user: any) => user.id).includes(user?.id)}
                    archived={channel.archivedFor?.map((user: any) => user.id).includes(user?.id)}
                    unread={channel.unreadFor?.map((user: any) => user.id).includes(user?.id)}
                    avatar={channel.type !== "CONVERSATION" ? channel.avatar :
                    channel.channelMembers?.filter((member: IchannelMember) => member.userId !== user?.id)[0].user?.avatar
                  }                    
                    description={(channel.messages  && !(channel.bannedUsers?.map((user:any) => user.id).includes(user?.id)) && !(channel.kickedUsers?.map((user:any) => user.id).includes(user?.id)))  ? channel.messages[channel.messages.length - 1]?.content : ""}
                    updatedAt={
                      channel.messages && 
                      !channel.bannedUsers?.map((user:any) => user.id).includes(user?.id) && 
                      !channel.kickedUsers?.map((user:any) => user.id).includes(user?.id) 
                        ? channel.messages[channel.messages.length - 1]?.date || channel.updatedAt || ""
                        : channel.createAt || ""
                    }
                    newMessages={channel.channelMembers?.filter((member: IchannelMember) => member.userId === user?.id)[0].newMessagesCount}
                    userStatus={channel.type !== "CONVERSATION" ? false : (channel.channelMembers?.filter((member: IchannelMember) => member.userId !== user?.id)[0].user?.status === "ONLINE") && !checkBlock(channel.channelMembers?.filter((member: IchannelMember) => member.userId !== user?.id)[0].user?.id)}
                    onClick={() => onClick(channel)}
                    selected={isActive}
                      />
                      )
                    }).concat(
                            archiveChannels?.filter(
                              (channel: Ichannel) => ((!channel.pinnedFor?.map((user: any) => user.id).includes(user?.id)))
                              ).map((channel: Ichannel) => {
                                const isActive = channel.id === selectedChannel?.id;
                                return (
                                  <Channel
                                  key={channel.id}
                                  id={channel.id}
                                  name={channel.type !== "CONVERSATION" ? channel.name : channel.channelMembers?.filter((member: IchannelMember) => member.userId !== user?.id)[0].user?.username}
                                  pinned={channel.pinnedFor?.map((user: any) => user.id).includes(user?.id)}
                                  muted={channel.mutedFor?.map((user: any) => user.id).includes(user?.id)}
                                  archived={channel.archivedFor?.map((user: any) => user.id).includes(user?.id)}
                                  unread={channel.unreadFor?.map((user: any) => user.id).includes(user?.id)}
                                  avatar={channel.type !== "CONVERSATION" ? channel.avatar :
                                  channel.channelMembers?.filter((member: IchannelMember) => member.userId !== user?.id)[0].user?.avatar
                                }                                  
                                description={(channel.messages  && !(channel.bannedUsers?.map((user:any) => user.id).includes(user?.id)) && !(channel.kickedUsers?.map((user:any) => user.id).includes(user?.id)))  ? channel.messages[channel.messages.length - 1]?.content : ""}
                                updatedAt={
                                    channel.messages && 
                                    !channel.bannedUsers?.map((user:any) => user.id).includes(user?.id) && 
                                    !channel.kickedUsers?.map((user:any) => user.id).includes(user?.id) 
                                      ? channel.messages[channel.messages.length - 1]?.date || channel.updatedAt || ""
                                      : channel.createAt || ""
                                }
                                newMessages={channel.channelMembers?.filter((member: IchannelMember) => member.userId === user?.id)[0].newMessagesCount}
                                userStatus={channel.type !== "CONVERSATION" ? false : (channel.channelMembers?.filter((member: IchannelMember) => member.userId !== user?.id)[0].user?.status === "ONLINE") && !checkBlock(channel.channelMembers?.filter((member: IchannelMember) => member.userId !== user?.id)[0].user?.id)}
                                onClick={() => onClick(channel)}
                                selected={isActive}
                                    />
                                    )
                                  })
                                  ))
                                } 
    </div>
    {
      modal && (
        <Modal
        setShowModal={setModal}
        className="z-10 bg-secondary-800 
        border-none flex flex-col items-center justify-start shadow-lg shadow-secondary-500 gap-4 text-white min-w-[90%]
        lg:min-w-[40%] xl:min-w-[800px] animate-jump-in animate-ease-out animate-duration-400">
            <span className="text-md">This channel requires an access password ! </span>
            <div className="flex flex-col justify-center items-center w-full">
                <Input
                    label="Password"
                    className="h-[40px] w-[80%] rounded-md border-2 border-primary-500 text-white text-xs bg-transparent md:mr-2"
                    htmlType="password"
                    placeholder="*****************"
                    value={password}
                    inputRef={iRef}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={
                      (e) => {
                        if (e.key === "Enter") {
                          accessChannel();
                          setModal(false);
                          iRef?.current?.blur();
                          setPassword("");
                        }
                      }
                    }
                    />
                <div className="flex flex-row">
                  <Button
                    className="h-8 w-auto md:w-20 !bg-inherit text-white text-xs rounded-full mt-2 mr-2"
                    onClick={() => {
                        setModal(false);
                        iRef?.current?.blur();
                      }}
                    >
                    <span className="text-xs">Cancel</span>
                  </Button>
                  <Button
                      className="h-8 w-auto md:w-20 bg-primary-500 text-white text-xs rounded-full mt-2"
                      onClick={() => {
                          accessChannel()
                          setModal(false);
                          setPassword("");
                          iRef?.current?.blur();
                        }}
                      >
                      <span className="text-xs">Access</span>
                  </Button>
                </div>
            </div>
        </Modal>
        )
    }
    </>
  );
};

export default ChannelList;
