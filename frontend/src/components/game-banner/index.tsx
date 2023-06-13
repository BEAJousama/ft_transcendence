import IUser from "../../interfaces/user";
import Avatar from "../avatar";

const GameBanner = ({ player1, player2 }: {
    player1?: IUser;
    player2?: IUser;
}) => {
    return (
        <div className="my-4 flex h-12 w-full items-center justify-center rounded-full bg-tertiary-500 text-white">
            <Avatar
                src={`https://randomuser.me/api/portraits/women/${Math.floor(Math.random() * 40)}.jpg`}
                className="h-16 w-16"
                alt=""
            />
            <div className="w-full flex items-center justify-between">
                <div className="flex flex-col items-center justify-center w-full">
                    <span>3</span>
                    <span className="hidden md:block">Username</span>
                </div>
                <div className=" relative w-10 text-primary-500 text-5xl text-center">•</div>
                <div className="flex flex-col items-center justify-center w-full">
                    <span>2</span>
                    <span className="hidden md:block">Username</span>
                </div>
            </div>
            <Avatar
                src={`https://randomuser.me/api/portraits/women/${Math.floor(Math.random() * 40)}.jpg`}
                className="h-16 w-16"
                alt=""
            />
        </div>
    );
};

export default GameBanner