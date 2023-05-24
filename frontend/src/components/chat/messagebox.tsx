import clsx from "clsx";
import { useRef, useState } from "react";
import RightClickMenu, { RightClickMenuItem } from "../rightclickmenu";
import { BsPinAngleFill } from "react-icons/bs";
import { MdDelete } from "react-icons/md";
import { useClickAway, useMedia } from "react-use";

const MessageBox = ({ message, right }: { message?: any; right?: boolean }) => {
  const [showMenu, setShowMenu] = useState(false);
  const ref = useRef(null);

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
        <div>
          {message.content}
        </div>
        <span
          className={clsx("w-full text-right", !right && "text-secondary-300")}
        >
          {message.date}pm
        </span>
        {showMenu && (
          <RightClickMenu>
            <RightClickMenuItem>
              <BsPinAngleFill />
              Pin Message
            </RightClickMenuItem>
            <RightClickMenuItem>
              <MdDelete />
              Delete Message
            </RightClickMenuItem>
          </RightClickMenu>
        )}
      </div>
    </div>
  );
};

export default MessageBox;
