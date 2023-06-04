import {useContext, useEffect, useState } from "react";
import ProfileBanner from "../profilebanner";
import Channel from "./channel";
import { SocketContext } from "../../context/socket.context";
import { AppContext } from "../../context/app.context";

const ChannelList = ({setShowModal, setCurrentChannel, setChannelMember} : 
  {setShowModal: any,  setCurrentChannel: any, setChannelMember: any}) => {
  
  const[channels, setChannels] = useState<any>([]);
  const [archiveChannels, setArchiveChannels] = useState<any>([]);
  const [showArchive, setShowArchive] = useState<boolean>(false);
  const socket = useContext(SocketContext);
  let {user, setUser} = useContext(AppContext)

  useEffect(() => {
    getuserChannels(user?.id);
    getNewChannel();
    getArchiveChannels(user?.id);
    socket?.on('channel_leave', (channels: any) => {
      setCurrentChannel(channels[0]);
      setChannels(channels);
    });
    socket?.on("connect_user", (data: any) => {
      setUser(data);
    }
    );
    //eslint-disable-next-line
  }, [channels, socket]);

  const getuserChannels = async (id: any) => {
    // prefer getting it through http 
    // try {
    //     fetch("http://127.0.0.1:3000/api/channel/channels/1").then((res) => {
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
  return (
    <div className="lg:col-span-3 col-span-8 flex flex-col justify-start gap-4 py-2 w-full h-screen overflow-y-scroll scrollbar-hide">
      <ProfileBanner
        avatar={user?.avatar}
        name={user?.username}
        description={user?.status}
        showAddGroup={true}
        setShowModal={setShowModal}
        setShowArchive={setShowArchive}
        showArchive={showArchive}
      />
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
              name={channel.name}
              pinned={channel.pinnedFor?.map((user: any) => user.id).includes(user?.id)}
              muted={channel.mutedFor?.map((user: any) => user.id).includes(user?.id)}
              archived={channel.archivedFor?.map((user: any) => user.id).includes(user?.id)}
              unread={channel.unreadFor?.map((user: any) => user.id).includes(user?.id)}
              avatar={`https://randomuser.me/api/portraits/women/${channel.id}.jpg`}
              description={channel?.messages[channel.messages.length - 1]?.content}
              onClick={
                () => {
                  setCurrentChannel(channel);
                  getChannelMember(channel.id);
                }}
                />
                )
              }).concat(
                channels?.filter(
                  (channel: any) => ((!channel.pinnedFor?.map((user: any) => user.id).includes(user?.id) &&
                                    Date.parse(channel.createAt) < Date.parse(channel.updatedAt)))
                ).map((channel: any) => {
                  //list the pinned channels first
                  return (
                    <Channel
                    key={channel.id}
                    id={channel.id}
                    name={channel.name}
                    pinned={channel.pinnedFor?.map((user: any) => user.id).includes(user?.id)}
                    muted={channel.mutedFor?.map((user: any) => user.id).includes(user?.id)}
                    archived={channel.archivedFor?.map((user: any) => user.id).includes(user?.id)}
                    unread={channel.unreadFor?.map((user: any) => user.id).includes(user?.id)}
                    avatar={`https://randomuser.me/api/portraits/women/${channel.id}.jpg`}
                    description={channel?.messages[channel.messages.length - 1]?.content}
                    onClick={
                      () => {
                        setCurrentChannel(channel);
                        getChannelMember(channel.id);
                      }}
                      />
                      )
                    }
                    ).concat(
                      channels?.filter(
                        (channel: any) => !channel.pinnedFor?.map((user: any) => user.id).includes(user?.id) 
                                         && Date.parse(channel.createAt) === Date.parse(channel.updatedAt)
                      ).map((channel: any) => {
                        return (
                          <Channel
                          key={channel.id}
                          id={channel.id}
                          name={channel.name}
                          pinned={channel.pinnedFor?.map((user: any) => user.id).includes(user?.id)}
                          muted={channel.mutedFor?.map((user: any) => user.id).includes(user?.id)}
                          archived={channel.archivedFor?.map((user: any) => user.id).includes(user?.id)}
                          unread={channel.unreadFor?.map((user: any) => user.id).includes(user?.id)}
                          avatar={`https://randomuser.me/api/portraits/women/${channel.id}.jpg`}
                          description={channel?.messages[channel.messages.length - 1]?.content}
                          onClick={
                            () => {
                              setCurrentChannel(channel);
                              getChannelMember(channel.id);
                            }}
                            />
                            )
                          }))
              )

        )
        :
        (archiveChannels.map((channel: any) => {
          return(
          <Channel
            key={channel.id}
            id={channel.id}
            name={channel.name}
            pinned={channel.pinnedFor?.map((user: any) => user.id).includes(user?.id)}
            muted={channel.mutedFor?.map((user: any) => user.id).includes(user?.id)}
            archived={channel.archivedFor?.map((user: any) => user.id).includes(user?.id)}
            unread={channel.unreadFor?.map((user: any) => user.id).includes(user?.id)}
            avatar={`https://randomuser.me/api/portraits/women/${channel.id}.jpg`}
            description={channel?.messages[channel.messages.length - 1]?.content}
            onClick={
              () => {
                setCurrentChannel(channel);
                getChannelMember(channel.id);
              }}
          />
          )
        })
        )
      } 
    </div>
  );
};

export default ChannelList;
