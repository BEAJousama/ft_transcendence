import { useRef, useState } from "react";
import Avatar from "../avatar";
import Button from "../button";
import { MdOutlineModeEdit } from "react-icons/md";

const UpdateAvatar = ({
    previewImage,
    setPreviewImage,
}: {
    previewImage: string;
    setPreviewImage: React.Dispatch<React.SetStateAction<string>>;
}) => {
    const ref = useRef<HTMLInputElement>(null);
    return (
        <div className="flex items-center justify-center pt-4 ">
            <div className="relative">
                <Avatar
                    src={previewImage}
                    alt="porfile-picture"
                    className="h-36 w-36 md:h-52 md:w-52 object-cover"
                />
                <Button
                    variant="contained"
                    className="absolute bottom-1 right-2 m-0 rounded-full !px-2 !py-2 md:bottom-2 md:right-6"
                    onClick={() => {
                        ref.current?.click();
                    }}
                >
                    <MdOutlineModeEdit />
                    <input
                        type="file"
                        hidden
                        ref={ref}
                        accept="image/png, image/jpeg"
                        onChange={(e) => {
                            if (e.target.files) {
                                if (e.target.files[0]) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        setPreviewImage(reader.result as string);
                                    };
                                    reader.readAsDataURL(e.target.files[0]);
                                }
                            }
                        }}
                    />
                </Button>
            </div>
        </div>
    );
};

export default UpdateAvatar;