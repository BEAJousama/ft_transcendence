import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components";
const FourOFour = ({ show = true }: { show?: boolean }) => {
  return (
    <div
      tabIndex={0}
      className="grid h-screen w-screen place-items-center bg-secondary-500"
    >
      <div className="relative grid w-full place-items-center">
        <img
          src="/img/giphy.gif"
          alt="game"
          className="w-[80%] rounded-lg shadow-lg shadow-secondary-800 drop-shadow-lg "
        />
        <div className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 transform flex-col items-center justify-center gap-8 text-primary-500">
          {show && <span className="text-1xl w-full text-center md:text-7xl">404</span>}
          <span className="text-1xl w-full text-center md:text-4xl">
            Something Went Wrong
          </span>
          <Link to="/" className="flex w-[80%] items-center justify-center ">
            <Button className="!p-2 !text-xs">Back to HomePage</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FourOFour;
