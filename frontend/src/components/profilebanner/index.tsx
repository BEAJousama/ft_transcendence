import React, { useContext, useState, useRef, Fragment } from "react";

import {
  MdAddBox,
  MdOutlineAddModerator,
  MdOutlineAdminPanelSettings,
} from "react-icons/md";
import { BiArchiveIn, BiArchiveOut} from "react-icons/bi";
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
import { ChatContext, IchannelMember } from "../../context/chat.context";
import { useNavigate } from "react-router-dom";
import Modal from "../modal"
import Input from "../input";
import Select from "../select";

interface ProfileBannerProps {
  channelMember?: IchannelMember;
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
  channelId?: number | undefined;
  userId?: number | undefined;
}

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
}: ProfileBannerProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const ref = useRef(null);
  const {socket} = useContext(ChatContext);
  const navigate = useNavigate();
  const [muteModal, setmuteModal] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [unit, setUnit] = useState("s");
  

  const setAsAdmin = () => {
    socket?.emit("set_admin", {userId, channelId});
  };

  const setAsOwner = () => {
    socket?.emit("set_owner", {userId, channelId});
  };

  const banUser = () => {
    socket?.emit("ban_user", {userId, channelId});
  };

  const unbanUser = () => {
    socket?.emit("unban_user", {userId, channelId});
  };

  const muteUser = () => {
    const banDuration = unit === 's' ? duration : (unit === 'm') ? (duration * 60) : (duration * 3600);
    socket?.emit("mute_user", {userId, channelId, banDuration});
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
      <Avatar src={avatar} alt="" status={description === "ONLINE"} />
      <div
        className={clsx(
          "flex w-full  flex-col truncate text-sm md:max-w-full ",
          showStatus && "max-w-[100%]"
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
              className="!hover:bg-inherit !bg-inherit hover:animate-jump hover:animate-once hover:animate-ease-in text-tertiary-200"
              onClick={() => {
                setShowMenu(true);
              }}
              variant="text"
            >
              <SlOptionsVertical />
            </Button>
          }
        </div>
      )}
      {showMenu && (
        <div
          ref={ref}
          className="absolute top-10 right-10 w-56"
        >
          {
            status !== "BANNED" ?
            (
              <RightClickMenu className="w-full !bg-secondary-400 max-h-50">
                <RightClickMenuItem
                  onClick={() => {
                  }}
                >
                  <BsPersonAdd />
                  Invite To Play
                </RightClickMenuItem>
                <RightClickMenuItem
                  onClick={() => {
                    navigate(`/profile/${userId}`);
                    setShowMenu(false);
                  }}
                >
                  <BsPersonAdd />
                  Go to profile
                </RightClickMenuItem>
                {((channelMember?.role === "ADMIN" || channelMember?.role === "OWNER") && role !== "OWNER") &&
                <Fragment>
                  {
                    channelMember.role === "OWNER" &&
                    <>
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
                          setAsOwner();
                          setShowMenu(false);
                        }}
                        >
                        <MdOutlineAddModerator />
                        {role === "OWNER" ? "Remove Owner" : "Set As Owner"}
                      </RightClickMenuItem>           
                    </>
                  }
                    <RightClickMenuItem
                      onClick={() => {
                        status === "MUTED" ? unmuteUser() : setmuteModal(true);
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
                      {
                          status === "BANNED" ? "Unban" : "Ban"
                      }
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
            ) :
            (
              <RightClickMenu className="w-full !bg-[#7C7CA6] max-h-50 z-10">
                    <RightClickMenuItem
                      onClick={
                        () => {
                          status === "BANNED" ? unbanUser() : banUser();
                          setShowMenu(false);
                      }}
                    >
                      <TbBan />
                      {
                          status === "BANNED" ? "Unban" : "Ban"
                      }
                    </RightClickMenuItem>
              </RightClickMenu>
              
            )
          }
            
        </div>
      )}
      {
        muteModal &&
        (
          <Modal
          className="z-10 bg-secondary-800 
          border-none flex flex-col items-center justify-start shadow-lg shadow-secondary-500 gap-4 text-white min-w-[90%]
          lg:min-w-[40%] xl:min-w-[800px] animate-jump-in animate-ease-out animate-duration-400"
          >
            <div className="grid grid-rows w-full">
              <div className="grid grid-cols-10 justify-center items-center m-5">
                <div className="col-span-8 gap-4 mr-3">
                  <Input
                    type="text"
                    placeholder="mute duration"
                    value={duration.toString()}
                    onChange={(e) => {
                      setDuration(Number(e.target.value));
                    }}
                    onKeyDown={
                      (e) => {
                        if (e.key === "Enter") {
                          muteUser();
                          setmuteModal(false);
                        }
                      }
                    }
                  />
                </div>
                <Select
                  className="col-span-2 "
                  options={["s", "m", "h"]}
                  setX={setUnit}
                />
              </div>
              <div className="flex justify-around flex-auto">
                <Button
                className="!bg-inherit !text-white hover:bg-inheri !font-medium mr-1 basis-4/12"
                onClick={() => {
                  setmuteModal(false);
                }}
                >
                Cancel
                </Button>
                <Button
                className="bg-primary !font-medium mr-1 basis-4/12 "
                onClick={() => {
                  muteUser();
                  setmuteModal(false);
                }}
                >
                Mute
                </Button>
              </div>
            </div>
          </Modal>
        )
      }

    </div>
  );
};

export default ProfileBanner;