import Avatar from "../avatar";
import { BiVolumeMute } from "react-icons/bi";
import { BsArchiveFill, BsPinAngleFill } from "react-icons/bs";
import { RiMailUnreadFill } from "react-icons/ri";
import { MdDelete } from "react-icons/md";
import { useContext, useRef, useState } from "react";
import RightClickMenu, { RightClickMenuItem } from "../rightclickmenu";
import { useClickAway } from "react-use";
import { channel } from "diagnostics_channel";
import clsx from "clsx";
import { ChatContext } from "../../context/chat.context";

interface ChannelProps {
  id: string;
  avatar?: string;
  name?: string;
  description?: string;
  members?: string[];
  messages?: string[];
  createdAt?: string;
  updatedAt: string;
  userStatus?: boolean;
  muted?: boolean;
  selected?: boolean;
  onClick?: () => void;
  newMessages?: number;
  pinned?: boolean;
  archived?: boolean;
  deleted?: boolean;
  unread?: boolean;
}

const Channel = ({
  id,
  avatar = "",
  name,
  description,
  updatedAt,
  archived,
  unread,
  muted,
  onClick,
  pinned,
  userStatus,
}: ChannelProps) => {

  const {socket} = useContext(ChatContext);
  const [showMenu, setShowMenu] = useState(false);
  const ref = useRef(null);

  useClickAway(ref, () => setShowMenu(false));
  const handleClick = () => {
    setShowMenu(false);
    document.removeEventListener("click", handleClick);
  };

  const handleContextMenu = (event: any) => {
    event.preventDefault();
    setShowMenu(true);
    document.addEventListener("click", handleClick);
  };

  const MessageDate = () =>
  {
    const hours = 
                  new Date(updatedAt!).getHours() > 12 ?
                  new Date(updatedAt!).getHours() - 12 :
                  new Date(updatedAt!).getHours() ;
    
    const mins =  new Date(updatedAt!).getMinutes() < 10 ?
                  `0${new Date(updatedAt!).getMinutes()}` :
                  new Date(updatedAt!).getMinutes()
    
    const pm =    new Date(updatedAt!).getHours() > 12 ? "pm" : "am"

    const timeDifference = Math.floor( (Date.now() - new Date(updatedAt).getTime()) / 1000);
    if (timeDifference >= 86400) {
        const days = Math.floor(timeDifference / 86400);
        if (days === 1)
          return "yesterday";
        else if (days > 365)
          return `${Math.floor(days / 365)}y ago`
        else if (days > 30)
          return `${Math.floor(days / 30)}m ago`
        else if (days > 7)
          return `${Math.floor(days / 7)}w ago`
        else
          return `${days}d ago`;
    }
    return hours + ":" + mins + pm ;
  }

    const data = {
      channelId : id!
    }

    const pinChannel = () => {
      socket?.emit("pin_channel", data);
    };

    const unpinChannel = () => {
      socket?.emit("unpin_channel", data);
    };

    const muteChannel = () => {
      socket?.emit("mute_channel", data);
    };

    const unmuteChannel = () => {
      socket?.emit("unmute_channel", data);
    };

    const archiveChannel = () => {
      socket?.emit("archive_channel", data);
    };


    const unarchiveChannel = () => {
      socket?.emit("unarchive_channel", data);
    };

    const deleteChannel = () => {
      socket?.emit("channel_delete", data);
    };

    const markAsUnread = () => {
      socket?.emit("mark_unread", data);
    };

    const markAsRead = () => {
      socket?.emit("mark_read", data);
    };

  return (
    <div
      className="relative flex items-center gap-2 w-full px-4 cursor-pointer hover:bg-tertiary-700 rounded-xl py-2 "
      onContextMenu={handleContextMenu}
      onClick={() => {
        onClick && onClick();
      }}
      ref={ref}
    >
      <Avatar src={avatar!} alt="" status={userStatus}/>
      <div className="flex flex-col w-full text-sm truncate">
        <span className="text-white">{name!}</span>
        <span className="text-secondary-300">{description!}</span>
      </div>
      <div className="flex items-right flex-col text-black text-sm justify-end">
        <span className={clsx("p-0 w-14", unread ? "text-primary-500" : "text-secondary-300" )}>
        {MessageDate()}
        </span>
        <div className="flex items-center gap-2 justify-end">
          {unread && (
          <span className="flex items-center justify-center bg-primary-500  text-xs rounded-full w-5 h-5">
            {}
          </span>
          )}
          {muted && <BiVolumeMute />}
          {pinned && <BsPinAngleFill />}
        </div>
      </div>
      {showMenu && (
        <RightClickMenu>
          <RightClickMenuItem
          onClick={
            () => {
              pinned ? unpinChannel() :
              pinChannel()
          }}
          >
            <BsPinAngleFill />
            {pinned ? "Unpin chat" : "Pin chat"}
          </RightClickMenuItem>
          <RightClickMenuItem
          onClick={
            () => {
              archived ? unarchiveChannel() : archiveChannel();
          }}>
            <BsArchiveFill />
            {archived ? "Unarchive chat" : "Archive chat"}
          </RightClickMenuItem>
          <RightClickMenuItem
            onClick={
              () => {
                unread ? markAsRead() : markAsUnread();
            }}
          >
            <RiMailUnreadFill />
            {unread ? "Mark as read" : "Mark as unread"}
          </RightClickMenuItem>
          <RightClickMenuItem
            onClick={
              () => {
                muted ? unmuteChannel() :
                muteChannel();
            }}
          >
            <BiVolumeMute />
            {muted ? "Unmute channel" : "Mute channel"}
          </RightClickMenuItem>
          <RightClickMenuItem
            onClick={
              () => {
                deleteChannel();
            }}
            >
            <MdDelete />
            Delete Chat
          </RightClickMenuItem>
        </RightClickMenu>
      )}
    </div>
  );
};

export default Channel;
