"use client";


import React, { useContext, useState, useRef, Fragment } from "react";
import RightClickMenu, { RightClickMenuItem } from "../rightclickmenu";
import { ChatContext, IchannelMember } from "../../context/chat.context";
import { twMerge } from "tailwind-merge";
import Avatar from "../avatar";
import Button from "../button";
import Modal from "../modal"
import Input from "../input";
import { GameContext } from "@/context/game.context";
import { useRouter } from "next/navigation";
import { useClickAway } from "react-use";
import { VolumeX, Archive, ArchiveRestore, Pin, Trash, BellDot, UserMinus, MoreVertical, Ban, ShieldAlert, PlusCircle, UserPlus, UserSquare2 ,Gamepad } from 'lucide-react';




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
  const { socket } = useContext(ChatContext);
  const { socket: gamesocket } = useContext(GameContext);
  const [muteModal, setmuteModal] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [unit, setUnit] = useState("s");
  const router = useRouter();

  const setAsAdmin = () => {
    socket?.emit("set_admin", { userId, channelId });
  };

  const setAsOwner = () => {
    socket?.emit("set_owner", { userId, channelId });
  };

  const banUser = () => {
    socket?.emit("ban_user", { userId, channelId });
  };

  const unbanUser = () => {
    socket?.emit("unban_user", { userId, channelId });
  };

  const muteUser = () => {
    const banDuration = unit === 's' ? duration : (unit === 'm') ? (duration * 60) : (duration * 3600);
    socket?.emit("mute_user", { userId, channelId, banDuration });
  };

  const unmuteUser = () => {
    socket?.emit("unmute_user", { userId, channelId });
  };

  const kickUser = () => {
    socket?.emit("kick_user", { userId, channelId });
  };


  useClickAway(ref, () => setShowMenu(false));

  return (
    <div
      className={twMerge(
        `relative flex w-full items-center gap-4 ml-1`,
        className && className
      )}
    >
      <div className=" basis-[15%]">
        <Avatar src={avatar} alt="" status={description === "ONLINE" ? "ONLINE" : "OFFLINE"} />
      </div>
      <div
        className={twMerge(
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
              showArchive ? <Archive /> : <ArchiveRestore />
            }
          </Button>
          <Button
            className=" !hover:bg-inherit !bg-inherit hover:animate-jump hover:animate-once hover:animate-ease-in"
            onClick={() => {
              setShowModal && setShowModal(true);

            }}
          >
            <UserPlus />
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
              <MoreVertical />
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
                <RightClickMenu className="w-full !bg-secondary-400 max-h-50 overflow-y-visible">
                  <RightClickMenuItem
                    onClick={() => {
                      gamesocket?.emit("invite-friend", {
                        inviterId: user,
                        invitedFriendId: userId,
                        gameMode: "Classic Mode",
                        powerUps: "Classic",
                      });
                      router.push("/pong")
                    }}
                  >
                    <Gamepad />
                    Invite To Play
                  </RightClickMenuItem>
                  <RightClickMenuItem
                    onClick={() => {
                      router.push(`/profile/${userId}`);
                      setShowMenu(false);
                    }}
                  >
                    <UserSquare2 />
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
                            <ShieldAlert />
                            {role === "ADMIN" ? "Remove Admin" : "Set As Admin"}
                          </RightClickMenuItem>
                          <RightClickMenuItem
                            onClick={() => {
                              setAsOwner();
                              setShowMenu(false);
                            }}
                          >
                            <PlusCircle />
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
                        <VolumeX />
                        {status === "MUTED" ? "Unmute" : "Mute"}
                      </RightClickMenuItem>
                      <RightClickMenuItem
                        onClick={
                          () => {
                            status === "BANNED" ? unbanUser() : banUser();
                            setShowMenu(false);
                          }}
                      >
                        <Ban />
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
                        <UserMinus />
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
                    <Ban />
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
            className="bg-secondary-700 !overflow-hidden !h-52"
            className2="!w-[500px] h-[200px]  p-4 !overflow-hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <div className="grid grid-rows w-full p-5 gap-10">
              <div className="grid grid-cols-10 justify-center items-center  gap-3">
                <div className="col-span-8">
                  <Input
                    htmlType="number"
                    pattern="[0-9]*"
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
                <Input
                  type="select"
                  className="col-span-2 "
                  options={[
                    {
                      label: "s",
                      value: "s"
                    },
                    {
                      label: "m",
                      value: "m"
                    },
                    {
                      label: "h",
                      value: "h"
                    }]}
                  onChange={(e) => {
                    setUnit(e.target.value);
                  }}
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
                  className="bg-primary-500 !font-medium mr-1 basis-4/12 "
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