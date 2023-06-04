import clsx from "clsx";
import { useContext, useEffect, useRef, useState } from "react";
import RightClickMenu, { RightClickMenuItem } from "../rightclickmenu";
import { BsPinAngleFill } from "react-icons/bs";
import { MdDelete } from "react-icons/md";
import { useClickAway, useMedia } from "react-use";
import { SocketContext } from "../../context/socket.context";
import { AppContext } from "../../context/app.context";

const MessageBox = ({ message, right }: { message?: any; right?: boolean }) => {
  const [showMenu, setShowMenu] = useState(false);
  const socket = useContext(SocketContext);
  const {user} = useContext(AppContext);
  const [sender, setSender] = useState<any>(null);
  const ref = useRef(null);
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    fetch(`http://localhost:3000/api/users/${message.senderId}`, {
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
      <div
        className={clsx(
          "flex flex-col rounded text-white m-1 p-2 text-sm max-w-[70%] relative ",
          right && "bg-primary-500",
          !right && "bg-secondary-400"
        )}
      >
      <div className="flex">
          {user?.id !== message.senderId && (
            <div>
              <span className="relative group">
                <img
                  className="w-10 h-10 rounded-full mr-2"
                  src={sender?.avatar}
                  alt={sender?.username}
                />
                <span className="absolute bottom-0 left-0 w-full bg-gray-800 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {sender?.username}
                </span>
              </span>
            </div>
          )}
          <div>
            <div>{message.content}</div>
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

        {showMenu && (
          <RightClickMenu>
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
