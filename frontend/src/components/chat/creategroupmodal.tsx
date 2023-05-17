import React, { useState } from "react";

import { MdGroupAdd } from "react-icons/md";
import { BiArrowBack, BiRightArrowAlt } from "react-icons/bi";

import { RiCloseFill } from "react-icons/ri";
import Card from "../card";
import Button from "../button";
import Divider from "../divider";
import Input from "../input";
import ProfileBanner from "../profilebanner";

const CreateGroupModal = ({
  setShowModal,
}: {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [show, setShow] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [showSubmit, setShowSubmit] = useState(false);
  // const [selectedUsers, setSelectedUsers] = useState<number>();

  return (
    <div className="animation-fade absolute left-0 top-0 flex h-screen w-screen items-center justify-center animate-duration-500">
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm"></div>
      <Card
        className="animate-duration-400 z-10 
      flex min-w-[90%] animate-jump-in flex-col items-center justify-start gap-4 border-none bg-secondary-800 text-white
       shadow-lg shadow-secondary-500 animate-ease-out lg:min-w-[40%] xl:min-w-[800px]"
        setShowModal={setShowModal}
      >
        <div className="flex w-full items-center justify-between">
          {show && (
            <Button
              variant="text"
              className=" !bg-inherit text-2xl !text-white hover:bg-inherit"
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
            className=" !bg-inherit text-2xl !text-white hover:bg-inherit"
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

        <div className="flex h-[300px] w-full flex-col items-center justify-center gap-2 overflow-y-scroll pt-20 scrollbar-hide">
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
            <div className="flex w-full items-center justify-end">
              <Button
                htmlType="submit"
                className="justify-end !bg-inherit !text-white hover:bg-inherit"
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
