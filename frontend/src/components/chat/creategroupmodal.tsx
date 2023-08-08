"use client";

import React, { useContext, useState } from "react";
import { AppContext, IAppContext } from "../../context/app.context";
import { ChatContext, IchatContext } from "../../context/chat.context";

import CustomSelect from "../select";
import Input from "../../components/input";
import ProfileBanner from "../../components/profilebanner";
import { Button, Divider, UpdateAvatar } from "../../components";
import Modal from "../modal";
import IUser from "../../interfaces/user";

import { FiSend } from "react-icons/fi";
import { RiCloseFill } from "react-icons/ri";
import { MdGroupAdd } from "react-icons/md";
import { BiArrowBack, BiRightArrowAlt } from "react-icons/bi";
import { BsSendPlus } from "react-icons/bs";


const CreateGroupModal = ({
  setShowModal,
  users,
}: {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  users?: IUser[];
}) => {
  const [show, setShow] = useState<boolean>(false);
  const [showDm, setShowDm] = useState<boolean>(false);
  const [groupName, setGroupName] = useState<string>("");
  const [showSubmit, setShowSubmit] = useState<boolean>(false);
  const { socket } = useContext<IchatContext>(ChatContext);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [visibility, setVisibility] = useState<string>("PUBLIC");
  const [password, setPassword] = useState<string>("");
  const [accesspass, setaccesspass] = useState<string>("");
  const { user } = useContext<IAppContext>(AppContext);
  const [previewImage, setPreviewImage] = useState<string>("/img/group.jpg" || "");

  const checkBlock = (userId: number) => {
    return (user?.blockers[0]?.blockingId === userId || user?.blocking[0]?.blockerId === userId)
  }

  function handleCreateGroup() {
    socket?.emit("channel_create", { name: groupName, avatar: previewImage, visibility: visibility, members: selectedUsers, password: password, access_pass: accesspass });
    setShowModal(false);
    setPassword("");
    setaccesspass("");
    setGroupName("");
    setSelectedUsers([]);
    setVisibility("PUBLIC");
    setPreviewImage("/img/group.jpg");
  }

  const handleCreateDm = (id: number) => {
    socket?.emit("dm_create", { senderId: user?.id, receiverId: id });
    setShowModal(false);
  }
  return (
    <div className="animation-fade animate-duration-500 absolute top-0 left-0 w-screen h-screen flex items-center justify-center">
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm">
      </div>
      <Modal
        className="z-10 bg-secondary-800 
        border-none flex flex-col items-center justify-start shadow-lg shadow-secondary-500 gap-4 text-white min-w-[90%]
        lg:min-w-[40%] xl:min-w-[800px] animate-jump-in animate-ease-out animate-duration-400"
        setShowModal={setShowModal!}
      >
        <div className="flex items-center justify-between w-full">
          {!show && !showDm && <span className="text-lg">New Chat</span>}
          {show && (
            <>
              <Button
                variant="text"
                className=" !bg-inherit hover:bg-inherit !text-white text-2xl"
                onClick={() => {
                  setShow(false);
                  setShowSubmit(false);
                  setGroupName("");
                }}
              >
                <BiArrowBack />
              </Button>
              <span className="text-lg">New Group Chat</span>
            </>
          )}
          {showDm && (
            <>
              <Button
                variant="text"
                className=" !bg-inherit hover:bg-inherit !text-white text-2xl"
                onClick={() => {
                  setShowDm(false);
                }}
              >
                <BiArrowBack />
              </Button>
              <span className="text-lg">Send Message</span>
            </>
          )}
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
        {(show) ? (
          <>
            <UpdateAvatar previewImage={previewImage} setPreviewImage={setPreviewImage} />
            <Input
              label="Channel name"
              placeholder="Group Chat Name (required)"
              value={groupName}
              onChange={(e) => {
                const { value } = e.target;
                setShowSubmit(false);
                setGroupName(value);
                if (value !== "") setShowSubmit(true);
              }}
            />
            <CustomSelect label="Visibility" setX={setVisibility} options={["PUBLIC", "PRIVATE", "PROTECTED"]} />
            {
              (visibility === "PROTECTED") && (
                <>
                  <Input
                    label="Password [Required]"
                    htmlType="password"
                    placeholder="********************"
                    value={password}
                    onChange={(e) => {
                      const { value } = e.target;
                      setPassword(value);
                    }}
                  />
                </>
              )
            }

            <Input
              label="Access password [Optional]"
              htmlType="password"
              placeholder="********************"
              value={accesspass}
              onChange={(e) => {
                const { value } = e.target;
                setaccesspass(value);
              }}
            />
          </>
        ) : (
          !showDm && (
            <>
              <Button
                variant="text"
                className="w-full justify-around"
                onClick={() => {
                  setShow(true);
                }}
              >
                <MdGroupAdd />
                Group Chat
                <BiRightArrowAlt />
              </Button>
              <Button
                variant="text"
                className="w-full justify-around"
                onClick={() => {
                  setShowDm(true);
                }}
              >
                <BsSendPlus />
                Direct Message
                <BiRightArrowAlt />
              </Button>
            </>
          )
        )}
        {
          show && (
            <div className="w-full h[100px] flex items-center justify-center flex-col align-middle gap-2 pt-2 overflow-y-scroll scrollbar-hide">
              <span className="w-full mb-2 text-sm font-medium text-gray-900 dark:text-white">Select users: </span>
              {
                users?.length ?
                  (users?.filter((u: any) => {
                    return u.id !== user?.id && !checkBlock(u.id);
                  }).map((u: any) => {
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
                            id="purple-checkbox"
                            type="checkbox"
                            className="w-4 h-4 bg-tertiary-600 focus:border-primary-500 rounded focus:ring-primary-500 focus:text-tertiary-700"
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
                  })) : (
                    <div className="flex flex-col items-center justify-center w-full">
                      <p className="text-gray-500 text-lg">No users found</p>
                    </div>
                  )}
            </div>
          )}

        {
          showDm && (

            <div className="w-full h[100px] flex items-center justify-center flex-col align-middle gap-2 pt-2 overflow-y-scroll scrollbar-hide">
              {users?.length ? (
                users?.filter((u: any) => {
                  return u.id !== user?.id && !checkBlock(u.id);
                }).map((u: any) => {
                  return (
                    <div key={u.id} className="flex flex-row items-center justify-between w-full p-2">
                      <ProfileBanner
                        key={u.id}
                        avatar={u.avatar}
                        name={u.username}
                        description={u.status}
                      />
                      <div className="w-8">
                        <Button
                          variant="text"
                          className=" !bg-inherit hover:bg-inherit !text-white p-2 text-xl"
                          onClick={() => {
                            handleCreateDm(u.id);
                          }}
                        >
                          <FiSend />
                        </Button>
                      </div>
                    </div>
                  );
                })) : (
                <div className="flex flex-col items-center justify-center w-full">
                  <p className="text-gray-500 text-lg">No users found</p>
                </div>
              )}
            </div>
          )}


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
      </Modal>
    </div>
  );
};

export default CreateGroupModal;