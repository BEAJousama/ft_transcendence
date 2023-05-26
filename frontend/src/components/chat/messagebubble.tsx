import { BsEmojiSmileFill, BsSendFill } from "react-icons/bs";
import Button from "../button";
import Input from "../input";
import MessageBox from "./messagebox";
import { BiLeftArrow } from "react-icons/bi";
import { RiEdit2Fill, RiLogoutBoxRLine } from "react-icons/ri";
import Avatar from "../avatar";
import { useState, useRef, useContext, useEffect } from "react";
import { useClickAway } from "react-use";
import React from "react";
import Modal from "../modal";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { RiCloseFill } from "react-icons/ri";
import Divider from "../divider";
import ProfileBanner from "../profilebanner";
import { SocketContext } from "../../context/socket.context";
import { AppContext } from "../../context/app.context";

const MessageBubble = ({ setOpen, currentChannel, channelMember }: {setOpen: any, currentChannel: any, channelMember: any}) => {
  const [value, setValue] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const socket = useContext(SocketContext);
  const {user, ...data} = useContext(AppContext)

  
  useEffect(() => {
    socket?.emit("getChannelMessages", {channelId : currentChannel.id, user:{id: 1}});
    socket?.on("getChannelMessages", (message: any) => {
      setMessages(message);
    });
    socket?.on("messsage", (message: any) => {
      setMessages([...messages, message]);
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
    <div className="relative col-span-10 flex h-screen w-full flex-col justify-start gap-4 rounded-t-3xl bg-secondary-600 lg:col-span-5 xl:col-span-5 2xl:col-span-6">
      <Button
        className="flex items-center gap-2 rounded-t-3xl bg-secondary-400 !p-2 text-white hover:bg-secondary-400"
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

      <div className="mb-16 flex h-screen flex-col justify-end gap-2 overflow-y-scroll scrollbar-hide">
        {messages?.map((message) => {
          return <MessageBox
          key={message.id}
          message={message}
          right={(message.senderId === user?.id)} />; // hardcoded for now
        })}
      </div>
      <div className="absolute bottom-0 flex w-full items-center bg-secondary-700 p-1">
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
          disabled={channelMember.status === "MUTED"}
          placeholder={channelMember.status === "MUTED" ? "You are muted, you can't send messages!" : "type something"}
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
            <Button
              className="!bg-inherit !text-white hover:bg-inherit"
              onClick={() => {
                setShowEdit(true);
              }}
            >
              <RiEdit2Fill />
              Edit Name and Password
            </Button>

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
              <Input label="Password" placeholder="*****************" />
              <div className="flex w-full items-center justify-center gap-4">
                <Button
                  onClick={() => {
                    setShowEdit(false);
                  }}
                  className="w-full justify-center"
                >
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setShowEdit(false);
                  }}
                  className="w-full justify-center"
                  type="danger"
                >
                  Reset
                </Button>
              </div>
            </div>
          )}
          <Divider />
          <div className="flex h-[300px] w-full flex-col items-center  justify-center gap-2 overflow-y-scroll pt-20 scrollbar-hide">
            {currentChannel.channelMembers.map((member : any) => {
                return (
                  <ProfileBanner
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
