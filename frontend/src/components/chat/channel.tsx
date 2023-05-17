import Avatar from "../avatar";
import { BiVolumeMute } from "react-icons/bi";
import { BsArchiveFill, BsPinAngleFill } from "react-icons/bs";
import { RiMailUnreadFill } from "react-icons/ri";
import { MdDelete } from "react-icons/md";
import { useRef, useState } from "react";

import RightClickMenu, { RightClickMenuItem } from "../rightclickmenu";
import { useClickAway } from "react-use";

interface ChannelProps {
  id?: string;
  avatar?: string;
  name?: string;
  description?: string;
  members?: string[];
  messages?: string[];
  createdAt?: string;
  updatedAt?: string;
  muted?: boolean;
  selected?: boolean;
  onClick?: () => void;
  pinned?: boolean;
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
  muted,
  selected,
  onClick,
  pinned,
}: ChannelProps) => {
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

  return (
    <div
      className="relative flex w-full items-center gap-2 px-4"
      onContextMenu={handleContextMenu}
      onClick={() => {
        onClick && onClick();
      }}
      ref={ref}
    >
      <Avatar src={avatar} alt="" />
      <div className="flex w-full flex-col truncate text-sm">
        <span className="text-white">{name}</span>
        <span className="text-secondary-300">{description}</span>
      </div>
      <div className="items-right flex flex-col justify-end text-sm text-black">
        <span className="w-14 p-0 text-primary-500 ">3:28 pm</span>
        <div className="flex items-center justify-end gap-2">
          <span className="flex h-5 w-5 items-center  justify-center rounded-full bg-primary-500 text-xs">
            2
          </span>
          {muted && <BiVolumeMute />}
          {pinned && <BsPinAngleFill />}
        </div>
      </div>
      {showMenu && (
        <RightClickMenu>
          <RightClickMenuItem>
            <BsPinAngleFill />
            Pin chat
          </RightClickMenuItem>
          <RightClickMenuItem>
            <BsArchiveFill />
            Archive Chat
          </RightClickMenuItem>
          <RightClickMenuItem>
            <RiMailUnreadFill />
            Mark as unread
          </RightClickMenuItem>
          <RightClickMenuItem>
            <BiVolumeMute />
            MuteNotifications
          </RightClickMenuItem>
          <RightClickMenuItem>
            <MdDelete />
            Delete Chat
          </RightClickMenuItem>
        </RightClickMenu>
      )}
    </div>
  );
};

export default Channel;
