"use client"


import { twMerge } from "tailwind-merge";



const Divider = ({ className, vertical, center, title }: { className?: string, vertical?: boolean, center?: boolean, title?: string }) => {
  return (
    <div className={twMerge(center && " flex items-center justify-center m-3")}>
      {!vertical ? (
        <div className={twMerge("flex w-full flex-col items-center justify-center text-secondary-300 text-sm", className && className)}>
          <p>{title}</p>
          <hr className={twMerge("h-[1px] w-[75%] rounded border-0 bg-gray-700 ", className && className)} />
        </div>
      ) : (
        <div>
          <p>{title}</p>
          <hr className="h-[75%] w-[1px] rounded border-0 bg-gray-700 " />
        </div>
      )}
    </div>
  );
};

export default Divider;