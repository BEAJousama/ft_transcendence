import { useState, useRef, useContext, useEffect } from "react";
import { useClickAway } from "react-use";
import { SocketContext } from "../../context/socket.context";
import { AppContext } from "../../context/app.context";
import { ChatContext } from "../../context/chat.context";
import  clsx from "clsx";
import Button from "../button";


const UpdateChannel = ({
        children, 
        className, 
        updateX,
        setX, 
        setShowEdit,
        updatable,
    } 
    : 
    {
        children:   React.ReactNode ,
        className?:  string, 
        updateX: (() => void),
        setX:           React.Dispatch<React.SetStateAction<boolean>>,
        setShowEdit:    React.Dispatch<React.SetStateAction<boolean>>
        updatable ?:      boolean,
    }) => {

  return (
    <div className={clsx("flex flex-col items-center justify-center w-[80%]", className && className)}>
        {children}
        {!updatable ? (
            <div className="flex flex-row items-center justify-center pt-3">
                <Button
                className="bg-primary-500  justify-between w-full !font-medium mr-1"
                onClick={() => {
                    setX(false);
                    updateX();
                    setShowEdit(true);
                }}
                >
                Update
                </Button>
                <Button
                className="!bg-inherit !text-white hover:bg-inherit justify-between w-full !font-medium ml-1"
                onClick={() => {
                    setX(false);
                    setShowEdit(true);
                }}
                >
                Cancel
                </Button>
            </div>
        ) :
        (
            <Button
            className="!bg-inherit !text-white hover:bg-inherit justify-between w-full !font-medium ml-1 mt-4"
            onClick={() => {
                setX(false);
                setShowEdit(true);
            }}
            >
            Go back
            </Button>
        )
    }
</div>
  );
};


export default UpdateChannel;