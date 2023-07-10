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
import { useState, useRef, useContext, useEffect } from "react";
import { useClickAway } from "react-use";
import Modal from "../modal";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import Divider from "../divider";
import ProfileBanner from "../profilebanner";
import { AppContext } from "../../context/app.context";
import Select from "../select";
import UpdateAvatar from "../update-avatar";
import { ChatContext } from "../../context/chat.context";
import  Spinner  from "../spinner";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import UpdateChannel from "./updateChannel";
import RightClickMenu, { RightClickMenuItem } from "../rightclickmenu";
import axios from "axios";

const MessageBubble = ({ className, setOpen, currentChannel, channelMember }: {className?: string, setOpen: any, currentChannel?: any, channelMember?: any}) => {
  const [value, setValue] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  let   [visibility, setVisibility] = useState<string>(currentChannel?.visiblity);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  let   [previewImage, setPreviewImage] = useState<string>(currentChannel?.avatar || "");
  let   [groupName, setGroupName] = useState(currentChannel?.name || "");

  const [password, setPassword] = useState<string>("");
  const [accessPassword, setAccessPassword] = useState<string>("");
  const [spinner, setSpinner] = useState(true);
  const [chName , setChName] = useState(false);
  const [chPassword , setChPassword] = useState(false);
  const [chVisibility , setChVisibility] = useState(false);
  const [chMembers , setChMembers] = useState(false);
  const [chAvatar , setChAvatar] = useState(false);
  const [manageMembers , setManageMembers] = useState(false);
  const [manageBans , setManageBans] = useState(false);
  const [deleteChannel, setDeleteChannel] = useState(false);
  const [DmMemu, setDmMenu] = useState(false);
  
  const navigate = useNavigate();
  // const []
  // const [state, setState] = useState({
  //   value: "",
  //   showPicker: false,
  //   showModal: false,
  //   showEdit: false,
  //   messages: [],
  //   visibility: currentChannel?.visiblity,
  //   selectedUsers: [],
  //   pinnedMessages: [],
  //   previewImage: currentChannel?.avatar || "",
  // });
  const {socket, users} = useContext(ChatContext);
  const {user} = useContext(AppContext);
  const refMessage = useRef(null);

  const isBlocker = (currentChannel?.type === "CONVERSATION" && user?.blockers[0]?.blockingId === currentChannel?.channelMembers?.filter((member: any) => member.userId !== user?.id)[0].user?.id);
  const isBlocked = (currentChannel?.type === "CONVERSATION" && user?.blocking[0]?.blockerId === currentChannel?.channelMembers?.filter((member: any) => member.userId !== user?.id)[0].user?.id);
  

  const checkBlock = (userId : number) =>
  {
    return (user?.blockers[0]?.blockingId === userId || user?.blocking[0]?.blockerId === userId)
  }
  const autoScroll = () => {
    const scroll = refMessage.current;
    if (scroll) {
      (scroll as HTMLElement).scrollTo({
        top: (scroll as HTMLElement).scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    setVisibility(currentChannel?.visibility);
    setPreviewImage(currentChannel?.avatar || "");
    setGroupName(currentChannel?.name || "");
  }, [currentChannel]);

  
  useEffect(() => {
    socket?.emit("getChannelMessages", {channelId : currentChannel?.id, user: {id: user?.id}});
    socket?.on("getChannelMessages", (message: any) => {
      setMessages(message);
      setSpinner(false);
    });
    socket?.on("messsage", (message: any) => {
      autoScroll();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, messages, currentChannel]);

  const ref = useRef(null);
  useClickAway(ref, () => {
    setShowPicker(false);
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
    if (value) {
      socket?.emit('message', {senderId: user?.id, receiverId: currentChannel?.id, content: value});
      setValue("");
    }
  };

  const leaveGroup = () => {
    socket?.emit("channel_leave", { channelId: currentChannel?.id, userId: user?.id });
  };

  const handleDeleteChannel = () => {
    socket?.emit("channel_remove", { channelId: currentChannel?.id});
  };

  const handleEditChannelName = () => {
    socket?.emit("channel_update", { id: currentChannel?.id, name: groupName, type: "name" });
  };

  const handleEditChannelPassword = () => {
    socket?.emit("channel_update", { id: currentChannel?.id, access_pass: accessPassword, type: "access_pass" });
  };

  const handleEditChannelVisibility = () => {
    socket?.emit("channel_update", { id: currentChannel?.id, visibility: visibility, type: "visibility", password});
  };

  const handleEditChannelAvatar = () => {
    socket?.emit("channel_update", { id: currentChannel?.id, avatar: previewImage, type: "avatar"});
    
  };

  const  handleBlockUser = async (userId: number) =>
  {
    const accessToken = window.localStorage.getItem("access_token");
    const response = await axios.post(`${process.env.REACT_APP_BACK_END_URL}api/users/block-user`, 
      {blockerId: user?.id, blockingId: userId},
      {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
    if (response)
    {
      setDmMenu(false);
    }
  }

  const  handleUnblockUser = async (userId: number) =>
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
      setDmMenu(false);
    }
  }
  
  const handleRemovePassword = () =>
  {
    socket?.emit("channel_update", { id: currentChannel?.id, type: "rm_access_pass"});
  }

  const handleAddMembers = () => {
    socket?.emit("channel_update", { id: currentChannel?.id, members: selectedUsers, type: "members" });
  };
  return (
    <div className={clsx("relative overflow-y-auto scrollbar-hide overflow-x-hidden col-span-10 flex h-screen w-full flex-col justify-start gap-4 rounded-t-3xl bg-secondary-600 lg:col-span-7", className && className)} ref={refMessage}>
      <div className="grid grid-cols-10 lg:grid-cols-12 bg-secondary-400 rounded-t-3xl align-middle items-center top-0 mb-16 sticky absolute top-0 z-20">
      <Button
          type="simple"
          className="!items-end bg-secondary-400 !text-white col-span-1 lg:hidden self-center !w-fit m-auto\"
          onClick={() => {
            setOpen(false);
            setDmMenu(false)
          }}
          >
          <BiLeftArrow />
        </Button>
        <div
          className="flex items-center gap-2 col-span-8 lg:col-span-11 text-white lg:order-first px-2 py-3 font-semi-bold self-center"
          >
          <Avatar src={currentChannel?.type !== "CONVERSATION" ? currentChannel?.avatar : 
                      currentChannel?.channelMembers?.filter((member: any) => member.userId !== user?.id)[0].user?.avatar } alt="" 
                      status={currentChannel?.type !== "CONVERSATION" ? false : 
                      currentChannel?.channelMembers?.filter((member: any) => member.userId !== user?.id)[0].user?.status === "ONLINE"}
                      />
          <div>{currentChannel?.type !== "CONVERSATION" ? currentChannel?.name : currentChannel?.channelMembers?.filter((member: any) => member.userId !== user?.id)[0].user?.username}</div>
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
          <RightClickMenu className="!right-[10%] lg:!right-[5%]">
          <RightClickMenuItem
          onClick={() => {
            navigate(`/profile/${currentChannel?.channelMembers?.filter((member: any) => member.userId !== user?.id)[0].user?.id}`);
          }}
          >
            Go to profile

          </RightClickMenuItem>
          <RightClickMenuItem
              onClick={() => {
                !isBlocker ? handleBlockUser(currentChannel?.channelMembers?.filter((member: any) => member.userId !== user?.id)[0].user?.id) :
                handleUnblockUser(currentChannel?.channelMembers?.filter((member: any) => member.userId !== user?.id)[0].user?.id)
              }
            }
            >
            {!isBlocker ? 'Block user' : 'Unblock user'}
            </RightClickMenuItem>
          </RightClickMenu>
        )
        }
      </div>
      
      {
      !spinner ?
      <div className="mb-2 flex h-full flex-col  justify-end gap-2 z-[0] px-[10px] ">
        {
          messages?.map((message, index) => {
            return (
              <div key={message.id} className={`transition-all duration-500 transform ${index > 0 ? 'translate-y-2' : ''}`}>
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
      </div>
      : 
      <div className="mb-2 flex h-full flex-col  justify-end gap-2 z-[0] px-[10px] ">
        <div className="flex justify-center items-center h-full">
          <Spinner/>
        </div>
      </div>
      }
      <div className="absolute sticky bottom-0 flex w-full  items-center bg-secondary-700 p-1 ">
        <Button
          variant="text"
          className="!hover:bg-inherit !bg-inherit text-primary-500"
          onClick={() => {
            setShowPicker(true);
          }}
          disabled={channelMember?.status !== "ACTIVE" || isBlocker || isBlocked }
        >
          <BsEmojiSmileFill />
        </Button>
        <Input
          disabled={channelMember?.status !== "ACTIVE" || isBlocker || isBlocked }
          placeholder={(channelMember?.status === "MUTED" ? "You are muted, you can't send messages!" : channelMember?.status === "BANNED" ? "You are banned, you can't send messages!" : channelMember?.status === "LEFT" ? "You have left this channel or have been kicked !"
          : isBlocker ? "You blocked this user!" : isBlocked ? "You are blocked by this user!": "type something")}
          value={value}
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
          disabled={channelMember?.status !== "ACTIVE" || isBlocker || isBlocked }        
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
      {showModal &&  (
        <Modal>
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

              <Button
                className="w-[30%] justify-center mt-4"
                onClick={() => {
                  leaveGroup();
                  setShowModal(false);
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
              <div className="flex h-max w-full flex-col items-center gap-2 overflow-y-scroll pt-2 scrollbar-hide">
                {currentChannel?.channelMembers?.filter((member : any) => member.status !== "BANNED" && member.status !== "LEFT" && !checkBlock(member.userId)).map((member : any) => {
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
                    className="w-[30%] justify-center mt-4"
                    onClick={() => {
                      leaveGroup();
                      setShowModal(false);
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
              <Select 
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
                    return u.id !== user?.id && !checkBlock(u.id) && ((currentChannel?.channelMembers.find((cm : any) => cm.userId === u.id) === undefined
                    || currentChannel?.channelMembers.find((cm : any) => cm.userId === u.id)?.status === "LEFT"));
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
                <div className="flex h-max w-full flex-col items-center gap-2 overflow-y-scroll pt-2 scrollbar-hide">
                  {currentChannel?.channelMembers?.filter((member : any) => member.status === "BANNED" && !checkBlock(member.userId)).map((member : any) => {
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
              <div className="flex h-max w-full flex-col items-center gap-2 overflow-y-scroll pt-2 scrollbar-hide">
                {currentChannel?.channelMembers?.filter((member : any) => member.status !== "BANNED" && member.status !== "LEFT" && !checkBlock(member.userId)).map((member : any) => {
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
