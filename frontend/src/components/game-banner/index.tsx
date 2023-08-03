import IUser from "../../interfaces/user";
import Avatar from "../avatar";

const GameBanner = ({ player1, player2,
    player1Score, player2Score
}: {
    player1?: IUser;
    player2?: IUser;
    player1Score?: number;
    player2Score?: number;
}) => {
    return (
        <div className="my-4 flex h-12 w-full items-center justify-center rounded-full bg-tertiary-500 text-white">
            <div className="basis-[15%]">
                <Avatar
                    src={player1?.avatar || ""}
                    className="h-16 w-16"
                    alt=""
                />
            </div>
            <div className="w-full flex items-center justify-between">
                <div className="flex flex-col items-center justify-center w-full">
                    <span>{player1Score}</span>
                    <span className="hidden md:block">{player1?.username}</span>
                </div>
                <div className=" relative w-10 text-primary-500 text-5xl text-center">•</div>
                <div className="flex flex-col items-center justify-center w-full">
                    <span>{player2Score}</span>
                    <span className="hidden md:block">{player2?.username}</span>
                </div>
            </div>
            <div className="basis-[15%] flex items-center justify-end">

                <Avatar
                    src={player2?.avatar || ""}
                    className="h-16 w-16"
                    alt=""
                />
            </div>
        </div>
    );
};

export default GameBanner