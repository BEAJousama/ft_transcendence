"use client";

import { X } from "lucide-react";
import Button from "../button";
import Avatar from "../avatar";
import React from "react";
import { toast } from "react-toastify";
import IUser from "../../interfaces/user";

const Toast = ({ title, content, sender }: { title: string; content: string; sender: IUser }) => {
	const toastId = React.useRef<HTMLDivElement>(null);

	const toastShow = () => {
		const audio = new Audio("/sound/toast_sound.mp3");
		audio.muted = false;
		var playedPromise = audio.play();
		if (playedPromise) {
			playedPromise
				.catch((e) => {
					// console.log(e)
					// if (e.name === 'NotAllowedError' || e.name === 'NotSupportedError') {
					//     console.log(e.name);
					// }
				})
				.then(() => {});
		}
	};
	toastShow();

	return (
		<div
			className="flex items-center justify-between gap-4 bg-white"
			role="alert"
			ref={toastId}
		>
			<div className="basis-[15%]">
				<Avatar src={sender.avatar} alt="" className=" !w-12 !h-12" />
			</div>
			<div>
				<p className="text-black">{title}</p>
				<p className="text-xs text-tertiary-200">{content || sender.fullname}</p>
			</div>
			<Button
				variant="text"
				onClick={() => {
					toast.dismiss(toastId.current?.id);
				}}
			>
				<X />
			</Button>
		</div>
	);
};

export default Toast;
