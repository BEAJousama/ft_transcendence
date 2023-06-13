import { BsEmojiSmileFill, BsSendFill } from "react-icons/bs";
import Button from "../button";
import Input from "../input";
import MessageBox from "./messagebox";
import { BiLeftArrow } from "react-icons/bi";
import { RiEdit2Fill, RiLogoutBoxRLine } from "react-icons/ri";
import Avatar from "../avatar";
import { useState, useRef } from "react";
import { useClickAway } from "react-use";
import React from "react";
import Modal from "../modal";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { RiCloseFill } from "react-icons/ri";
import Divider from "../divider";
import ProfileBanner from "../profilebanner";
import AvatarGroup from "../avatarGroup";

const MessageBubble = ({ setOpen }: any) => {
  const [value, setValue] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const ref = useRef(null);
  useClickAway(ref, () => {
    setShowPicker(false);
  });
  const handleEmojiSelect = (emoji: string) => {
    setValue((prevMessage) => prevMessage + emoji);
  };

  return (
    <div className="relative col-span-10 flex h-screen w-full flex-col justify-start gap-4 rounded-t-3xl bg-secondary-600 lg:col-span-5 xl:col-span-5 2xl:col-span-6">
      <Button
        className="flex items-center gap-2 rounded-t-3xl bg-secondary-400 !p-2 text-white hover:bg-secondary-400"
        onClick={() => {
          setShowModal(true);
        }}
      >

        <Avatar src="https://www.github.com/Hicham-BelHoucin.png" alt="" />
        <div>Hicham Bel Houcin</div>
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
          placeholder="type something ?"
          value={value}
          onChange={(event) => {
            const { value } = event.target;
            setValue(value);
          }}
        />
        <Button
          variant="text"
          className="!hover:bg-inherit !bg-inherit text-primary-500"
          onClick={() => {
            // here the logic to send the message to the server and then to the other user
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
          </div>
          <Button
            className="w-full justify-center"
            onClick={() => {
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
