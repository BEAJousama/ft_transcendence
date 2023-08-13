
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
    handleRemovePassword,
    updatable,
    verify,
    remove,
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
        handleRemovePassword?: (() => void),
        updatable?: boolean,
        verify?: boolean,
        remove?: boolean,
        defaultValue?: string,

    }) => {

    return (
        <div className={twMerge("flex flex-col items-center justify-center w-[80%]", className && className)}>
            {children}
            {!updatable ? (
                <div className="flex flex-row items-center justify-center pt-3">
                    <Button
                        className="!bg-inherit !text-white justify-between w-full !font-medium mr-3"
                        onClick={() => {
                            setX(false);
                            setShowEdit(true);
                            defaultValue && setValue && setValue(defaultValue);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type={verify ? "danger" : "primary"}
                        className="bg-primary-500 !text-secondary-500  justify-between w-full !font-medium mr-1"
                        onClick={() => {
                            setX(false);
                            updateX();
                            setShowEdit(true);
                            verify && setShowModal(false);
                            defaultValue && setValue && setValue(defaultValue);
                        }}
                    >
                        {verify ? "Delete" : "Update"}
                    </Button>
                    {remove && (                     
                        <Button
                        type="danger"
                        onClick={() => {
                            handleRemovePassword && handleRemovePassword();
                        }}
                        >
                        Remove
                    </Button>
                    )}
                </div>
            ) :
                (
                    <Button
                        className="!bg-inherit !text-white justify-between w-[30%] !font-medium ml-1 mt-4"
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