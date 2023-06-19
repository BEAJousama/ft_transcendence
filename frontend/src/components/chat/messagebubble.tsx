import { BsEmojiSmileFill, BsSendFill } from "react-icons/bs";
import Button from "../button";
import Input from "../input";
import MessageBox from "./messagebox";
import { BiLeftArrow } from "react-icons/bi";
import { RiEdit2Fill, RiLogoutBoxRLine } from "react-icons/ri";
import Avatar from "../avatar";
import { useState, useRef, useContext, useEffect } from "react";
import { useClickAway } from "react-use";
import Modal from "../modal";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { RiCloseFill } from "react-icons/ri";
import Divider from "../divider";
import ProfileBanner from "../profilebanner";
import { SocketContext } from "../../context/socket.context";
import { AppContext } from "../../context/app.context";
import Select from "../select";
import { channel } from "diagnostics_channel";
import UpdateAvatar from "../update-avatar";

const MessageBubble = ({ setOpen, currentChannel, channelMember }: {setOpen: any, currentChannel: any, channelMember: any}) => {
  const [value, setValue] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  let [visibility, setVisibility] = useState<string>(currentChannel.visiblity);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  let [previewImage, setPreviewImage] = useState<string>(currentChannel?.avatar || "");
  let [groupName, setGroupName] = useState(currentChannel?.name || "");
  const [password, setPassword] = useState<string>("");
  // const []
  // const [state, setState] = useState({
  //   value: "",
  //   showPicker: false,
  //   showModal: false,
  //   showEdit: false,
  //   messages: [],
  //   visibility: currentChannel.visiblity,
  //   selectedUsers: [],
  //   pinnedMessages: [],
  //   previewImage: currentChannel?.avatar || "",
  // });
  const socket = useContext(SocketContext);
  const {user, users} = useContext(AppContext);
  const refMessage = useRef(null);


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
    setVisibility(currentChannel.visibility);
    setPreviewImage(currentChannel.avatar || "");
    setGroupName(currentChannel.name || "");
  }, [currentChannel]);

  
  useEffect(() => {
    socket?.emit("getChannelMessages", {channelId : currentChannel.id, user: {id: user?.id}});
    socket?.on("getChannelMessages", (message: any) => {
      setMessages(message);
    });
    socket?.on("messsage", (message: any) => {
      const sortedMessages = [...messages, message].sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
      setMessages(sortedMessages);
      autoScroll();
    });
  }, [socket, messages, currentChannel]);

  const ref = useRef(null);
  useClickAway(ref, () => {
    setShowPicker(false);
  });
  const handleEmojiSelect = (emoji: string) => {
    setValue((prevMessage) => prevMessage + emoji);
  };

  const handleSendMessage = (value : string) => {
    if (value) {
      socket?.emit('message', {senderId: user?.id, receiverId: currentChannel.id, content: value}); // senderId and receiverId are hardcoded for now
      setValue("");
    }
  };

  const leaveGroup = () => {
    console.log(currentChannel.id + " " + user?.id)
    socket?.emit("channel_leave", { channelId: currentChannel.id, userId: user?.id }); // hardcoded for now
  };

  const handleEditChannel = () => {
    socket?.emit("channel_update", { id: currentChannel.id, name: groupName || currentChannel.name , visibility: visibility || 
      currentChannel.visibility, password: password , avatar: previewImage || currentChannel.avatar });
  };

  return (
    <div className="relative overflow-y-auto scrollbar-hide overflow-x-hidden col-span-10 flex h-screen w-full flex-col justify-start gap-4 rounded-t-3xl bg-secondary-600 lg:col-span-5 xl:col-span-5 2xl:col-span-6 md-" ref={refMessage}>
      <Button
        className="flex tems-center gap-2 rounded-t-3xl top-0 mb-16 sticky bg-secondary-400 !p-2 text-white hover:bg-secondary-400 z-10"
        onClick={() => {
          if (currentChannel.type !== "CONVERSATION" && channelMember.status !== "LEFT" && channelMember.status !== "BANNED" && channelMember.status !== "MUTED") 
          setShowModal(true);
        }}
        >
        <Avatar src={currentChannel.type !== "CONVERSATION" ? currentChannel.avatar : 
                     currentChannel.channelMembers?.filter((member: any) => member.userId !== user?.id)[0].user?.avatar } alt="" />
        <div>{currentChannel.type !== "CONVERSATION" ? currentChannel.name : currentChannel.channelMembers?.filter((member: any) => member.userId !== user?.id)[0].user?.username}</div>
        <Button
          variant="text"
          className=" !hover:bg-inherit absolute right-0 mx-2 !items-end !bg-inherit text-white lg:hidden"
          onClick={() => {
            setOpen(false);
          }}
          >
          <BiLeftArrow />
        </Button>
      </Button>
      <div className="mb-2 flex h-full flex-col  justify-end gap-2 z-[0] px-[10px] ">
        {
          messages?.map((message) => {
            return (
              <div key={message.id}>
            {new Date(message.date).getDay() !== new Date(messages[messages.indexOf(message) - 1]?.date).getDay() && (
              <Divider center title={ 
                //check if date is less than 10, if so add a 0 in front of it
                `${  new Date(message.date).getDate() < 10 ? '0' + new Date(message.date).getDate() : new Date(message.date).getDate()}-${ new Date(message.date).getMonth() < 12 ? '0' + (new Date(message.date).getMonth() + 1) : new Date(message.date).getMonth() + 1}-${new Date(message.date).getFullYear()}`}/>
                )}
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
      <div className="absolute sticky bottom-0 flex w-full  items-center bg-secondary-700 p-1 ">
        <Button
          variant="text"
          className="!hover:bg-inherit !bg-inherit text-primary-500"
          onClick={() => {
            setShowPicker(true);
          }}
          disabled={channelMember.status === "MUTED" || channelMember.status === "BANNED" || channelMember.status === "LEFT"}
          >
          <BsEmojiSmileFill />
        </Button>
        <Input
          disabled={channelMember.status === "MUTED" || channelMember.status === "BANNED" || channelMember.status === "LEFT"}
          placeholder={(channelMember.status === "MUTED" ? "You are muted, you can't send messages!" : channelMember.status === "BANNED" ? "You are banned, you can't send messages!" : channelMember.status === "LEFT" ? "You have left this channel or have been kicked !" : "type something")}
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
          disabled={channelMember.status === "MUTED" || channelMember.status === "BANNED" || channelMember.status === "LEFT"}
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
      {showModal && (
        <Modal>
          <div className="flex w-full items-center justify-between">
            {
              (channelMember.role === "ADMIN" || channelMember.role === "OWNER" ) && (
                  <Button
                    className="!bg-inherit !text-white hover:bg-inherit"
                    onClick={() => {
                      setShowEdit(true);
                    }}
                  >
                    <RiEdit2Fill />
                    Edit Channel
                  </Button>
                )
            }
            <Button
              variant="text"
              className=" !bg-inherit text-2xl !text-white hover:bg-inherit"
              onClick={() => {
                setShowModal(false);
              }}
            >
              <RiCloseFill />
            </Button>
          </div>
          {showEdit && (
            <div className="flex w-full flex-col items-center justify-center gap-4 bg-inherit">
              <UpdateAvatar previewImage={previewImage} setPreviewImage={setPreviewImage} />
              <Input label="Name" placeholder={currentChannel.name}
                value={groupName}
                onChange={
                  (event) => {
                    const { value } = event.target;
                    setGroupName(value);
                  }
                }
              />
              <Select label= "Visibility" setVisibility={setVisibility} options={["PUBLIC", "PRIVATE", "PROTECTED"]} value={currentChannel.visiblity} />
              {visibility === "PRIVATE" ? ( 
                <Input label="Password [optional]" placeholder="*****************" type="password"
                value={password}
                onChange={
                  (event) => {
                    const { value } = event.target;
                    setPassword(value);
                  }
                }
                />
              ) : 
              visibility === "PROTECTED" ? (
                <Input label="Password [required]" placeholder="*****************" type="password"
                value={password}
                onChange={
                  (event) => {
                    const { value } = event.target;
                    setPassword(value);
                  }
                }
                />
              ) : null
              }

            <div className="w-full h[100px] flex items-center justify-center flex-col align-middle gap-2 pt-2 overflow-y-scroll scrollbar-hide">
            <span className="w-full mb-2 text-sm font-medium text-gray-900 dark:text-white">Select new users: </span>
            {users?.filter((u : any) => {
              return u.id !== user?.id && currentChannel.channelMembers.find((cm : any) => cm.userId === u.id) === undefined;
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
                        onClick={() => {
                        }}
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
              <div className="flex w-full items-center justify-center gap-4">
                <Button
                  disabled={visibility==="PROTECTED" } 
                  onClick={() => {
                    setShowEdit(false);
                    setVisibility(currentChannel.visiblity);
                    handleEditChannel();
                  }}
                  className="w-full justify-center"
                >
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setShowEdit(false);
                    setVisibility(currentChannel.visiblity);
                  }}
                  className="w-full justify-center"
                  type="danger"
                >
                  Reset
                </Button>
              </div>
            </div>
          )}
          <Divider/>
          {showEdit ? null : (
            <>
            <div className="flex h-max w-full flex-col items-center gap-2 overflow-y-scroll pt-2 scrollbar-hide">
            {currentChannel?.channelMembers?.filter((member : any) => member.status !== "BANNED" && member.status !== "LEFT"  ).map((member : any) => {
              return (
                <ProfileBanner
                    channelMember={channelMember}
                    user={user?.id}
                    showOptions
                    showStatus
                    key={member.userId}
                    status={member.status}
                    role={member.role}
                    channelId={currentChannel.id}
                    userId={member.userId}
                    name={member.user.username}
                    avatar={member.user.avatar}
                    description={member.user.status}
                  />
                );
            })}
          </div>
            
          <Button
            className="w-full justify-center"
            onClick={() => {
              leaveGroup();
              setShowModal(false);
            }}
            >
            <RiLogoutBoxRLine />
            Leave Group
          </Button>
          </>
          )}
        </Modal>
      )}
    </div>
  );
};

export default MessageBubble;
