import Avatar from "../avatar";
import AvatarGroup from "../avatarGroup";
import Button from "../button";
import { BsKeyFill, BsFillPeopleFill } from "react-icons/bs";

const ChatBanner = () => {
    return (
        <div className="flex flex-col  gap-2 border-2 border-secondary-400 rounded-md p-2 sm:p-4 shadow-sm shadow-secondary-400 max-w-[500px] w-full">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="w-full">
                    <div className="text-white text-lg ">l3aba9ira</div>
                    <div className="flex items-center text-sm text-tertiary-200 justify-between w-full sm:justify-start sm:gap-4">
                        <div>5 Members</div>
                        <div className="flex items-center gap-2">
                            {/* <BsKeyFill /> Protected */}
                            <BsFillPeopleFill /> Public
                        </div>
                    </div>
                </div>
                <Button className="w-full sm:w-auto ">Join</Button>
            </div>
            <AvatarGroup max={4}>
                <Avatar src="https://github.com/Hicham-BelHoucin.png" alt="" />
                <Avatar src="https://github.com/BEAJousama.png" alt="" />
                <Avatar src="https://github.com/Ysrbolles.png" alt="" />
                <Avatar src="https://github.com/AnouarSaadi.png" alt="" />
                <Avatar src="https://github.com/imabid99.png" alt="" />
            </AvatarGroup>
        </div>
    );
};

export default ChatBanner;
