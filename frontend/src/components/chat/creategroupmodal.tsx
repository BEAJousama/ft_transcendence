import React, {Fragment, useContext, useEffect, useState } from "react";
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
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [allusers, setAllUsers] = useState<any[]>([]);
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    fetch("http://localhost:3000/api/users", {
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${token}`, // notice the Bearer before your token
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setAllUsers(data);
      }
    );
  }, [token]);

  function handleCreateGroup() {
    socket?.emit("channel_create", { name: groupName ,avatar: "obeaj", visibility: "PUBLIC", members: selectedUsers});
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
              if (value !== "") setShowSubmit(true);
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
        <div className="w-full h[auto] flex items-center justify-center flex-col align-middle gap-2 pt-20 overflow-y-scroll scrollbar-hide">
          {allusers.map((user) => {
            return (
              <div key={user.id} className="flex flex-row items-center justify-between w-full">
              <ProfileBanner
                key={user.id}
                avatar={user.avatar}
                name={user.username}
                description={user.status}
                />
              {show && (
                  <div className="w-8">
                  <input
                    type="checkbox"
                    className="h-5 w-5"
                    onClick={() => {
                    }}
                    onChange={() => {
                      !selectedUsers.includes(user.id) ?
                        setSelectedUsers([...selectedUsers, user.id]) :
                        setSelectedUsers(selectedUsers.filter((id) => id !== user.id));
                    }}
                    />
                    </div>
                    
                    )}
                </div>
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
