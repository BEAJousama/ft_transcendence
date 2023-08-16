"use client";

import { useState, useRef, useContext, useEffect, useCallback } from "react";
import { useClickAway } from "react-use";
import { AppContext } from "../../context/app.context";
import {
  ChatContext,
  Ichannel,
  IchannelMember,
  Imessage,
} from "../../context/chat.context";
import Avatar from "../avatar";
import Modal from "../modal";
import Divider from "../divider";
import ProfileBanner from "../profilebanner";
import UpdateAvatar from "../update-avatar";
import Button from "../button";
import Input from "../input";
import MessageBox from "./messagebox";
import UpdateChannel from "./updateChannel";
import RightClickMenu, { RightClickMenuItem } from "../rightclickmenu";
import axios from "axios";
import { toast } from "react-toastify";
import IUser from "../../interfaces/user";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";
import { GameContext } from "@/context/game.context";

import {
  Menu,
  UserX,
  UserPlus,
  EyeOff,
  UserCog,
  Asterisk,
  UserCircle,
  X,
  LogOut,
  Trash2,
  FileEdit,
  Smile,
  SendHorizonal,
  ChevronFirst,
} from "lucide-react";
import { Spinner } from "..";

interface ChannelProps {
  className?: string;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentChannel: React.Dispatch<React.SetStateAction<Ichannel | undefined>>;
  currentChannel?: Ichannel;
  messages: Imessage[];
  inputRef: React.RefObject<HTMLInputElement>;
  isBlocked: boolean;
  isBlocking: boolean;
  checkBlock: (id: number | undefined) => boolean;
  users?: IUser[];
}

const MessageBubble: React.FC<ChannelProps> = ({
  className,
  setOpen,
  setCurrentChannel,
  currentChannel,
  messages,
  inputRef,
  isBlocked,
  isBlocking,
  checkBlock,
  users,
}: ChannelProps) => {
  const [value, setValue] = useState<string>("");
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showEdit, setShowEdit] = useState<boolean>(false);
  const [visibility, setVisibility] = useState<string>(
    currentChannel?.visiblity || ""
  );
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [previewImage, setPreviewImage] = useState<string>(
    currentChannel?.avatar || ""
  );
  const [groupName, setGroupName] = useState<string>(
    currentChannel?.name || ""
  );
  const [password, setPassword] = useState<string>("");
  const [accessPassword, setAccessPassword] = useState<string>("");
  const [chName, setChName] = useState<boolean>(false);
  const [chPassword, setChPassword] = useState<boolean>(false);
  const [chVisibility, setChVisibility] = useState<boolean>(false);
  const [chMembers, setChMembers] = useState<boolean>(false);
  const [chAvatar, setChAvatar] = useState<boolean>(false);
  const [manageMembers, setManageMembers] = useState<boolean>(false);
  const [manageBans, setManageBans] = useState<boolean>(false);
  const [deleteChannel, setDeleteChannel] = useState<boolean>(false);
  const [DmMemu, setDmMenu] = useState<boolean>(false);
  const [Setowner, setSetowner] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [messageId, setMessageId] = useState<number | undefined>(0);
  const [chId, setChId] = useState<number | undefined>(0);
  const [isBlockingOrUnblocking, setIsBlockingOrUnblocking] = useState(false);
  const [coolDown, setCoolDown] = useState(false);

  // const navigate = useNavigate();
  const { socket } = useContext(ChatContext);
  const { socket: gamesocket } = useContext(GameContext);
  const { user } = useContext(AppContext);
  const refMessage = useRef(null);
  const router = useRouter();

  useEffect(() => {
    setValue("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChannel]);

  const autoScroll = () => {
    const scroll = refMessage.current;
    if (scroll) {
      (scroll as HTMLElement).scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  const handleMessage = useCallback(
    (data: Imessage) => {
      setMessageId(data?.receiverId);
      if (messageId === chId) {
        autoScroll();
      }
    },
    [chId, messageId]
  );

  useEffect(() => {
    socket?.on("message", handleMessage);
    return () => {
      socket?.off("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    setVisibility(currentChannel?.visiblity || "");
    setPreviewImage(currentChannel?.avatar || "");
    setGroupName(currentChannel?.name || "");
    setChId(currentChannel?.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChannel]);

  const ref = useRef(null);
  const ref1 = useRef(null);
  useClickAway(ref, () => {
    setShowPicker(false);
  });

  useClickAway(ref1, () => {
    setDmMenu(false);
  });

  const closeAll = () => {
    setShowEdit(false);
    setShowModal(false);
    setChAvatar(false);
    setChMembers(false);
    setChName(false);
    setChPassword(false);
    setChVisibility(false);
    setManageBans(false);
    setManageMembers(false);
    setDeleteChannel(false);
  };

  const handleSendMessage = (value: string) => {
    if (value.trim() === "" || coolDown) return;
    if (value) {
      const message = {
        senderId: user?.id,
        receiverId: currentChannel?.id,
        content: value,
      };
      socket?.emit("message", message);
      setValue("");
      setCoolDown(true);
      inputRef.current?.blur();
      setTimeout(() => {
        setCoolDown(false);
        inputRef.current?.focus();
      }, 700);
    }
  };

  const handleLeave = () => {
    if (
      currentChannel?.channelMembers?.filter(
        (member: IchannelMember) => member.role === "OWNER"
      ).length === 1
    ) {
      if (
        currentChannel?.channelMembers?.filter(
          (member: IchannelMember) => member.status === "ACTIVE"
        ).length === 1 &&
        currentChannel?.channelMembers?.filter(
          (member: IchannelMember) => member.userId === user?.id
        )[0].role === "OWNER"
      ) {
        socket?.emit("channel_remove", {
          channelId: currentChannel?.id,
          userId: user?.id,
        });
        setShowModal(false);
        setSetowner(false);
        setCurrentChannel({} as Ichannel);
        inputRef.current?.blur();
        setOpen(false);
        return;
      }
      toast.error("You can't leave this channel until you set a new owner!");
    } else {
      socket?.emit("channel_leave", {
        channelId: currentChannel?.id,
        userId: user?.id,
      });
      setShowModal(false);
      setSetowner(false);
    }
  };

  const leaveGroup = () => {
    // check if user is the only owner if so he can't leave until he set a new owner
    if (
      currentChannel?.channelMembers?.filter(
        (member: IchannelMember) => member.role === "OWNER"
      ).length === 1 &&
      currentChannel?.channelMembers?.filter(
        (member: IchannelMember) => member.role === "OWNER"
      )[0].userId === user?.id
    ) {
      setShowModal(false);
      setSetowner(true);
      return;
    }
    setShowModal(false);
    setShowConfirm(true);
  };

  const handleDeleteChannel = () => {
    socket?.emit("channel_remove", { channelId: currentChannel?.id });
    setCurrentChannel({} as Ichannel);
    inputRef.current?.blur();
    setOpen(false);
  };

  const handleEditChannelName = () => {
    socket?.emit("channel_update", {
      id: currentChannel?.id,
      name: groupName,
      type: "name",
    });
  };

  const handleEditChannelPassword = () => {
    socket?.emit("channel_update", {
      id: currentChannel?.id,
      access_pass: accessPassword,
      type: "access_pass",
    });
    setAccessPassword("");
  };

  const handleEditChannelVisibility = () => {
    socket?.emit("channel_update", {
      id: currentChannel?.id,
      visibility: visibility || currentChannel?.visiblity,
      type: "visibility",
      password,
    });
    setPassword("");
  };

  const handleEditChannelAvatar = () => {
    socket?.emit("channel_update", {
      id: currentChannel?.id,
      avatar: previewImage,
      type: "avatar",
    });
  };

  const handleBlockUser = async (userId: number | undefined) => {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACK_END_URL}api/users/block-user`,
      {
        blockerId: user?.id,
        blockingId: userId,
      },
      {
        withCredentials: true,
      }
    );
    if (response) {
      setDmMenu(false);
      socket?.emit("blockUser", {
        blockerId: user?.id,
        blockedId: userId,
        isBlock: true,
        channelId: currentChannel?.id,
      });
    }
  };

  const handleUnblockUser = async (userId: number | undefined) => {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACK_END_URL}api/users/unblock-user`,
      { blockerId: user?.id, blockingId: userId },
      {
        withCredentials: true,
      }
    );
    if (response) {
      setDmMenu(false);
      socket?.emit("blockUser", {
        blockerId: user?.id,
        blockedId: userId,
        channelId: currentChannel?.id,
        isBlock: false,
      });
    }
  };

  const handleRemovePassword = () => {
    socket?.emit("channel_update", {
      id: currentChannel?.id,
      type: "rm_access_pass",
    });
    setAccessPassword("");
    setChPassword(false);
    setShowEdit(true);
  };

  const handleAddMembers = () => {
    socket?.emit("channel_update", {
      id: currentChannel?.id,
      members: selectedUsers,
      type: "members",
    });
    setSelectedUsers([]);
  };
  return (
    <div
      id="chat-window"
      className={twMerge(
        "col-span-10 flex h-screen w-full flex-col justify-start rounded-t-3xl bg-secondary-500 lg:col-span-7 mr-3",
        className && className
      )}
    >
      <div className=" bg-secondary-400 rounded-t-3xl align-middle items-center sticky top-0 z-10">
        <div className="relative grid grid-cols-10 lg:grid-cols-12">
          <Button
            type="simple"
            className="!items-end bg-secondary-400 !text-white col-span-1 lg:hidden self-center !w-fit m-auto\"
            onClick={() => {
              setOpen(false);
              inputRef.current?.blur();
              setCurrentChannel({} as Ichannel);
              setDmMenu(false);
            }}
          >
            <ChevronFirst />
          </Button>
          <div className="flex items-center gap-2 col-span-8 lg:col-span-11 text-white lg:order-first px-2 py-3 font-semi-bold self-center">
            <Avatar
              src={
                currentChannel?.type !== "CONVERSATION"
                  ? currentChannel?.avatar
                  : currentChannel?.channelMembers?.filter(
                    (member: IchannelMember) => member.userId !== user?.id
                  )[0].user?.avatar
              }
              alt=""
              status={
                currentChannel?.type !== "CONVERSATION"
                  ? "OFFLINE"
                  : currentChannel?.channelMembers?.filter(
                    (member: IchannelMember) => member.userId !== user?.id
                  )[0].user?.status === "ONLINE" &&
                    !checkBlock(
                      currentChannel?.channelMembers?.filter(
                        (member: IchannelMember) => member.userId !== user?.id
                      )[0].user?.id
                    )
                    ? "ONLINE"
                    : "OFFLINE"
              }
            />
            <div>
              {currentChannel?.type !== "CONVERSATION"
                ? currentChannel?.name && currentChannel?.name.length > 50
                  ? currentChannel?.name.slice(0, 50) + " ..."
                  : currentChannel?.name
                : currentChannel?.channelMembers?.filter(
                  (member: IchannelMember) => member.userId !== user?.id
                )[0].user?.username}
            </div>
          </div>
          <Button
            className="col-span-1 flex items-center justify-content bg-secondary-400 !p-1 !text-white font-semi-bold self-center !w-fit !m-auto"
            type="simple"
            onClick={() => {
              if (
                currentChannel?.type !== "CONVERSATION" &&
                currentChannel?.channelMembers?.filter(
                  (member: IchannelMember) => member.userId === user?.id
                )[0].status === "ACTIVE"
              ) {
                setShowModal(true);
                setShowEdit(true);
              } else if (currentChannel?.type === "CONVERSATION") {
                setDmMenu(!DmMemu);
              }
            }}
          >
            <Menu />
          </Button>
          {DmMemu && (
            <div
              ref={ref1}
              className="absolute right-4 top-10 md:right-8 lg:right:4 xl:right-10 2xl:right-17  w-[150px]"
            >
              <RightClickMenu>
                {!checkBlock(
                  currentChannel?.channelMembers?.filter(
                    (member: IchannelMember) => member.userId !== user?.id
                  )[0].user?.id
                ) && (
                    <>
                      <RightClickMenuItem
                        onClick={() => {
                          gamesocket?.emit("invite-friend", {
                            inviterId: user?.id,
                            invitedFriendId:
                              currentChannel?.channelMembers?.filter(
                                (member: IchannelMember) =>
                                  member.userId !== user?.id
                              )[0].user?.id,
                            gameMode: "Classic Mode",
                            powerUps: "Classic",
                          });
                          router.push("/pong");
                        }}
                      >
                        Invite to play
                      </RightClickMenuItem>
                      <RightClickMenuItem
                        onClick={() => {
                          router.push(
                            `/profile/${currentChannel?.channelMembers?.filter(
                              (member: IchannelMember) =>
                                member.userId !== user?.id
                            )[0].user?.id}`
                          );
                        }}
                      >
                        Go to profile
                      </RightClickMenuItem>
                    </>
                  )}
                <RightClickMenuItem
                  onClick={async () => {
                    if (!isBlockingOrUnblocking) {
                      setIsBlockingOrUnblocking(true);
                      try {
                        if (!isBlocked) {
                          await handleBlockUser(
                            currentChannel?.channelMembers?.filter(
                              (member: IchannelMember) =>
                                member.userId !== user?.id
                            )[0].user?.id
                          );
                        } else {
                          await handleUnblockUser(
                            currentChannel?.channelMembers?.filter(
                              (member: IchannelMember) =>
                                member.userId !== user?.id
                            )[0].user?.id
                          );
                        }
                      } catch (err) {
                        toast.error(
                          "Something went wrong. Please try again later."
                        );
                      } finally {
                        setIsBlockingOrUnblocking(false);
                      }
                    }
                  }}
                >
                  {isBlockingOrUnblocking
                    ? "Processing..."
                    : isBlocked
                      ? "Unblock User"
                      : "Block User"}
                </RightClickMenuItem>
              </RightClickMenu>
            </div>
          )}
        </div>
      </div>

      {
        // !spinner ?
        !messages ? (
        <div className="mb-2 flex h-full flex-col  justify-end gap-2 z-[0] px-[10px] ">
          <div className="flex justify-center items-center h-full">
            <Spinner/>
          </div>
        </div>
        )
        : (
        <div className="mb-2 flex flex-col overflow-y-scroll scroll-smooth scrollbar-hide h-full first:space-y-4 gap-2 z-[0] px-[10px] ">
          {messages?.map((message, index) => {
            return index !== messages.length - 1 ? (
              <div
                key={message.id}
                className={`first-of-type:mt-auto transition-all duration-500 transform  ${index > 0 ? "translate-y-2" : ""
                  }`}
              >
                {new Date(message.date).getDay() !==
                  new Date(
                    messages[messages.indexOf(message) - 1]?.date
                  ).getDay() && (
                    <Divider
                      center
                      title={
                        //check if date is less than 10, if so add a 0 in front of it
                        `${new Date(message.date).getDate() < 10
                          ? "0" + new Date(message.date).getDate()
                          : new Date(message.date).getDate()
                        }-${new Date(message.date).getMonth() < 12
                          ? "0" + (new Date(message.date).getMonth() + 1)
                          : new Date(message.date).getMonth() + 1
                        }-${new Date(message.date).getFullYear()}`
                      }
                    />
                  )}
                <MessageBox
                  autoScroll={autoScroll}
                  key={message.id}
                  message={message}
                  right={message.senderId === user?.id}
                />
              </div>
            ) : (
              <div
                key={message.id}
                ref={refMessage}
                className={`first-of-type:mt-auto transition-all duration-500 transform  ${index > 0 ? "translate-y-2" : ""
                  }`}
              >
                {new Date(message.date).getDay() !==
                  new Date(
                    messages[messages.indexOf(message) - 1]?.date
                  ).getDay() && (
                    <Divider
                      center
                      title={
                        //check if date is less than 10, if so add a 0 in front of it
                        `${new Date(message.date).getDate() < 10
                          ? "0" + new Date(message.date).getDate()
                          : new Date(message.date).getDate()
                        }-${new Date(message.date).getMonth() < 12
                          ? "0" + (new Date(message.date).getMonth() + 1)
                          : new Date(message.date).getMonth() + 1
                        }-${new Date(message.date).getFullYear()}`
                      }
                    />
                  )}
                <MessageBox
                  autoScroll={autoScroll}
                  key={message.id}
                  message={message}
                  right={message.senderId === user?.id}
                />
              </div>
            );
          })}
          <div className="mt-5"></div>
        </div>)
        // :
        // <div className="mb-2 flex h-full flex-col  justify-end gap-2 z-[0] px-[10px] ">
        //   <div className="flex justify-center items-center h-full">
        //     <Spinner/>
        //   </div>
        // </div>
      }
      <div className="flex w-full  items-center bg-secondary-700 sticky bottom-0 ">
        <Button
          variant="text"
          className="!hover:bg-inherit !bg-inherit text-primary-500"
          onClick={() => {
            setShowPicker(true);
          }}
          disabled={
            currentChannel?.channelMembers?.filter(
              (member: IchannelMember) => member.userId === user?.id
            )[0].status !== "ACTIVE" ||
            isBlocked ||
            isBlocking
          }
        >
          <Smile />
        </Button>
        <Input
          disabled={
            currentChannel?.channelMembers?.filter(
              (member: IchannelMember) => member.userId === user?.id
            )[0].status !== "ACTIVE" ||
            isBlocked ||
            isBlocking
          }
          placeholder={
            currentChannel?.channelMembers?.filter(
              (member: IchannelMember) => member.userId === user?.id
            )[0].status === "MUTED"
              ? "You are muted, you can't send messages!"
              : currentChannel?.channelMembers?.filter(
                (member: IchannelMember) => member.userId === user?.id
              )[0].status === "BANNED"
                ? "You are banned, you can't send messages!"
                : currentChannel?.channelMembers?.filter(
                  (member: IchannelMember) => member.userId === user?.id
                )[0].status === "LEFT"
                  ? "You have left this channel or have been kicked !"
                  : isBlocked
                    ? "You blocked this user!"
                    : isBlocking
                      ? "You are blocked by this user!"
                      : "type something"
          }
          value={value}
          inputRef={inputRef}
          onKeyDown={(event: any) => {
            if (event.key === "Enter") {
              handleSendMessage(value);
            }
          }}
          onChange={(event) => {
            const { value } = event.target;
            setValue(value);
          }}
        />

        <Button
          variant="text"
          className="!hover:bg-inherit !bg-inherit text-primary-500"
          disabled={
            currentChannel?.channelMembers?.filter(
              (member: IchannelMember) => member.userId === user?.id
            )[0].status !== "ACTIVE" ||
            isBlocked ||
            isBlocking
          }
          onClick={() => {
            handleSendMessage(value);
          }}
        >
          <SendHorizonal />
        </Button>
      </div>
      {Setowner && (
        <Modal
          className="z-10 bg-secondary-800
          border-none flex flex-col items-center justify-start shadow-lg shadow-secondary-500 gap-4 text-white min-w-[90%]
          lg:min-w-[40%] xl:min-w-[800px] animate-jump-in animate-ease-out animate-duration-400"
        >
          <div className="flex flex-col w-full">
            <div className="flex w-full items-center justify-between">
              <div className="!bg-inherit !text-white hover:bg-inherit ml-2">
                Set new owner
              </div>
              <Button
                variant="text"
                className=" !bg-inherit text-2xl !text-white hover:bg-inherit"
                onClick={() => {
                  setSetowner(false);
                }}
              >
                <X />
              </Button>
            </div>
            <Divider center className="w-full" />
          </div>
          <div className="flex w-full flex-col items-start justify-start gap-4 bg-inherit pt-4">
            {currentChannel?.channelMembers
              ?.filter(
                (member: IchannelMember) =>
                  member.status !== "BANNED" &&
                  member.status !== "LEFT" &&
                  !checkBlock(member.userId)
              )
              .map((member: IchannelMember) => {
                return (
                  <ProfileBanner
                    channelMember={
                      currentChannel?.channelMembers?.filter(
                        (channelMember: IchannelMember) =>
                          channelMember.userId === user?.id
                      )[0]
                    }
                    user={user?.id}
                    showOptions
                    showStatus
                    key={member.userId}
                    status={member.status}
                    role={member.role}
                    channelId={currentChannel?.id}
                    userId={member.userId}
                    name={member.user.username}
                    avatar={member.user.avatar}
                    description={member.user.status}
                  />
                );
              })}
            <div className="flex flex-row items-center justify-center self-center pt-3">
              <Button
                className="!bg-inherit !text-white hover:bg-inherit justify-between w-full !font-medium mr-3"
                onClick={() => {
                  setSetowner(false);
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-primary-500  justify-between w-full !font-medium mr-1"
                onClick={() => {
                  handleLeave();
                }}
              >
                <LogOut />
                Leave
              </Button>
            </div>
          </div>
        </Modal>
      )}
      {showConfirm && (
        <Modal
          className="z-10 bg-secondary-800
          border-none flex flex-col items-center justify-start shadow-lg shadow-secondary-500 gap-4 text-white min-w-[90%]
          lg:min-w-[40%] xl:min-w-[800px] animate-jump-in animate-ease-out animate-duration-400"
        >
          <div className="flex flex-col w-full">
            <div className="flex w-full items-center justify-between">
              <div className="!bg-inherit !text-white hover:bg-inherit ml-2">
                Do you really want to leave ?
              </div>
              <Button
                variant="text"
                className=" !bg-inherit text-2xl !text-white hover:bg-inherit"
                onClick={() => {
                  setShowConfirm(false);
                }}
              >
                <X />
              </Button>
            </div>
            <Divider center className="w-full" />
          </div>
          <div className="flex flex-row items-center justify-center self-center pt-3">
            <Button
              className="!bg-inherit !text-white hover:bg-inherit justify-between w-full !font-medium mr-3"
              onClick={() => {
                setShowConfirm(false);
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-primary-500  justify-between w-full !font-medium mr-1"
              onClick={() => {
                socket?.emit("channel_leave", {
                  channelId: currentChannel?.id,
                  userId: user?.id,
                });
                setShowConfirm(false);
              }}
            >
              <LogOut />
              Leave
            </Button>
          </div>
        </Modal>
      )}
      {showModal && (
        <Modal
          className="z-10 bg-secondary-800 
        border-none flex flex-col items-center justify-start shadow-lg shadow-secondary-500 gap-4 text-white min-w-[90%]
        lg:min-w-[40%] xl:min-w-[800px] animate-jump-in animate-ease-out animate-duration-400 max-h-screen overflow-y-scroll scrollbar-hide"
        >
          <div className="flex flex-col w-full">
            <div className="flex w-full items-center justify-between">
              {currentChannel?.channelMembers?.filter(
                (member: IchannelMember) => member.userId === user?.id
              )[0].role === "ADMIN" ||
                currentChannel?.channelMembers?.filter(
                  (member: IchannelMember) => member.userId === user?.id
                )[0].role === "OWNER" ? (
                <div className="!bg-inherit !text-white font-bold hover:bg-inherit pl-2">
                  Edit Channel
                </div>
              ) : (
                <div className="!bg-inherit !text-white hover:bg-inherit ml-2">
                  Channel Members
                </div>
              )}
              <Button
                variant="text"
                className=" !bg-inherit text-2xl !text-white hover:bg-inherit"
                onClick={() => {
                  closeAll();
                }}
              >
                <X />
              </Button>
            </div>
            <Divider center className="w-full" />
          </div>
          {showEdit &&
            (currentChannel?.channelMembers?.filter(
              (member: IchannelMember) => member.userId === user?.id
            )[0].role === "OWNER" ||
              currentChannel?.channelMembers?.filter(
                (member: IchannelMember) => member.userId === user?.id
              )[0].role === "ADMIN") ? (
            <div className="flex w-full flex-col items-start justify-start gap-4 bg-inherit pt-4">
              <Button
                className="!bg-inherit !text-white hover:bg-inherit justify-between w-full !font-medium"
                onClick={() => {
                  setManageMembers(true);
                  setShowEdit(false);
                }}
              >
                Manage members
                <UserCog />
              </Button>

              <Button
                className="!bg-inherit !text-white hover:bg-inherit justify-between w-full !font-medium"
                onClick={() => {
                  setChName(true);
                  setShowEdit(false);
                }}
              >
                Edit channel name
                <FileEdit />
              </Button>
              <Button
                className="!bg-inherit !text-white hover:bg-inherit justify-between w-full !font-medium"
                onClick={() => {
                  setChAvatar(true);
                  setShowEdit(false);
                }}
              >
                Edit channel avatar
                <UserCircle />
              </Button>

              <Button
                className="!bg-inherit !text-white hover:bg-inherit justify-between w-full !font-medium"
                onClick={() => {
                  setChVisibility(true);
                  setShowEdit(false);
                }}
              >
                Edit channel visibility
                <EyeOff />
              </Button>
              {currentChannel?.channelMembers?.filter(
                (member: IchannelMember) => member.userId === user?.id
              )[0].role === "OWNER" && (
                  <Button
                    className="!bg-inherit !text-white hover:bg-inherit justify-between w-full !font-medium"
                    onClick={() => {
                      setChPassword(true);
                      setShowEdit(false);
                    }}
                  >
                    {currentChannel?.isacessPassword
                      ? "Edit access password"
                      : "Add access password"}
                    <Asterisk />
                  </Button>
                )}
              <Button
                className="!bg-inherit !text-white hover:bg-inherit justify-between w-full !font-medium"
                onClick={() => {
                  setChMembers(true);
                  setShowEdit(false);
                }}
              >
                Add new members
                <UserPlus />
              </Button>

              <Button
                className="!bg-inherit !text-white hover:bg-inherit justify-between w-full !font-medium hover:shadow-none"
                onClick={() => {
                  setManageBans(true);
                  setShowEdit(false);
                }}
              >
                Banned users
                <UserX />
              </Button>
              {currentChannel?.channelMembers?.filter(
                (member: IchannelMember) => member.userId === user?.id
              )[0].role === "OWNER" && (
                  <Button
                    className="!bg-inherit !text-red-400 hover:bg-inherit justify-between w-full !font-medium"
                    onClick={() => {
                      setDeleteChannel(true);
                      setShowEdit(false);
                    }}
                  >
                    Delete channel
                    <Trash2 />
                  </Button>
                )}
              <Button
                className="w-full justify-center self-center mt-4"
                onClick={() => {
                  leaveGroup();
                }}
              >
                <LogOut />
                Leave Group
              </Button>
            </div>
          ) : currentChannel?.channelMembers?.filter(
            (member: IchannelMember) => member.userId === user?.id
          )[0].role === "MEMEBER" ? (
            <div className="flex h-max w-full flex-col items-center gap-2 pt-2">
              {currentChannel?.channelMembers
                ?.filter(
                  (member: IchannelMember) =>
                    member.status !== "BANNED" &&
                    member.status !== "LEFT" &&
                    !checkBlock(member.userId)
                )
                .map((member: IchannelMember) => {
                  return (
                    <ProfileBanner
                      channelMember={
                        currentChannel.channelMembers.filter(
                          (channelMember: IchannelMember) =>
                            channelMember.userId === user?.id
                        )[0]
                      }
                      user={user?.id}
                      showOptions
                      showStatus
                      key={member.userId}
                      status={member.status}
                      role={member.role}
                      channelId={currentChannel?.id}
                      userId={member.userId}
                      name={member.user.username}
                      avatar={member.user.avatar}
                      description={member.user.status}
                    />
                  );
                })}
              <Button
                className="w-full justify-center self-center mt-4"
                onClick={() => {
                  leaveGroup();
                }}
              >
                <LogOut />
                Leave Group
              </Button>
            </div>
          ) : null}
          {chName && (
            <UpdateChannel
              setX={setChName}
              updateX={handleEditChannelName}
              setShowEdit={setShowEdit}
              setShowModal={setShowModal}
              setValue={setGroupName}
              defaultValue={currentChannel?.name}
            >
              <Input
                label="Name"
                placeholder={currentChannel?.name}
                value={groupName}
                onChange={(event) => {
                  const { value } = event.target;
                  setGroupName(value);
                }}
              />
            </UpdateChannel>
          )}

          {deleteChannel && (
            <UpdateChannel
              setX={setDeleteChannel}
              updateX={handleDeleteChannel}
              setShowEdit={setShowEdit}
              setShowModal={setShowModal}
              verify
            >
              Would you like to delete this channel?
            </UpdateChannel>
          )}

          {chAvatar && (
            <UpdateChannel
              setX={setChAvatar}
              updateX={handleEditChannelAvatar}
              setShowModal={setShowModal}
              setShowEdit={setShowEdit}
              setValue={setPreviewImage}
              defaultValue={currentChannel?.avatar}
            >
              <UpdateAvatar
                previewImage={previewImage}
                setPreviewImage={setPreviewImage}
              />
            </UpdateChannel>
          )}
          {chVisibility && (
            <UpdateChannel
              setX={setChVisibility}
              updateX={handleEditChannelVisibility}
              setShowEdit={setShowEdit}
              setShowModal={setShowModal}
              defaultValue={currentChannel?.visiblity}
              setValue={setVisibility}
            >
              <Input
                type="select"
                label="Visibility"
                defaultValue={currentChannel?.visiblity || "PUBLIC"}
                onChange={(e) => {
                  setVisibility(e.target.value);
                }}
                options={[
                  {
                    label: "PUBLIC",
                    value: "PUBLIC",
                  },
                  {
                    label: "PRIVATE",
                    value: "PRIVATE",
                  },
                  {
                    label: "PROTECTED",
                    value: "PROTECTED",
                  },
                ]}
              />
              {visibility === "PROTECTED" && (
                <Input
                  className="!mt-2"
                  label="Password [required]"
                  placeholder="*****************"
                  htmlType="password"
                  value={password.trim()}
                  onChange={(event) => {
                    const { value } = event.target;
                    setPassword(value.trim());
                  }}
                />
              )}
            </UpdateChannel>
          )}
          {chMembers && (
            <UpdateChannel
              className="!w-full"
              setX={setChMembers}
              updateX={handleAddMembers}
              setShowEdit={setShowEdit}
              setShowModal={setShowModal}
            >
              {users?.filter((u: IUser) => {
                return (
                  u.id !== user?.id &&
                  !checkBlock(u.id) &&
                  (currentChannel?.channelMembers.find(
                    (cm: IchannelMember) => cm.userId === u.id
                  ) === undefined ||
                    currentChannel?.channelMembers.find(
                      (cm: IchannelMember) => cm.userId === u.id
                    )?.status === "LEFT")
                );
              }).length ? (
                users
                  ?.filter((u: IUser) => {
                    return (
                      u.id !== user?.id &&
                      !checkBlock(u.id) &&
                      (currentChannel?.channelMembers.find(
                        (cm: IchannelMember) => cm.userId === u.id
                      ) === undefined ||
                        currentChannel?.channelMembers.find(
                          (cm: IchannelMember) => cm.userId === u.id
                        )?.status === "LEFT")
                    );
                  })
                  .map((u: IUser) => {
                    return (
                      <div
                        key={u.id}
                        className="flex flex-row items-center justify-between w-full"
                      >
                        <ProfileBanner
                          key={u.id}
                          avatar={u.avatar}
                          name={u.username}
                          description={u.status}
                        />
                        <div className="w-8">
                          <input
                            type="checkbox"
                            className="h-5 w-5"
                            onChange={() => {
                              !selectedUsers.includes(u.id)
                                ? setSelectedUsers([...selectedUsers, u.id])
                                : setSelectedUsers(
                                  selectedUsers?.filter((id) => id !== u.id)
                                );
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="flex flex-col items-center justify-center w-full">
                  <p className="text-gray-500 text-lg">No users found</p>
                </div>
              )}
            </UpdateChannel>
          )}

          {chPassword && (
            <UpdateChannel
              setX={setChPassword}
              updateX={handleEditChannelPassword}
              setShowEdit={setShowEdit}
              setShowModal={setShowModal}
              setValue={setAccessPassword}
              remove={currentChannel?.isacessPassword}
              handleRemovePassword={handleRemovePassword}
              defaultValue=""
            >
              <Input
                label={
                  currentChannel?.isacessPassword
                    ? "Edit password"
                    : "Set password"
                }
                htmlType="password"
                placeholder="*****************"
                value={accessPassword.trim()}
                onChange={(event) => {
                  const { value } = event.target;
                  setAccessPassword(value.trim());
                }}
              />
            </UpdateChannel>
          )}

          {manageBans && (
            <UpdateChannel
              className="!w-full"
              updatable
              setX={setManageBans}
              updateX={() => { }}
              setShowEdit={setShowEdit}
              setShowModal={setShowModal}
            >
              <div className=" w-full pt-2">
                {currentChannel?.channelMembers?.filter(
                  (member: IchannelMember) =>
                    member.status === "BANNED" && !checkBlock(member.userId)
                ).length ? (
                  currentChannel?.channelMembers
                    ?.filter(
                      (member: IchannelMember) =>
                        member.status === "BANNED" && !checkBlock(member.userId)
                    )
                    .map((member: IchannelMember) => {
                      return (
                        <ProfileBanner
                          channelMember={
                            currentChannel.channelMembers.filter(
                              (channelMember: IchannelMember) =>
                                channelMember.userId === user?.id
                            )[0]
                          }
                          user={user?.id}
                          showOptions
                          showStatus
                          key={member.userId}
                          status={member.status}
                          role={member.role}
                          channelId={currentChannel?.id}
                          userId={member.userId}
                          name={member.user.username}
                          avatar={member.user.avatar}
                          description={member.user.status}
                        />
                      );
                    })
                ) : (
                  <div className="flex flex-col items-center justify-center w-full">
                    <p className="text-gray-500 text-lg">No banned users</p>
                  </div>
                )}
              </div>
            </UpdateChannel>
          )}
          {manageMembers && (
            <UpdateChannel
              className="!w-full"
              updatable
              setX={setManageMembers}
              updateX={() => { }}
              setShowEdit={setShowEdit}
              setShowModal={setShowModal}
            >
              <div className="flex h-max w-full flex-col items-center gap-2 pt-2 ">
                {currentChannel?.channelMembers
                  ?.filter(
                    (member: IchannelMember) =>
                      member.status !== "BANNED" &&
                      member.status !== "LEFT" &&
                      !checkBlock(member.userId)
                  )
                  .map((member: IchannelMember) => {
                    return (
                      <ProfileBanner
                        channelMember={
                          currentChannel.channelMembers.filter(
                            (channelMember: IchannelMember) =>
                              channelMember.userId === user?.id
                          )[0]
                        }
                        user={user?.id}
                        showOptions
                        showStatus
                        key={member.userId}
                        status={member.status}
                        role={member.role}
                        channelId={currentChannel?.id}
                        userId={member.userId}
                        name={member.user.username}
                        avatar={member.user.avatar}
                        description={member.user.status}
                      />
                    );
                  })}
              </div>
            </UpdateChannel>
          )}
        </Modal>
      )}
    </div>
  );
};

export default MessageBubble;
