import Avatar from "../avatar";
import { BiVolumeMute } from "react-icons/bi";
import { BsArchiveFill, BsPinAngleFill } from "react-icons/bs";
import { RiMailUnreadFill } from "react-icons/ri";
import { MdDelete } from "react-icons/md";
import { useContext, useRef, useState } from "react";
import RightClickMenu, { RightClickMenuItem } from "../rightclickmenu";
import { useClickAway } from "react-use";
import clsx from "clsx";
import { ChatContext } from "../../context/chat.context";

interface ChannelProps {
  id: number | undefined;
  avatar?: string;
  name?: string;
  description?: string;
  members?: string[];
  createdAt?: string;
  updatedAt: string;
  userStatus?: boolean;
  muted?: boolean;
  selected?: boolean;
  onClick?: (e: any) => void;
  newMessages?: number;
  pinned?: boolean;
  archived?: boolean;
  deleted?: boolean;
  unread?: boolean;
}

const Channel: React.FC<ChannelProps> = ({
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
  selected,
  newMessages,
}: ChannelProps) => {

  const { socket } = useContext(ChatContext);
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

  const MessageDate = () => {
    if (updatedAt === "")
      return "";
    const hours =
      new Date(updatedAt!).getHours() > 12 ?
        new Date(updatedAt!).getHours() - 12 :
        new Date(updatedAt!).getHours();

    const mins = new Date(updatedAt!).getMinutes() < 10 ?
      `0${new Date(updatedAt!).getMinutes()}` :
      new Date(updatedAt!).getMinutes()

    const pm = new Date(updatedAt!).getHours() > 12 ? "pm" : "am"

    const timeDifference = Math.floor((new Date().getTime() - new Date(updatedAt).getTime()) / 1000);
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
    return hours + ":" + mins + pm;
  }

  const data = {
    channelId: id!
  }

  const pinChannel = (e: any) => {
    socket?.emit("pin_channel", data);
    e.stopPropagation();
    setShowMenu(false);
  };

  const unpinChannel = (e: any) => {
    socket?.emit("unpin_channel", data);
    e.stopPropagation();
    setShowMenu(false);
  };

  const muteChannel = (e: any) => {
    socket?.emit("mute_channel", data);
    e.stopPropagation();
    setShowMenu(false);
  };

  const unmuteChannel = (e: any) => {
    socket?.emit("unmute_channel", data);
    e.stopPropagation();
    setShowMenu(false);
  };

  const archiveChannel = (e: any) => {
    socket?.emit("archive_channel", data);
    e.stopPropagation();
    setShowMenu(false);
  };


  const unarchiveChannel = (e: any) => {
    socket?.emit("unarchive_channel", data);
    e.stopPropagation();
    setShowMenu(false);
  };

  const deleteChannel = (e: any) => {
    socket?.emit("channel_delete", data);
    e.stopPropagation();
    setShowMenu(false);
  };

  const markAsUnread = (e: any) => {
    socket?.emit("mark_unread", data);
    e.stopPropagation();
    setShowMenu(false);
  };

  const markAsRead = (e: any) => {
    socket?.emit("mark_read", data);
    e.stopPropagation();
    setShowMenu(false);
  };



  return (
    <div
      className={clsx("relative flex items-center justify-between gap-[10px] w-full px-4 cursor-pointer hover:bg-tertiary-700 rounded-xl py-2", selected && "bg-secondary-500")}
      onContextMenu={handleContextMenu}
      onClick={(e) => {
        onClick && onClick(e);
      }}
      ref={ref}
    >
      <div className="flex items-center gap-2">
        <Avatar src={avatar!} alt="" status={userStatus} />
        <div className="flex flex-col text-sm truncate">
          <span className="text-white">{name && name.length > 17 ? name.slice(0, 17) + "..." : name}</span>
          <span className="text-secondary-300">{description && description.length > 17 ? description.slice(0, 17) + "..." : description}</span>
        </div>
      </div>
      <div className="flex items-right flex-col text-black text-sm justify-end">
        <span className={clsx("p-0 w-14", unread ? "text-primary-500" : "text-secondary-300")}>
          {MessageDate()}
        </span>
        <div className="flex items-center gap-2 justify-end">
          {unread && (
            <span className="flex items-center justify-center bg-primary-500  text-xs rounded-full w-5 h-5">
              {newMessages !== 0 ? newMessages : ""}
            </span>
          )}
          {muted && <BiVolumeMute />}
          {pinned && <BsPinAngleFill />}
        </div>
      </div>
      {showMenu && (
        <RightClickMenu
          className="right-20 top-10"
        >
          <RightClickMenuItem
            onClick={
              (e: any) => {
                pinned ? unpinChannel(e) :
                  pinChannel(e)
              }}
          >
            <BsPinAngleFill />
            {pinned ? "Unpin chat" : "Pin chat"}
          </RightClickMenuItem>
          <RightClickMenuItem
            onClick={
              (e) => {
                archived ? unarchiveChannel(e) : archiveChannel(e);
              }}>
            <BsArchiveFill />
            {archived ? "Unarchive chat" : "Archive chat"}
          </RightClickMenuItem>
          <RightClickMenuItem
            onClick={
              (e) => {
                unread ? markAsRead(e) : markAsUnread(e);
              }}
          >
            <RiMailUnreadFill />
            {unread ? "Mark as read" : "Mark as unread"}
          </RightClickMenuItem>
          <RightClickMenuItem
            onClick={
              (e) => {
                muted ? unmuteChannel(e) :
                  muteChannel(e);
              }}
          >
            <BiVolumeMute />
            {muted ? "Unmute channel" : "Mute channel"}
          </RightClickMenuItem>
          <RightClickMenuItem
            onClick={
              (e) => {
                deleteChannel(e);
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
