import {useContext, useEffect, useState } from "react";
import ProfileBanner from "../profilebanner";
import Channel from "./channel";
import { SocketContext } from "../../context/socket.context";
import { AppContext } from "../../context/app.context";
import {BsFillChatLeftTextFill} from "react-icons/bs";
import {BiFilter} from "react-icons/bi";

const ChannelList = ({setShowModal, setCurrentChannel, setChannelMember} : 
  {setShowModal: any,  setCurrentChannel: any, setChannelMember: any}) => {
  
  const[channels, setChannels] = useState<any>([]);
  const [archiveChannels, setArchiveChannels] = useState<any>([]);
  const [showArchive, setShowArchive] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const socket = useContext(SocketContext);
  let {user, setUser} = useContext(AppContext)
  const [isFocused, setIsFocused] = useState(false);
  
  const onClick = (channel : any) : void | undefined => {
    setCurrentChannel(channel);
    getChannelMember(channel.id);
  }
  useEffect(() => {
    if (search === "") {
      getuserChannels(user?.id);
      getNewChannel();
      getArchiveChannels(user?.id);
    }
    socket?.on('channel_leave', (channels: any) => {
      setCurrentChannel();
      // setChannels(channels);
    });

    socket?.on('channel_delete', (channels: any) => {
      setCurrentChannel();
      // setChannels(channels);
    });

    socket?.on('search_channel', (channels: any) => {
      setChannels(channels);
    }
    );
    socket?.on("connect_user", (data: any) => {
      setUser(data);
    }
    );
    //eslint-disable-next-line
  }, [channels, socket]);
  
  const getuserChannels = async (id: any) => {
    // prefer getting it through http 
    // try {
      //     fetch("http://:3000/api/channel/channels/1").then((res) => {
        //         res.json().then((data) => {
          //             setChannels(data);
    //           });
    //         });
    // } catch (error) {
      //     console.log(error);
      // }
      try {
        socket?.emit('getChannels', {user: {id}});
        socket?.on('getChannels', (channels: any) => {   
        // sort the channels by last updated
        channels.sort((a: any, b: any) => {
          if (a.updatedAt < b.updatedAt) return 1;
          else return -1;
        });

        setChannels(channels);
      }
      );
    } catch (error) { 
      console.log(error);
    }
  }
  
const getArchiveChannels = async (id: any) => {
  try {
    socket?.emit('getArchiveChannels', {user: {id}});
    socket?.on('getArchiveChannels', (channels: any) => {
      channels.sort((a: any, b: any) => {
        if (a.updatedAt < b.updatedAt) return 1;
        else return -1;
      });
      setArchiveChannels(channels); 
    }
    );
  } catch (error) {
    console.log(error);
  }
}


const getNewChannel = async () => {
  try {
        socket?.on('channel_create', (channel: any) => {
          setChannels([...channels, channel]);
            setCurrentChannel(channel);
          });
          socket?.on('dm_create', (channel: any) => {
            setChannels([...channels, channel]);
            setCurrentChannel(channel);
        });
    } catch (error) {
        console.log(error);
    }
}

const getChannelMember = (channelId: any) => {
  try {
    socket?.emit('channel_member', {userId : user?.id, channelId : channelId });
    socket?.on('channel_member', (data: any) => {
      setChannelMember(data);
    }
    );
  } catch (error) {
    console.log(error);
  }
}

const onChange = (e: any) => {
  e.preventDefault();
  setSearch(e.target.value)
  if (search !== "") {
    try {
      const timeoutId = setTimeout(() => {
      socket?.emit('search_channel', {query: search});
      }, 1500);
    } catch (error) {
      console.log(error);
    }
  }
}

return (
    <div className="lg:col-span-3 col-span-8 flex flex-col justify-start gap-4 py-2 w-full h-screen overflow-y-scroll scrollbar-hide">
      <div className=" relative flex items-center gap-2 w-full pr-2 rounded-xl py-2">
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
            (channel: any) => channel.pinnedFor?.map((user: any) => user.id).includes(user?.id)
          )?.map((channel: any) => {
            //list the pinned channels first
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
              channel.channelMembers?.filter((member: any) => member.userId !== user?.id)[0].user?.avatar}
              description={(channel.messages  && !(channel.bannedUsers?.map((user:any) => user.id).includes(user?.id)) && !(channel.kickedUsers?.map((user:any) => user.id).includes(user?.id)) )  ? channel.messages[channel.messages.length - 1]?.content : ""}
              updatedAt={channel.lastestMessageDate}
              newMessages={channel.newMessagesCount}
              onClick={() => onClick(channel)}
                />
                )
              }).concat(
                      channels?.filter(
                        (channel: any) => ((!channel.pinnedFor?.map((user: any) => user.id).includes(user?.id)))
                        ).map((channel: any) => {
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
                                    channel.channelMembers?.filter((member: any) => member.userId !== user?.id)[0].user?.avatar
                                    }
                            description={(channel.messages  && !(channel.bannedUsers?.map((user:any) => user.id).includes(user?.id)) && !(channel.kickedUsers?.map((user:any) => user.id).includes(user?.id)) )  ? channel.messages[channel.messages.length - 1]?.content : ""}
                            updatedAt={channel.lastestMessageDate}
                            newMessages={channel.newMessagesCount}
                            onClick={() => onClick(channel)}
                              />
                              )
                            })
              )) :
              (
                archiveChannels?.filter(
                  (channel: any) => channel.pinnedFor?.map((user: any) => user.id).includes(user?.id)
                )?.map((channel: any) => {
                  //list the pinned channels first
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
                    channel.channelMembers?.filter((member: any) => member.userId !== user?.id)[0].user?.avatar
                    }                    
                    description={(channel.messages  && !(channel.bannedUsers?.map((user:any) => user.id).includes(user?.id)) && !(channel.kickedUsers?.map((user:any) => user.id).includes(user?.id)))  ? channel.messages[channel.messages.length - 1]?.content : ""}
                    updatedAt={channel.lastestMessageDate}
                    newMessages={channel.newMessagesCount}
                    onClick={() => onClick(channel)}

                      />
                      )
                    }).concat(
                            archiveChannels?.filter(
                              (channel: any) => ((!channel.pinnedFor?.map((user: any) => user.id).includes(user?.id)))
                              ).map((channel: any) => {
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
                                  channel.channelMembers?.filter((member: any) => member.userId !== user?.id)[0].user?.avatar
                                  }                                  
                                  description={(channel.messages  && !(channel.bannedUsers?.map((user:any) => user.id).includes(user?.id)) && !(channel.kickedUsers?.map((user:any) => user.id).includes(user?.id)))  ? channel.messages[channel.messages.length - 1]?.content : ""}
                                  updatedAt={channel.lastestMessageDate}
                                  newMessages={channel.newMessagesCount}
                                  onClick={() => onClick(channel)}

                                    />
                                    )
                                  })
                                  ))
      } 
    </div>
  );
};

export default ChannelList;
