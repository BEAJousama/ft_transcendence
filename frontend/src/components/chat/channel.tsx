import Avatar from "../avatar";
import { BiVolumeMute } from "react-icons/bi";
import { BsArchiveFill, BsPinAngleFill } from "react-icons/bs";
import { RiMailUnreadFill } from "react-icons/ri";
import { MdDelete } from "react-icons/md";
import { useContext, useRef, useState } from "react";
import RightClickMenu, { RightClickMenuItem } from "../rightclickmenu";
import { useClickAway } from "react-use";
import { SocketContext } from "../../context/socket.context";
import { channel } from "diagnostics_channel";

interface ChannelProps {
  id: string;
  avatar?: string;
  name?: string;
  description?: string;
  members?: string[];
  messages?: string[];
  createdAt?: string;
  updatedAt: string;
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
  avatar = "https://www.github.com/Hicham-BelHoucin.png",
  name,
  description,
  members,
  messages,
  createdAt,
  updatedAt,
  deleted,
  muted,
  archived,
  unread,
  selected,
  newMessages,
  onClick,
  pinned,
}: ChannelProps) => {

  const socket = useContext(SocketContext);
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

    const data = {
      channelId : id
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
      className="relative flex items-center gap-2 w-full px-4"
      onContextMenu={handleContextMenu}
      onClick={() => {
        onClick && onClick();
      }}
      ref={ref}
    >
      <Avatar src={avatar} alt="" />
      <div className="flex flex-col w-full text-sm truncate">
        <span className="text-white">{name}</span>
        <span className="text-secondary-300">{description}</span>
      </div>
      <div className="flex items-right flex-col text-black text-sm justify-end">
        <span className="text-primary-500 p-0 w-14 ">
        {
                new Date(updatedAt).getHours() > 12 ?
                new Date(updatedAt).getHours() - 12 :
                new Date(updatedAt).getHours()
              }:
              {
                new Date(updatedAt).getMinutes() < 10 ?
                `0${new Date(updatedAt).getMinutes()}` :
                new Date(updatedAt).getMinutes()
              }
              {new Date(updatedAt).getHours() > 12 ? "pm" : "am"
        }
        </span>
        <div className="flex items-center gap-2 justify-end">
          <span className="flex items-center justify-center bg-primary-500  text-xs rounded-full w-5 h-5">
            {}
          </span>
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
                console.log("delete");
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
