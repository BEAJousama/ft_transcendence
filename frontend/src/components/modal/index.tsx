"use client"

import { twMerge } from "tailwind-merge";
import Card from "../card";

const Modal = ({
  children,
  className,
  setShowModal,
}: {
  children: React.ReactNode;
  className?: string;
  setShowModal?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <div className="animation-fade absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 z-30 flex h-screen w-screen items-center justify-center animate-duration-500">
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm"></div>
      <Card
        setShowModal={setShowModal}
        className={twMerge(`animate-duration-400 z-10  h-fit
      flex  min-w-[80%] lg:min-w-[65%] xl:min-w-[50%] 2xl:min-w-[30%] animate-jump-in flex-col items-center justify-start gap-4 border-none bg-secondary-800 text-white
       shadow-lg shadow-secondary-500 animate-ease-out`, className && className)}
      >
        {children}
      </Card>
    </div>
  );
};

export default Modal;
