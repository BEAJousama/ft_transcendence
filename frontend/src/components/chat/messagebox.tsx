"use client";


import { useContext, useEffect, useRef, useState } from "react";
import { useClickAway } from "react-use";
import { IAppContext } from "../../context/app.context";
import { AppContext } from "../../context/app.context";
import { ChatContext, IchatContext, Imessage } from "../../context/chat.context";

import RightClickMenu, { RightClickMenuItem } from "../rightclickmenu";
import Spinner from "../spinner";
import { twMerge } from "tailwind-merge";
import { Trash } from "lucide-react";


const MessageBox = ({ message, right, autoScroll }: { message: Imessage; right?: boolean, autoScroll: any }) => {
  const [showMenu, setShowMenu] = useState(false);
  const { socket } = useContext<IchatContext>(ChatContext);
  const { user } = useContext<IAppContext>(AppContext);
  const ref = useRef(null);

  useEffect(() => {
    autoScroll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useClickAway(ref, () => setShowMenu(false));

  const handleClick = () => {
    setShowMenu(false);
    document.removeEventListener("click", handleClick);
  };

  const handleContextMenu = (event: any) => {
    event.preventDefault();
    setShowMenu(true);
    document.addEventListener("click", handleClick);
  };

  const deleteMessage = () => {
    socket?.emit("message_delete", { messageId: message?.id, channelId: message?.receiverId });
  }

  return (
    <div
      className={twMerge(
        "w-full flex flex-col ",
        right && "items-end",
        !right && "items-start"
      )}
      ref={ref}
      onContextMenu={handleContextMenu}
    >
      <div className="flex max-w-[90%]">
        {user?.id !== message?.senderId && (
          message?.sender ?
            <div>
              <span className="relative group">
                <img
                  className="w-10 h-10 rounded-full mr-2 min-w-[25px]"
                  src={message?.sender?.avatar}
                  alt={message?.sender?.username}
                />
              </span>
            </div>
            :
            <div className="h-24">
              <Spinner />
            </div>
        )}
        <div
          className={twMerge(
            "flex flex-col text-white m-1 p-2 text-sm max-w-md mx-auto relative ",
            right && "bg-primary-600 rounded-l-xl rounded-br-xl",
            !right && "bg-tertiary-600 rounded-r-xl rounded-bl-xl"
          )}
        >
          <div className="flex">
            <div className="max-w-full">
              {user?.id !== message?.senderId && (
                <h1 className=" font-bold text-sm text-primary-300">
                  {message?.sender?.username}
                </h1>
              )}
              <p className="break-all md:break-words text-base">{message?.content}</p>
              <span className={twMerge("w-full text-[10px]", !right ? "text-secondary-100" : "text-primary-50")}>
                {
                  new Date(message?.date).getHours() > 12 ?
                    new Date(message?.date).getHours() - 12 :
                    new Date(message?.date).getHours()
                }:
                {
                  new Date(message?.date).getMinutes() < 10 ?
                    `0${new Date(message?.date).getMinutes()}` :
                    new Date(message?.date).getMinutes()
                }
                {new Date(message?.date).getHours() > 12 ? "pm" : "am"}
              </span>
            </div>
          </div>
        </div>

        {showMenu && (
          <RightClickMenu className={twMerge("z-30 w-[150px]", right ? "right-10 top-10" : "left-[20px] !rounded-r-xl !rounded-bl-xl")}>
            {user?.id === message?.senderId && (
              <RightClickMenuItem
                onClick={() => {
                  deleteMessage();
                }
                }
              >
                <Trash />
                Delete Message
              </RightClickMenuItem>
            )}
          </RightClickMenu>
        )}
      </div>
    </div>
  );
};

export default MessageBox;
