import {
  ChannelList,
  CreateGroupModal,
  MessageBubble,
  Sidepanel,
} from "./../../components";
import { useState } from "react";
import { useMedia } from "react-use";

export default function Chat() {
  const [open, setOpen] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  let isMatch = useMedia("(min-width:1024px)", false);

  return (
    <div className="bg-secondary-500 grid h-screen w-screen grid-cols-10 overflow-hidden">
      {!open && <Sidepanel className="col-span-2 2xl:col-span-1" />}
      {!open && (
        <ChannelList
          className="col-span-8 "
          onClick={
            isMatch
              ? () => {}
              : () => {
                  setOpen(true);
                }
          }
          setShowModal={setShowModal}
        />
      )}
      {(open || isMatch) && <MessageBubble setOpen={setOpen} />}
      {showModal && <CreateGroupModal setShowModal={setShowModal} />}
    </div>
  );
}
