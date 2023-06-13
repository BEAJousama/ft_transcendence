import { useMedia } from "react-use";
import Avatar from "../avatar";
import clsx from "clsx";
import IUser from "../../interfaces/user";

const UserBanner = ({
    showRank,
    rank,
    showRating,
    user,
}: {
    showRank?: boolean;
    showRating?: boolean;
    rank?: number;
    user?: IUser;
}) => {
    const isMatch = useMedia("(max-width: 530px)");
    return (
        <div className="my-3 flex h-12 w-full items-center gap-2 justify-between rounded-full bg-tertiary-500">
            <Avatar
                src={user?.avatar || ""}
                className="h-16 w-16"
                alt=""
            />
            {showRank && (
                <div className="w-[20%]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary-500 text-white">
                        {rank}
                    </div>
                </div>
            )}
            <div
                className={clsx(
                    "flex w-full flex-col items-start justify-center text-white md:p-4",
                    !showRating && "!items-start"
                )}
            >
                <span
                    className={clsx(
                        "max-w-[80px] truncate text-left text-xs sm:max-w-full",
                        !isMatch && showRating && "!max-w-[150px]",
                        !isMatch && !showRating && "!max-w-full",
                        true && "!xl:max-w-full !w-full"
                    )}
                >
                    {user?.fullname || ""}
                </span>
                <span
                    className={clsx(
                        "max-w-[80px] truncate text-left text-xs sm:max-w-full",
                        !isMatch && showRating && "!max-w-[90px]",
                        !isMatch && !showRating && "!max-w-full",
                        "!xl:max-w-full !w-full"
                    )}
                >
                    @{user?.login || ""}
                </span>
            </div>
            <div
                className={clsx(
                    "flex items-center gap-2 pr-8 text-xs text-white",
                    (isMatch || !showRating) && "hidden"
                )}
            >
                {user?.rating}
                <img src="/img/smalllogo.svg" alt="logo" width={20} />
            </div>
        </div>
    );
};

export default UserBanner;