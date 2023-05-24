import React, {useContext, useState } from "react";
import {  Button, Card, Divider } from "../../components";
import { MdGroupAdd } from "react-icons/md";
import { BiArrowBack, BiRightArrowAlt } from "react-icons/bi";
import Input from "../../components/input";
import { RiCloseFill } from "react-icons/ri";
import ProfileBanner from "../../components/profilebanner";
import { SocketContext } from "../../context/socket.context";

const CreateGroupModal = ({
  setShowModal,
}: {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [show, setShow] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [showSubmit, setShowSubmit] = useState(false);
  const  socket= useContext(SocketContext);
  const [selectedUsers, setSelectedUsers] = useState<number>();

  function handleCreateGroup() {
    socket?.emit("channel_create", { name: groupName ,avatar: "obeaj", visibility: "PUBLIC", members: [1, 2]});
    setShowModal(false);
  }

  return (
    <div className="animation-fade animate-duration-500 absolute top-0 left-0 w-screen h-screen flex items-center justify-center">
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm"></div>
      <Card
        className="z-10 bg-secondary-800 
      border-none flex flex-col items-center justify-start shadow-lg shadow-secondary-500 gap-4 text-white min-w-[90%]
       lg:min-w-[40%] xl:min-w-[800px] animate-jump-in animate-ease-out animate-duration-400"
        setShowModal={setShowModal}
      >
        <div className="flex items-center justify-between w-full">
          {show && (
            <Button
              variant="text"
              className=" !bg-inherit hover:bg-inherit !text-white text-2xl"
              onClick={() => {
                setShow(false);
              }}
            >
              <BiArrowBack />
            </Button>
          )}
          <span className="text-lg"> New Chat</span>
          <Button
            variant="text"
            className=" !bg-inherit hover:bg-inherit !text-white text-2xl"
            onClick={() => {
              setShowModal(false);
            }}
          >
            <RiCloseFill />
          </Button>
        </div>
        <Divider />
        {show ? (
          <Input
            placeholder="Group Chat Name (required)"
            value={groupName}
            onChange={(e) => {
              const { value } = e.target;
              setShowSubmit(false);
              setGroupName(value);
              if (value != "") setShowSubmit(true);
            }}
          />
        ) : (
          <Button
            variant="text"
            className="w-full justify-around"
            onClick={() => {
              setShow(true);
            }}
          >
            <MdGroupAdd />
            New Group Chat
            <BiRightArrowAlt />
          </Button>
        )}
        <span className="w-full">Users</span>

        <div className="w-full h-[300px] flex items-center justify-center flex-col gap-2 pt-20 overflow-y-scroll scrollbar-hide">
          {new Array(16).fill(0).map((_, i) => {
            return (
              <ProfileBanner
                key={i}
                avatar={`https://randomuser.me/api/portraits/women/${i}.jpg`}
                show={show}
                name="hatim"
                description="something ? "
                setSelectedUsers={() => {}}
              />
            );
          })}
        </div>
        {showSubmit && (
          <>
            <Divider />
            <div className="w-full flex items-center justify-end">
              <Button
                htmlType="submit"
                className="!bg-inherit hover:bg-inherit !text-white justify-end"
                onClick={
                  () => {
                    handleCreateGroup();
                  }
                }
              >
                Create Group Chat
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default CreateGroupModal;
