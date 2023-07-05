import { CgClose } from "react-icons/cg"
import Button from "../button"
import Avatar from "../avatar"
import React, { useEffect } from "react";
import { toast } from 'react-toastify';
import IUser from "../../interfaces/user";

const Toast = ({
    title,
    content,
    sender,
}: { title: string, content: string, sender: IUser }) => {
    const toastId = React.useRef<HTMLDivElement>(null);

    const toastShow = () => {
        const audio = new Audio('https://drive.google.com/uc?export=download&id=1M95VOpto1cQ4FQHzNBaLf0WFQglrtWi7');
        audio.muted = false;
        var playedPromise = audio.play();
                if (playedPromise) {
                    playedPromise.catch((e) => {
                        console.log(e)
                        if (e.name === 'NotAllowedError' || e.name === 'NotSupportedError') {
                            console.log(e.name);
                        }
                    }).then(() => {

                    });
                }
    }
    toastShow();

    return (
        <div className="flex items-center justify-between gap-4 bg-white" role="alert" ref={toastId}>
            <Avatar src={sender.avatar} alt="" className=" !w-12 !h-12" />
            <div>
                <p className="text-black">{title}</p>
                <p className="text-xs text-tertiary-200">{content || sender.fullname}</p>
            </div>
            <Button variant="text" onClick={() => {
                toast.dismiss(toastId.current?.id)
            }}>
                <CgClose />
            </Button>
        </div>
    )
}

export default Toast