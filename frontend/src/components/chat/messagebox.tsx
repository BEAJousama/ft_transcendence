import clsx from "clsx";
import { useContext, useEffect, useRef, useState } from "react";
import RightClickMenu, { RightClickMenuItem } from "../rightclickmenu";
import { BsPinAngleFill } from "react-icons/bs";
import { MdDelete } from "react-icons/md";
import { useClickAway, useMedia } from "react-use";
import { SocketContext } from "../../context/socket.context";
import { AppContext } from "../../context/app.context";
import { Chat } from "../../pages";
import { ChatContext } from "../../context/chat.context";

const MessageBox = ({ message, right, autoScroll }: { message?: any; right?: boolean, autoScroll : any}) => {
  const [showMenu, setShowMenu] = useState(false);
  const socket = useContext(ChatContext);
  const {user} = useContext(AppContext);
  const [sender, setSender] = useState<any>(null);
  const token = localStorage.getItem("access_token");
  const ref = useRef(null);

  useEffect(() => {
    autoScroll();
  }, []);

  useEffect(() => {
    fetch(`http://10.11.5.12:3000/api/users/${message.senderId}`, {
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${token}`, // notice the Bearer before your token
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setSender(data);
      }
    );
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

  const pinMessage = () => {
    socket?.emit("pin_message", { messageId: message.id, channelId: message.receiverId});
  }
  
  const unpinMessage = () => {
    socket?.emit("unpin_message", { messageId: message.id, channelId: message.receiverId});
  }

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
      <div className="flex w-max">
        {user?.id !== message.senderId && (
          <div>
            <span className="relative group">
              <img
                className="w-10 h-10 rounded-full mr-2"
                src={sender?.avatar}
                alt={sender?.username}
                />
            </span>
          </div>
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
            <p className="break-words">{message.content}</p>
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
          <RightClickMenu className="-translate-x-1/2 -translate-y-1/2">
            <RightClickMenuItem
            onClick={() => {
              {message.pinned ? unpinMessage() : pinMessage()}
            }}
            >
              <BsPinAngleFill />
              {message.pinned ? "Unpin Message" : "Pin Message"}
            </RightClickMenuItem>
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
