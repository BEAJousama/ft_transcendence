import React, { useContext, useState, useRef, useEffect, Fragment } from "react";

import {
  MdAddBox,
  MdGroupAdd,
  MdOutlineAdminPanelSettings,
} from "react-icons/md";
import { BiArrowBack, BiRightArrowAlt, BiArchiveIn, BiArchiveOut} from "react-icons/bi";
import { useClickAway } from "react-use";
import { BsPersonAdd } from "react-icons/bs";

import clsx from "clsx";
import Avatar from "../avatar";
import Button from "../button";
import { SlOptionsVertical } from "react-icons/sl";
import { TbBan } from "react-icons/tb";
import {IoPersonRemoveOutline} from "react-icons/io5";
import RightClickMenu, { RightClickMenuItem } from "../rightclickmenu";
import { BiVolumeMute } from "react-icons/bi";
import { SocketContext } from "../../context/socket.context";
import { stat } from "fs";
import { ChatContext } from "../../context/chat.context";

const ProfileBanner = ({
  channelMember,
  user,
  avatar,
  name,
  description,
  showAddGroup,
  className,
  setShowModal,
  setShowArchive,
  showArchive,
  showOptions,
  showStatus,
  role,
  status,
  channelId,
  userId,
}: {
  channelMember?: any;
  user?: number | undefined;
  avatar?: string;
  name: string | undefined;
  description: string | undefined;
  showAddGroup?: boolean;
  className?: string;
  setShowModal?: React.Dispatch<React.SetStateAction<boolean>>;
  setShowArchive?: React.Dispatch<React.SetStateAction<boolean>>;
  showArchive?: boolean;
  showOptions?: boolean;
  showStatus?: boolean;
  role?: string;
  status?: string;
  channelId?: string;
  userId?: string;
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const ref = useRef(null);
  const socket = useContext(ChatContext);

/* TODO: I wanna see immediate changes in the UI when I click on the button to setAsAdmin
     its not working, I have to refresh the page to see the changes
     I think I have to use useEffect to see the changes in the UI
     But i can't change props in useEffect
*/


  const setAsAdmin = () => {
    socket?.emit("set_admin", {userId, channelId});
  };

  const banUser = () => {
    socket?.emit("ban_user", {userId, channelId});
  };

  const unbanUser = () => {
    socket?.emit("unban_user", {userId, channelId});
  };

  const muteUser = () => {
    socket?.emit("mute_user", {userId, channelId});
  };

  const unmuteUser = () => {
    socket?.emit("unmute_user", {userId, channelId});
  };

  const kickUser = () => {
    socket?.emit("kick_user", {userId, channelId});
  };
  

  useClickAway(ref, () => setShowMenu(false));

  return (
    <div
      className={clsx(
        `relative flex w-full items-center gap-4 ml-1`,
        className && className
      )}
    >
      <Avatar src={avatar} alt="" />
      <div
        className={clsx(
          "flex w-full  flex-col truncate text-sm md:max-w-full ",
          showStatus && "max-w-[100px]"
        )}
      >
        <span className="text-white">{name}</span>
        <span className="text-secondary-300 ">{description}</span>
      </div>
      {showAddGroup && (
        <div className="flex items-center justify-end">
          <Button
            className=" !hover:bg-inherit !bg-inherit hover:animate-jump hover:animate-once hover:animate-ease-in"
            onClick={() => {
              setShowArchive && setShowArchive(!showArchive);
            }}
          >
            {
              showArchive ? <BiArchiveOut /> : <BiArchiveIn />
            }
          </Button>
          <Button
            className=" !hover:bg-inherit !bg-inherit hover:animate-jump hover:animate-once hover:animate-ease-in"
            onClick={() => {
              setShowModal && setShowModal(true);
              
            }}
          >
            <MdAddBox />
          </Button>
        </div>
      )}
      {showStatus && (
        <div className="flex h-full flex-col items-end justify-end text-tertiary-200">
          {role}
        </div>
      )}
      {showOptions && (
        <div className="flex items-center justify-end">
          {
            userId !== user && 
              <Button
              className=" !hover:bg-inherit !bg-inherit hover:animate-jump hover:animate-once hover:animate-ease-in"
              onClick={() => {
                setShowMenu(true);
              }}
            >
              <SlOptionsVertical />
            </Button>
          }
        </div>
      )}
      {showMenu && (
        <div
          ref={ref}
          className="absolute -bottom-14 right-14 w-56 bg-yellow-500"
        >
          <RightClickMenu className="w-full !bg-secondary-500 max-h-50 absolute right-1/2 left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <RightClickMenuItem
              onClick={() => {
              }}
            >
              <BsPersonAdd />
              Invite To Play
            </RightClickMenuItem>
            {((channelMember.role === "ADMIN" || channelMember.role === "OWNER") && role != "OWNER") &&
            <Fragment>
                  <RightClickMenuItem
                  onClick={() => {
                    setAsAdmin();
                    setShowMenu(false);
                  }}
                  >
                  <MdOutlineAdminPanelSettings />
                  {role === "ADMIN" ? "Remove Admin" : "Set As Admin"}
                </RightClickMenuItem>
                <RightClickMenuItem
                  onClick={() => {
                    status === "MUTED" ? unmuteUser() : muteUser();
                    setShowMenu(false);
                  }}
                  >
                  <BiVolumeMute />
                  {status === "MUTED" ? "Unmute" : "Mute"}
                </RightClickMenuItem>
                <RightClickMenuItem
                  onClick={
                    () => {
                      status === "BANNED" ? unbanUser() : banUser();
                      setShowMenu(false);
                  }}
                >
                  <TbBan />
                   {"Ban"}
                </RightClickMenuItem>
                <RightClickMenuItem
                  onClick={
                    () => {
                      kickUser();
                      setShowMenu(false);
                  }}
                >
                  <IoPersonRemoveOutline />
                  {"Kick"}
                </RightClickMenuItem>
            </Fragment>
            }

          </RightClickMenu>
            
        </div>
      )}
    </div>
  );
};

export default ProfileBanner;
