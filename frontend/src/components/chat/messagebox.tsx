import clsx from "clsx";
import { useRef, useState } from "react";
import RightClickMenu, { RightClickMenuItem } from "../rightclickmenu";
import { BsPinAngleFill } from "react-icons/bs";
import { MdDelete } from "react-icons/md";
import { useClickAway } from "react-use";

const MessageBox = ({ right }: { right?: boolean }) => {
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
        "flex w-full flex-col ",
        right && "items-end",
        !right && "items-start"
      )}
      ref={ref}
      onContextMenu={handleContextMenu}
    >
      <div
        className={clsx(
          "relative m-1 flex max-w-[70%] flex-col rounded p-2 text-sm text-white ",
          right && "bg-primary-500",
          !right && "bg-secondary-400"
        )}
      >
        <div>
          Let's make sure we prepare well so we can have a great experience at
          Gitex Africa and in Marrakech.
        </div>
        <span
          className={clsx("w-full text-right", !right && "text-secondary-300")}
        >
          12:00 pm
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
