import React, { useState, useRef } from "react";
import { MdAddBox, MdOutlineAdminPanelSettings } from "react-icons/md";
import { useClickAway } from "react-use";
import { BsPersonAdd } from "react-icons/bs";
import clsx from "clsx";
import Avatar from "../avatar";
import Button from "../button";
import { SlOptionsVertical } from "react-icons/sl";
import { TbBan } from "react-icons/tb";
import RightClickMenu, { RightClickMenuItem } from "../rightclickmenu";
import { BiVolumeMute } from "react-icons/bi";

const ProfileBanner = ({
  avatar = "https://www.github.com/Hicham-BelHoucin.png",
  show,
  name,
  description,
  setSelectedUsers,
  showAddGroup,
  className,
  setShowModal,
  showOptions,
  showStatus,
  status,
}: {
  avatar?: string;
  show?: boolean;
  name: string;
  description: string;
  setSelectedUsers?: React.Dispatch<React.SetStateAction<number | undefined>>;
  showAddGroup?: boolean;
  className?: string;
  setShowModal?: React.Dispatch<React.SetStateAction<boolean>>;
  showOptions?: boolean;
  showStatus?: boolean;
  status?: string;
}) => {
  const [isChecked, setIsChecked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const ref = useRef(null);

  useClickAway(ref, () => setShowMenu(false));

  return (
    <div
      className={clsx(
        `relative flex w-full items-center gap-4`,
        className && className
      )}
    >
      <Avatar src={avatar} alt="" />
      <div
        className={clsx(
          "flex w-full  flex-col truncate text-sm md:max-w-full ",
          showStatus && "max-w-[100px]"
        )}
      >
        <span className="text-white">{name}</span>
        <span className="text-secondary-300 ">{description}</span>
      </div>
      {show && (
        <div className="w-10">
          <input
            type="checkbox"
            className="h-5 w-5"
            onClick={() => {
              setIsChecked(!isChecked);
            }}
            onChange={() => {}}
          />
        </div>
      )}
      {showAddGroup && (
        <div className="flex items-center justify-end">
          <Button
            className=" !hover:bg-inherit !bg-inherit hover:animate-jump hover:animate-once hover:animate-ease-in"
            onClick={() => {
              setShowModal && setShowModal(true);
            }}
          >
            <MdAddBox />
          </Button>
        </div>
      )}
      {showStatus && (
        <div className="flex h-full flex-col items-end justify-end text-tertiary-200">
          {status}
        </div>
      )}
      {showOptions && (
        <div className="flex items-center justify-end">
          <Button
            className=" !hover:bg-inherit !bg-inherit hover:animate-jump hover:animate-once hover:animate-ease-in"
            onClick={() => {
              setShowMenu(true);
            }}
          >
            <SlOptionsVertical />
          </Button>
        </div>
      )}
      {showMenu && (
        <div
          ref={ref}
          className="absolute -bottom-14 right-14 w-56 bg-yellow-500"
        >
          <RightClickMenu className="w-full !bg-secondary-500">
            <RightClickMenuItem>
              <BsPersonAdd />
              Invite To Play
            </RightClickMenuItem>
            <RightClickMenuItem>
              <MdOutlineAdminPanelSettings />
              Make Group Admin
            </RightClickMenuItem>
            <RightClickMenuItem>
              <BiVolumeMute />
              Mute
            </RightClickMenuItem>
            <RightClickMenuItem>
              <TbBan />
              Ban
            </RightClickMenuItem>
          </RightClickMenu>
        </div>
      )}
    </div>
  );
};

export default ProfileBanner;