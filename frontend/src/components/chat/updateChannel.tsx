
"use client"

import { twMerge } from "tailwind-merge";
import Button from "../button";


const UpdateChannel = ({
    children,
    className,
    updateX,
    setX,
    setShowEdit,
    setShowModal,
    setValue,
    updatable,
    verify,
    defaultValue,
}
    :
    {
        children: React.ReactNode,
        className?: string,
        updateX: (() => void),
        setX: React.Dispatch<React.SetStateAction<boolean>>,
        setShowEdit: React.Dispatch<React.SetStateAction<boolean>>,
        setShowModal: React.Dispatch<React.SetStateAction<boolean>>,
        setValue?: React.Dispatch<React.SetStateAction<string>>,
        updatable?: boolean,
        verify?: boolean,
        defaultValue?: string,

    }) => {

    return (
        <div className={twMerge("flex flex-col items-center justify-center w-[80%]", className && className)}>
            {children}
            {!updatable ? (
                <div className="flex flex-row items-center justify-center pt-3">
                    <Button
                        className="!bg-inherit !text-white hover:bg-inherit justify-between w-full !font-medium mr-3"
                        onClick={() => {
                            setX(false);
                            setShowEdit(true);
                            defaultValue && setValue && setValue(defaultValue);
                        }}
                        variant="text"
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-primary-500  justify-between w-full !font-medium mr-1"
                        onClick={() => {
                            setX(false);
                            updateX();
                            setShowEdit(true);
                            verify && setShowModal(false);
                        }}
                    >
                        {verify ? "Delete" : "Update"}
                    </Button>
                </div>
            ) :
                (
                    <Button
                        className="!bg-inherit !text-white hover:bg-inherit justify-between w-[30%] !font-medium ml-1 mt-4"
                        onClick={() => {
                            setX(false);
                            setShowEdit(true);
                        }}
                        variant="text"
                    >
                        Go back
                    </Button>
                )
            }
        </div>
    );
};


export default UpdateChannel;