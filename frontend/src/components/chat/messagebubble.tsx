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

const MessageBubble = ({ setOpen, currentChannel, channelMember }: {setOpen: any, currentChannel: any, channelMember: any}) => {
  const [value, setValue] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [pinnedMssgsModal, setPinnedMssgsModal] = useState(false);
  const [visibility, setVisibility] = useState<string>(currentChannel.visiblity);
  const [pinnedMessages, setPinnedMessages] = useState<any[]>([]);
  const socket = useContext(SocketContext);
  const {user} = useContext(AppContext)

  
  useEffect(() => {
    socket?.emit("getChannelMessages", {channelId : currentChannel.id, user: {id: user?.id}});
    socket?.on("getChannelMessages", (message: any) => {
      setMessages(message);
    });
    socket?.emit("get_pinned_messages", {channelId : currentChannel.id});
    socket?.on("get_pinned_messages", (message: any) => {
      setPinnedMessages(message);
    });
    socket?.on("messsage", (message: any) => {
      const sortedMessages = [...messages, message].sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
      setMessages(sortedMessages);
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
    socket?.emit("channel_leave", { channelId: currentChannel.id, userId: 1 }); // hardcoded for now
  };

  return (
    <div className="relative overflow-auto col-span-10 flex h-screen w-full flex-col justify-start gap-4 rounded-t-3xl bg-secondary-600 lg:col-span-5 xl:col-span-5 2xl:col-span-6">
      <Button
        className="flex tems-center gap-2 rounded-t-3xl top-0 mb-16 sticky bg-secondary-400 !p-2 text-white hover:bg-secondary-400 z-10"
        onClick={() => {
          setShowModal(true);
        }}
      >
        <Avatar src={`https://randomuser.me/api/portraits/women/${currentChannel.id}.jpg`} alt="" />
        <div>{currentChannel.name}</div>
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
      <div className="mb-2 flex h-full flex-col justify-end gap-2 scrollbar-hide z-[0] ">
        {
          messages?.map((message) => {
          return (
            <>
            {new Date(message.date).getDay() !== new Date(messages[messages.indexOf(message) - 1]?.date).getDay() && (
              <Divider center title={ 
                //check if date is less than 10, if so add a 0 in front of it
                `${  new Date(message.date).getDate() < 10 ? '0' + new Date(message.date).getDate() : new Date(message.date).getDate()}-${ new Date(message.date).getMonth() < 12 ? '0' + (new Date(message.date).getMonth() + 1) : new Date(message.date).getMonth() + 1}-${new Date(message.date).getFullYear()}`}/>
            )}
            <MessageBox
            key={message.id}
            message={message}
            right={(message.senderId === user?.id)} 
            />          
            </>
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
          >
          <BsEmojiSmileFill />
        </Button>
        <Input
          disabled={channelMember.status === "MUTED" || channelMember.status === "BANNED"}
          placeholder={(channelMember.status === "MUTED" ? "You are muted, you can't send messages!" : channelMember.status === "BANNED" ? "You are banned, you can't send messages!" : "type something")}
          value={value}
          onChange={(event) => {
            const { value } = event.target;
            setValue(value);
          }}
        />

        <Button
          variant="text"
          className="!hover:bg-inherit !bg-inherit text-primary-500"
          // onKeyDown={(event) => {
          //   if (event.key === "Enter")
          //     handleSendMessage(value);
          // }}
          onClick={() => {
            handleSendMessage(value);
          }}
        >
          <BsSendFill />
        </Button>
        {/* {
            pinnedMessages.length > 0 && (
              //open a modal to show pinned messages
              <div className="absolute bottom-0 flex w-full items-center bg-secondary-700 p-1">
                <Button
                  variant="text"
                  className="!hover:bg-inherit !bg-inherit text-primary-500"
                  onClick={() => {
                    setPinnedMssgsModal(true);
                  }}
                >
                  <RiEdit2Fill />
                </Button>
              </div>
    
            )
          } */}
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
              <Input label="Name" placeholder="channel name" />
              <Select label= "Visibility" setVisibility={setVisibility} options={["PUBLIC", "PRIVATE", "PROTECTED"]} value={currentChannel.visiblity} />
              {visibility === "PRIVATE" ? ( 
                <Input label="Password [optional]" placeholder="*****************" type="password"/>
              ) : 
              visibility === "PROTECTED" ? (
                <Input label="Password" placeholder="*****************" type="password"/>
              ) : null
              }
              <div className="flex w-full items-center justify-center gap-4">
                <Button
                  disabled={visibility==="PROTECTED" } 
                  onClick={() => {
                    setShowEdit(false);
                    setVisibility(currentChannel.visiblity);
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
          <div className="flex h-[300px] w-full flex-col items-center  justify-center gap-2 overflow-y-scroll pt-20 scrollbar-hide">
            {currentChannel?.channelMembers?.map((member : any) => {
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
        </Modal>
      )}
    </div>
  );
};

export default MessageBubble;
