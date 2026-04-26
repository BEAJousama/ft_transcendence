"use client";

import { useClickAway } from "react-use";
import { useRef } from "react";
import { twMerge } from "tailwind-merge";

const Card = ({
	children,
	className,
	setShowModal,
}: {
	children?: React.ReactNode;
	className?: string;
	setShowModal?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const ref = useRef(null);

	useClickAway(ref, () => {
		setShowModal && setShowModal(false);
	});
	return (
		<div
			className={twMerge(
				"max-w-sm rounded-2xl border border-white/[0.06] bg-secondary-700 p-6 shadow-xl shadow-black/20",
				className
			)}
			ref={ref}
		>
			{children}
		</div>
	);
};

export default Card;
