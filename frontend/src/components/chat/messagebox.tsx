import clsx from "clsx";
import { memo, useContext, useEffect, useRef, useState } from "react";
import RightClickMenu, { RightClickMenuItem } from "../rightclickmenu";
import { MdDelete } from "react-icons/md";
import { useClickAway } from "react-use";
import { fetcher } from "../../context/app.context";
import { AppContext } from "../../context/app.context";
import { ChatContext } from "../../context/chat.context";
import Spinner from "../spinner";
import { ClassificationType } from "typescript";

const MessageBox = ({ message, right, autoScroll }: { message?: any; right?: boolean, autoScroll : any}) => {
  const [showMenu, setShowMenu] = useState(false);
  const {socket} = useContext(ChatContext);
  const {user} = useContext(AppContext);
  const [sender, setSender] = useState<any>(null);
  const ref = useRef(null);

  useEffect(() => {
    autoScroll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetcher(`api/users/${message.senderId}`).then((res) => setSender(res));
  }, [message.senderId]);

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
    socket?.emit("message_delete", { messageId: message.id, channelId: message.receiverId});
  }

  return (
      <div
        className={clsx(
          "w-full flex flex-col ",
          right && "items-end",
          !right && "items-start"
        )}
        ref={ref}
        onContextMenu={handleContextMenu}
      >
      <div className="flex max-w-[90%]">
        {user?.id !== message.senderId && (
          sender ? 
          <div>
            <span className="relative group">
              <img
                className="w-10 h-10 rounded-full mr-2 min-w-[25px]"
                src={sender?.avatar}
                alt={sender?.username}
                />
            </span>
          </div>
          :
           <Spinner/>
        )}
      <div
        className={clsx(
          "flex flex-col text-white m-1 p-2 text-sm max-w-md mx-auto relative ",
          right && "bg-primary-500 rounded-l-xl rounded-br-xl",
          !right && "bg-secondary-400 rounded-r-xl rounded-bl-xl"
        )}
      >
      <div className="flex">
          <div className="max-w-full">
            {user?.id !== message.senderId && (
              <h1 className="font-montserrat font-bold text-sm text-primary-300">
              {sender?.username}
              </h1>
            )}
            <p className="break-all md:break-words">{message.content}</p>
            <span className={clsx("w-full text-right", !right ? "text-secondary-300" : "text-secondary-200")}>
              {
                new Date(message.date).getHours() > 12 ?
                new Date(message.date).getHours() - 12 :
                new Date(message.date).getHours()
              }:
              {
                new Date(message.date).getMinutes() < 10 ?
                `0${new Date(message.date).getMinutes()}` :
                new Date(message.date).getMinutes()
              }
              {new Date(message.date).getHours() > 12 ? "pm" : "am"}
            </span>
          </div>
        </div>
      </div>

        {showMenu && (
          <RightClickMenu className={clsx("z-30 w-[150px]",right ? "right-10 top-10" : "left-[20px] !rounded-r-xl !rounded-bl-xl")}>
            {user?.id === message.senderId && (
              <RightClickMenuItem
                onClick={() => {
                  deleteMessage();
                }
              }
              >
                <MdDelete />
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
