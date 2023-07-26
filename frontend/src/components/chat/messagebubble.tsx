import Button from "../button";
import Input from "../input";
import MessageBox from "./messagebox";

import { BsEmojiSmileFill, BsSendFill } from "react-icons/bs";
import { BiRename, BiLeftArrow } from "react-icons/bi";
import { RiCloseFill, RiLogoutBoxRLine, RiDeleteBin6Line } from "react-icons/ri";
import {RxAvatar} from "react-icons/rx";
import {MdOutlineVisibilityOff, MdOutlinePassword, MdOutlineManageAccounts} from "react-icons/md";
import {AiOutlineUsergroupAdd} from "react-icons/ai";
import {TbUserOff} from "react-icons/tb"
import {FcMenu} from "react-icons/fc"

import Avatar from "../avatar";
import { useState, useRef, useContext, useEffect, useCallback } from "react";
import { useClickAway } from "react-use";
import Modal from "../modal";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import Divider from "../divider";
import ProfileBanner from "../profilebanner";
import { AppContext, fetcher } from "../../context/app.context";
import UpdateAvatar from "../update-avatar";
import { ChatContext, Ichannel, IchannelMember, Imessage } from "../../context/chat.context";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import UpdateChannel from "./updateChannel";
import RightClickMenu, { RightClickMenuItem } from "../rightclickmenu";
import axios from "axios";
import useSWR from "swr";
import { toast } from "react-toastify";
import CustomSelect from "../select";

interface ChannelProps {
  className?: string;
  setOpen: any;
  setCurrentChannel: any;
  currentChannel?: Ichannel;
  channelMember?: IchannelMember;
  messages: Imessage[];
  inputRef:any;
};

const MessageBubble : React.FC<ChannelProps> = ({ className, setOpen, setCurrentChannel, currentChannel, channelMember, messages, inputRef } : ChannelProps) => {
  const [value, setValue] = useState<string>("");
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showEdit, setShowEdit] = useState<boolean>(false);
  const [visibility, setVisibility] = useState<string | undefined>(currentChannel?.visiblity);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [previewImage, setPreviewImage] = useState<string>(currentChannel?.avatar || "");
  const [groupName, setGroupName] = useState<string>(currentChannel?.name || "");
  const [password, setPassword] = useState<string>("");
  const [accessPassword, setAccessPassword] = useState<string>("");
  const [chName , setChName] = useState<boolean>(false);
  const [chPassword , setChPassword] = useState<boolean>(false);
  const [chVisibility , setChVisibility] = useState<boolean>(false);
  const [chMembers , setChMembers] = useState<boolean>(false);
  const [chAvatar , setChAvatar] = useState<boolean>(false);
  const [manageMembers , setManageMembers] = useState<boolean>(false);
  const [manageBans , setManageBans] = useState<boolean>(false);
  const [deleteChannel, setDeleteChannel] = useState<boolean>(false);
  const [DmMemu, setDmMenu] = useState<boolean>(false);
  const [Setowner, setSetowner] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [messageId, setMessageId] = useState<number | undefined>(0);
  const [chId, setChId] = useState<number | undefined>(0);
  
  const navigate = useNavigate();
  const {socket} = useContext(ChatContext);
  const {user} = useContext(AppContext);
  const refMessage = useRef(null);
  
  const [blocking, setBlocking] = useState<any[]>(user?.blocking?.map((blocking)=> {return blocking.blockerId}) as any[]);
  const [blocked, setBlocked] = useState<any[]>(user?.blockers?.map((blocker)=> {return blocker.blockingId}) as any[]);
  
  const isBlocked = (currentChannel?.type === "CONVERSATION" && blocked.includes(currentChannel?.channelMembers?.filter((member: IchannelMember) => member.userId !== user?.id)[0].user?.id));
  const isBlocking = (currentChannel?.type === "CONVERSATION" && blocking.includes(currentChannel?.channelMembers?.filter((member: IchannelMember) => member.userId !== user?.id)[0].user?.id));
  
  useEffect(() => {
    setValue("");
}, [currentChannel]);

let { data: users } = useSWR('api/users', fetcher, {
  errorRetryCount: 0,
  timeout : 1000
});

const getBlocking = useCallback(async () => {
  const res = await fetcher(`api/users/${user?.id}/blocking-users`);
  //map with blockerId
  if (res === undefined)
    return;
  setBlocking(res.map((blocking : any)=> {return blocking.blockerId}));
}, [user?.id])

const getBlocked = useCallback(async () => {
  const res = await fetcher(`api/users/${user?.id}/blocked-users`);
  if (res === undefined)
    return;
  //map with blockingId
  setBlocked(res.map((blocker : any)=> {return blocker.blockingId}));
}, [user?.id])

useEffect(() => {
  getBlocking();
  getBlocked();
  // eslint-disable-next-line react-hooks/exhaustive-deps
},[]);

  const checkBlock = (userId : number | undefined) =>
  {
    return (blocking.includes(userId) || blocked.includes(userId));
  }

  const autoScroll = useCallback(() => {
    const scroll = refMessage.current;
    if (scroll) {
      (scroll as HTMLElement).scrollIntoView({
        behavior: 'smooth'
      });
    }
  }, []);

  const handleMessage = useCallback((data :  Imessage) => {
    setMessageId(data?.receiverId);
    if (messageId === chId) {
      autoScroll();
    }
  }, [autoScroll, chId, currentChannel, messageId]);
  
  useEffect(() => {
    socket?.on("message", handleMessage);
    socket?.on("blockUser", () => {
      getBlocking();
      getBlocked();
      socket?.emit("getChannelMessages", {channelId : currentChannel?.id, user: {id: user?.id}});
    });
  
    return () => {
      socket?.off("message", handleMessage);
    }
  }, [handleMessage, socket, currentChannel, user, getBlocking, getBlocked]);

  useEffect(() => {
    setVisibility(currentChannel?.visiblity);
    setPreviewImage(currentChannel?.avatar || "");
    setGroupName(currentChannel?.name || "");
    autoScroll();
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
  const handleEmojiSelect = (emoji: string) => {
    setValue((prevMessage) => prevMessage + emoji);
  };

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
  };

  const handleSendMessage = (value : string) => {
    if (value.trim() === "")
      return;
    if (value) {
      socket?.emit('message', {senderId: user?.id, receiverId: currentChannel?.id, content: value});
      setValue("");
    }
  };

  const handleLeave = () => {
    if (currentChannel?.channelMembers?.filter((member: IchannelMember) => member.role === "OWNER").length === 1)
    {
      if (currentChannel?.channelMembers?.filter((member: IchannelMember) => member.status === "ACTIVE").length === 1 && channelMember?.role === "OWNER")
      {
        socket?.emit("channel_remove", { channelId: currentChannel?.id, userId: user?.id });
        setShowModal(false);
        setSetowner(false);
        setCurrentChannel(null);
        inputRef.current?.blur();
        setOpen(false);
        return;
      }
      toast.error("You can't leave this channel until you set a new owner!");
    }
    else
    {
      socket?.emit("channel_leave", { channelId: currentChannel?.id, userId: user?.id });
      setShowModal(false);
      setSetowner(false);
    }
  };

  const leaveGroup = () => {
    // check if user is the only owner if so he can't leave until he set a new owner
    if (currentChannel?.channelMembers?.filter((member: IchannelMember) => member.role === "OWNER").length === 1 && currentChannel?.channelMembers?.filter((member: IchannelMember) => member.role === "OWNER")[0].userId === user?.id)
    {
      setShowModal(false);
      setSetowner(true);
      return;
    }
    setShowModal(false);
    setShowConfirm(true);
  };

  const handleDeleteChannel = () => {
    socket?.emit("channel_remove", { channelId: currentChannel?.id});
    setCurrentChannel(null);
    inputRef.current?.blur();
    setOpen(false);
  };

  const handleEditChannelName = () => {
    socket?.emit("channel_update", { id: currentChannel?.id, name: groupName, type: "name" });
  };

  const handleEditChannelPassword = () => {
    socket?.emit("channel_update", { id: currentChannel?.id, access_pass: accessPassword, type: "access_pass" });
    setAccessPassword("");
  };

  const handleEditChannelVisibility = () => {
    socket?.emit("channel_update", { id: currentChannel?.id, visibility: visibility || currentChannel?.visiblity, type: "visibility", password});
    setPassword("");
  };

  const handleEditChannelAvatar = () => {
    socket?.emit("channel_update", { id: currentChannel?.id, avatar: previewImage, type: "avatar"});
  };

  const  handleBlockUser = async (userId: number | undefined) =>
  {
    const accessToken = window.localStorage.getItem("access_token");
    const response = await axios.post(`${process.env.REACT_APP_BACK_END_URL}api/users/block-user`, 
      {
        blockerId: user?.id, blockingId: userId
      },
      {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
    if (response)
    {
      getBlocking();
      getBlocked();
      setDmMenu(false);
      socket?.emit("refresh_channel", {channelId: currentChannel?.id, userId: userId})
      socket?.emit("getChannelMessages", {channelId : currentChannel?.id, user: {id: user?.id}});
      socket?.emit("blockUser", {blockerId: user?.id, blockedId: userId, isBlock: true});
    }
  }
  
  const  handleUnblockUser = async (userId: number | undefined) =>
  {
    const accessToken = window.localStorage.getItem("access_token");
    const response = await axios.post(`${process.env.REACT_APP_BACK_END_URL}api/users/unblock-user`, 
    {blockerId: user?.id, blockingId: userId},
    {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      if (response)
      {
        getBlocking();
        getBlocked();
        setDmMenu(false);
        socket?.emit("refresh_channel", {channelId: currentChannel?.id, userId: userId})
        socket?.emit("getChannelMessages", {channelId : currentChannel?.id, user: {id: user?.id}});
        socket?.emit("blockUser", {blockerId: user?.id, blockedId: userId});
    }
  }
  
  const handleRemovePassword = () =>
  {
    socket?.emit("channel_update", { id: currentChannel?.id, type: "rm_access_pass"});
  }

  const handleAddMembers = () => {
    socket?.emit("channel_update", { id: currentChannel?.id, members: selectedUsers, type: "members" });
    setSelectedUsers([]);
  };
  return (
    <div id="chat-window" className={clsx("col-span-10 flex h-screen w-full flex-col justify-start rounded-t-3xl bg-secondary-600 lg:col-span-7", className && className)}>
      <div className=" bg-secondary-400 rounded-t-3xl align-middle items-center  sticky top-0 z-20">
        <div className="relative grid grid-cols-10 lg:grid-cols-12">
          <Button
              type="simple"
              className="!items-end bg-secondary-400 !text-white col-span-1 lg:hidden self-center !w-fit m-auto\"
              onClick={() => {
                setOpen(false);
                inputRef.current?.blur();
                setCurrentChannel("");
                setDmMenu(false)
              }}
              >
              <BiLeftArrow />
            </Button>
            <div
              className="flex items-center gap-2 col-span-8 lg:col-span-11 text-white lg:order-first px-2 py-3 font-semi-bold self-center"
              >
              <Avatar src={currentChannel?.type !== "CONVERSATION" ? currentChannel?.avatar : 
                          currentChannel?.channelMembers?.filter((member: IchannelMember) => member.userId !== user?.id)[0].user?.avatar } alt="" 
                          status={currentChannel?.type !== "CONVERSATION" ? false : 
                          currentChannel?.channelMembers?.filter((member: IchannelMember) => member.userId !== user?.id)[0].user?.status === "ONLINE" && 
                          !checkBlock(currentChannel?.channelMembers?.filter((member: IchannelMember) => member.userId !== user?.id)[0].user?.id)}
                          />
              <div>{currentChannel?.type !== "CONVERSATION" ? currentChannel?.name : currentChannel?.channelMembers?.filter((member: IchannelMember) => member.userId !== user?.id)[0].user?.username}</div>
            </div>
            <Button className="col-span-1 flex items-center justify-content bg-secondary-400 !p-1 !text-white font-semi-bold self-center !w-fit !m-auto"
              type="simple"
              onClick={() => {
                if (currentChannel?.type !== "CONVERSATION" && channelMember?.status === "ACTIVE")
                {
                  setShowModal(true);
                  setShowEdit(true);
                } 
                else if (currentChannel?.type === "CONVERSATION")
                {
                  setDmMenu(!DmMemu);
                }
              }}
            >
              <FcMenu/>
            </Button>
            { DmMemu && (
              <div ref={ref1} className="absolute right-4 top-10 md:right-8 lg:right:4 xl:right-10 2xl:right-17  w-[150px]">
                <RightClickMenu >
                  {!checkBlock(currentChannel?.channelMembers?.filter((member: IchannelMember) => member.userId !== user?.id)[0].user?.id) && (
                    <>
                    <RightClickMenuItem
                    onClick={() => {
                      
                    }}
                    >
                      Invite to play
                    </RightClickMenuItem>
                    <RightClickMenuItem
                    onClick={() => {
                      navigate(`/profile/${currentChannel?.channelMembers?.filter((member: IchannelMember) => member.userId !== user?.id)[0].user?.id}`);
                    }}
                    >
                      Go to profile
                    </RightClickMenuItem>
                    </>
                  )}
                  <RightClickMenuItem
                    onClick={() => {
                      !isBlocked ? handleBlockUser(currentChannel?.channelMembers?.filter((member: IchannelMember) => member.userId !== user?.id)[0].user?.id) :
                      handleUnblockUser(currentChannel?.channelMembers?.filter((member: IchannelMember) => member.userId !== user?.id)[0].user?.id)
                    }
                  }
                  >
                  {!isBlocked ? 'Block user' : 'Unblock user'}
                  </RightClickMenuItem>
                </RightClickMenu>
              </div>
            )
          }
        </div>
      </div>
      
      {
        // !spinner ?
      <div className="mb-2 flex flex-col overflow-y-scroll scroll-smooth scrollbar-hide h-full first:space-y-4 gap-2 z-[0] px-[10px] ">
        {
          messages?.map((message, index) => {
            return (
              <div key={message.id} className={`first-of-type:mt-auto transition-all duration-500 transform  ${index > 0 ? 'translate-y-2' : ''}`}>
                {new Date(message.date).getDay() !== new Date(messages[messages.indexOf(message) - 1]?.date).getDay() && (
                <Divider center title={ 
                  //check if date is less than 10, if so add a 0 in front of it
                  `${  new Date(message.date).getDate() < 10 ? '0' + new Date(message.date).getDate() : 
                    new Date(message.date).getDate()}-${ new Date(message.date).getMonth() < 12 ? '0' + (new Date(message.date).getMonth() + 1) : 
                    new Date(message.date).getMonth() + 1}-${new Date(message.date).getFullYear()}`}
                />)}
                <MessageBox
                autoScroll={autoScroll}
                key={message.id}
                message={message}
                right={(message.senderId === user?.id)} 
                />          
            </div>
            ) 
        })}
        <div ref={refMessage} className="h-[100px] mt-20"></div>
      </div>
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
          disabled={channelMember?.status !== "ACTIVE" || isBlocked || isBlocking }
        >
          <BsEmojiSmileFill />
        </Button>
        <Input
          disabled={channelMember?.status !== "ACTIVE" || isBlocked || isBlocking }
          placeholder={(channelMember?.status === "MUTED" ? "You are muted, you can't send messages!" : channelMember?.status === "BANNED" ? "You are banned, you can't send messages!" : channelMember?.status === "LEFT" ? "You have left this channel or have been kicked !"
          : isBlocked ? "You blocked this user!" : isBlocking ? "You are blocked by this user!": "type something")}
          value={value}
          inputRef={inputRef}
          onKeyDown={(event) => {
            if (event.key === "Enter")
              handleSendMessage(value);
          }}
          onChange={(event) => {
            const { value } = event.target;
            setValue(value);
          }}
        />

        <Button
          variant="text"
          className="!hover:bg-inherit !bg-inherit text-primary-500"
          disabled={channelMember?.status !== "ACTIVE" || isBlocked || isBlocking }        
          onClick={() => {
            handleSendMessage(value);
          }}
        >
          <BsSendFill />
        </Button>
      </div>
      {showPicker && (
        <div ref={ref} className="h-50 absolute bottom-14 w-1">
          <Picker
            data={data}
            onEmojiSelect={(e: any) => {
              handleEmojiSelect(e.native);
            }}
          />
        </div>
      )}
      {
        Setowner && (
          <Modal
          className="z-10 bg-secondary-800
          border-none flex flex-col items-center justify-start shadow-lg shadow-secondary-500 gap-4 text-white min-w-[90%]
          lg:min-w-[40%] xl:min-w-[800px] animate-jump-in animate-ease-out animate-duration-400"
          >
            <div className="flex flex-col w-full">
              <div className="flex w-full items-center justify-between">
                <div
                  className="!bg-inherit !text-white hover:bg-inherit ml-2">
                    Set new owner
                  </div>
                <Button
                  variant="text"
                  className=" !bg-inherit text-2xl !text-white hover:bg-inherit"
                  onClick={() => {
                    setSetowner(false);
                  }}
                  >
                  <RiCloseFill /> 
                </Button>
              </div>
              <Divider center className="w-full"/>
            </div>
            <div className="flex w-full flex-col items-start justify-start gap-4 bg-inherit pt-4">
                {currentChannel?.channelMembers?.filter((member : IchannelMember) => member.status !== "BANNED" && member.status !== "LEFT" && !checkBlock(member.userId)).map((member : IchannelMember) => {
                  return (
                    <ProfileBanner
                    channelMember={channelMember}
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
                    <RiLogoutBoxRLine />
                    Leave
                  </Button>
                </div>
            </div>
          </Modal>
        )
      }
      {
        showConfirm && (
          <Modal
          className="z-10 bg-secondary-800
          border-none flex flex-col items-center justify-start shadow-lg shadow-secondary-500 gap-4 text-white min-w-[90%]
          lg:min-w-[40%] xl:min-w-[800px] animate-jump-in animate-ease-out animate-duration-400"
          >
            <div className="flex flex-col w-full">
              <div className="flex w-full items-center justify-between">
                <div
                  className="!bg-inherit !text-white hover:bg-inherit ml-2">
                    Do you really want to leave ?
                  </div>
                <Button
                  variant="text"
                  className=" !bg-inherit text-2xl !text-white hover:bg-inherit"
                  onClick={() => {
                    setShowConfirm(false);
                  }}
                  >
                  <RiCloseFill /> 
                </Button>
              </div>
              <Divider center className="w-full"/>
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
                  socket?.emit("channel_leave", { channelId: currentChannel?.id, userId: user?.id });
                  setShowConfirm(false);
                }}
                >
                <RiLogoutBoxRLine />
                Leave
              </Button>
            </div>
          </Modal>
          )
        }
      {showModal &&  (
        <Modal
        className="z-10 bg-secondary-800 
        border-none flex flex-col items-center justify-start shadow-lg shadow-secondary-500 gap-4 text-white min-w-[90%]
        lg:min-w-[40%] xl:min-w-[800px] animate-jump-in animate-ease-out animate-duration-400"
        >
          <div className="flex flex-col w-full">
            <div className="flex w-full items-center justify-between">
              {
                (channelMember?.role === "ADMIN" || channelMember?.role === "OWNER" ) ? (
                  <div
                  className="!bg-inherit !text-white hover:bg-inherit ml-2">
                      Edit Channel
                    </div>
                  ) :
                  (
                    <div
                    className="!bg-inherit !text-white hover:bg-inherit ml-2">
                        Channel Members
                      </div>
                  )
              }
              <Button
                variant="text"
                className=" !bg-inherit text-2xl !text-white hover:bg-inherit"
                onClick={() => {
                  closeAll();
                }}
                >
                <RiCloseFill />
              </Button>
            </div>
            <Divider center className="w-full"/>
          </div>
          {
            (showEdit && (channelMember?.role === "OWNER" || channelMember?.role === "ADMIN")) ? (
            <div className="flex w-full flex-col items-start justify-start gap-4 bg-inherit pt-4">
                <Button
                    className="!bg-inherit !text-white hover:bg-inherit justify-between w-full !font-medium"
                    onClick={() => {
                        setManageMembers(true);
                        setShowEdit(false);
                      }}
                      >
                Manage members
                <MdOutlineManageAccounts />
                </Button>

                <Button
                    className="!bg-inherit !text-white hover:bg-inherit justify-between w-full !font-medium"
                    onClick={() => {
                        setChName(true);
                        setShowEdit(false);
                      }}
                      >
                Edit channel name
                <BiRename />
                </Button>
              <Button
                    className="!bg-inherit !text-white hover:bg-inherit justify-between w-full !font-medium"
                    onClick={() => {
                      setChAvatar(true);
                      setShowEdit(false);
                    }}
                  >
                    Edit channel avatar
                    <RxAvatar />
              </Button>

              <Button
                    className="!bg-inherit !text-white hover:bg-inherit justify-between w-full !font-medium"
                    onClick={() => {
                      setChVisibility(true);
                      setShowEdit(false);
                    }}
                  >
                    Edit channel visibility
                    <MdOutlineVisibilityOff />
              </Button>
              {
                channelMember?.role === "OWNER" && (
                <Button
                className="!bg-inherit !text-white hover:bg-inherit justify-between w-full !font-medium"
                onClick={() => {
                  setChPassword(true);
                  setShowEdit(false);
                }}
                >
                    Edit access password
                    <MdOutlinePassword />
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
                    <AiOutlineUsergroupAdd />
              </Button>

              <Button
                    className="!bg-inherit !text-white hover:bg-inherit justify-between w-full !font-medium"
                    onClick={() => {
                      setManageBans(true);
                      setShowEdit(false);
                    }}
                  >
                    Banned users
                    <TbUserOff />
              </Button>
              {
                channelMember?.role === "OWNER" && (
                  <Button
                        className="!bg-inherit !text-white hover:bg-inherit justify-between w-full !font-medium"
                        onClick={() => {
                          setDeleteChannel(true);
                          setShowEdit(false);
                        }}
                      >
                        Delete channel
                        <RiDeleteBin6Line />
                  </Button>
                )
              }
                  <Button
                    className="w-[50%] md:w-[30%] lg:w[50%] 2xl:w-[50%] justify-center self-center mt-4"
                    onClick={() => {
                      leaveGroup();
                    }}
                    >
                    <RiLogoutBoxRLine />
                    Leave Group
                  </Button>
              </div>
            ) 
            :
            channelMember?.role === "MEMEBER" ? 
            (
              <div className="flex h-max w-full flex-col items-center gap-2 pt-2">
                {currentChannel?.channelMembers?.filter((member : IchannelMember) => member.status !== "BANNED" && member.status !== "LEFT" && !checkBlock(member.userId)).map((member : IchannelMember) => {
                  return (
                    <ProfileBanner
                    channelMember={channelMember}
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
                    className="w-[50%] md:w-[30%] lg:w[50%] 2xl:w-[50%] justify-center self-center mt-4"
                    onClick={() => {
                      leaveGroup();
                    }}
                    >
                    <RiLogoutBoxRLine />
                    Leave Group
                  </Button>
              </div>
            ) :
             null
          }  
          {
            chName && (
              <UpdateChannel
                setX={setChName}
                updateX={handleEditChannelName}
                setShowEdit={setShowEdit}
                setShowModal={setShowModal}
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
            )
          }

          {
            deleteChannel && (
              <UpdateChannel
                setX={setDeleteChannel}
                updateX={handleDeleteChannel}
                setShowEdit={setShowEdit}
                setShowModal={setShowModal}
                verify
              >
                Would you like to delete this channel?
            </UpdateChannel>
            )
          }

          {
            chAvatar && (
              <UpdateChannel
                setX={setChAvatar}
                updateX={handleEditChannelAvatar}
                setShowModal={setShowModal}
                setShowEdit={setShowEdit}
              >
                <UpdateAvatar previewImage={previewImage} setPreviewImage={setPreviewImage} />
            </UpdateChannel>
            )
          }
          {
            chVisibility && (
              <UpdateChannel
                setX={setChVisibility}
                updateX={handleEditChannelVisibility}
                setShowEdit={setShowEdit}
                setShowModal={setShowModal}
              >
              <CustomSelect 
                className="mb-4"
                label= "Visibility" setX={setVisibility} options={["PUBLIC", "PRIVATE", "PROTECTED"]} value={currentChannel?.visiblity} 
              />
              { 
                visibility === "PROTECTED" && (
                <Input label="Password [required]" placeholder="*****************" type="password"
                value={password}
                onChange={
                  (event) => {
                    const { value } = event.target;
                    setPassword(value);
                  }
                }
                />
              )
              }
            </UpdateChannel>
            )   
          }
          {
            chMembers && (
              <UpdateChannel
                className="!w-full"
                setX={setChMembers}
                updateX={handleAddMembers}
                setShowEdit={setShowEdit}
                setShowModal={setShowModal}
              >
                <div className="w-full h[100px] flex items-center justify-center flex-col align-middle gap-2 pt-2 overflow-y-scroll scrollbar-hide">
                  {users?.filter((u : any) => {
                    return u.id !== user?.id && !checkBlock(u.id) && ((currentChannel?.channelMembers.find((cm : IchannelMember) => cm.userId === u.id) === undefined
                    || currentChannel?.channelMembers.find((cm : IchannelMember) => cm.userId === u.id)?.status === "LEFT"));
                  }).map((u : any) => {
                    return (
                      <div key={u.id} className="flex flex-row items-center justify-between w-full">
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
                                !selectedUsers.includes(u.id) ?
                                  setSelectedUsers([...selectedUsers, u.id]) :
                                  setSelectedUsers(selectedUsers?.filter((id) => id !== u.id));
                                }}
                            />
                          </div>
                        </div>
                    );
                  })}
              </div>    
              </UpdateChannel>
            )
          }

          {
            chPassword && ( 
              <UpdateChannel
                setX={setChPassword}
                updateX={handleEditChannelPassword}
                setShowEdit={setShowEdit}
                setShowModal={setShowModal}
              >
                <Input
                  label={currentChannel?.isacessPassword ? "Edit password" : "Set password"}
                  type="password"
                  placeholder="*****************"
                  value={accessPassword}
                  onChange={
                    (event) => {
                      const { value } = event.target;
                      setAccessPassword(value);
                    }
                  }
                />
                {
                  currentChannel?.isacessPassword &&
                  (
                    <Button
                    className="bg-red-400 !text-white hover:bg-inherit justify-between !w-[40%] !font-medium ml-1 mt-4"
                    onClick={() => {
                      handleRemovePassword();
                    }}
                    >
                    Remove
                    </Button>
                  )
                }
              </UpdateChannel>
            )
          }

          {
            manageBans && (
              <UpdateChannel
                className="!w-full"
                updatable
                setX={setManageBans}
                updateX={()=>{}}
                setShowEdit={setShowEdit}
                setShowModal={setShowModal}
              >
                <div className=" h-max w-full pt-2">
                  {currentChannel?.channelMembers?.filter((member : IchannelMember) => member.status === "BANNED" && !checkBlock(member.userId)).map((member : IchannelMember) => {
                    return (
                      <ProfileBanner
                      channelMember={channelMember}
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
            )
          }
          {
            manageMembers && (
            <UpdateChannel
            className="!w-full"
              updatable
              setX={setManageMembers}
              updateX={()=>{}}
              setShowEdit={setShowEdit}
              setShowModal={setShowModal}
            >
              <div className="flex h-max w-full flex-col items-center gap-2 pt-2 ">
                {currentChannel?.channelMembers?.filter((member : IchannelMember) => member.status !== "BANNED" && member.status !== "LEFT" && !checkBlock(member.userId)).map((member : IchannelMember) => {
                  return (
                    <ProfileBanner
                    channelMember={channelMember}
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
