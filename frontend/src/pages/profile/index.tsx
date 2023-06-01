import { BsThreeDotsVertical } from "react-icons/bs";
import {
    Button,
    Card,
    Divider,
    RightClickMenu,
    RightClickMenuItem,
    Sidepanel,
} from "../../components";
import { CgProfile } from "react-icons/cg";
import { useContext, useState } from "react";
import { AppContext } from "../../context/app.context";

const icons = [
    "beginner.svg",
    "amateur.svg",
    "semi-professional.svg",
    "professional.svg",
    "world-class.svg",
    "legendary.svg",
];

const Achievement = ({
    title,
    description,
}: {
    title: string;
    description: string;
}) => {
    return (
        <Card
            className="flex flex-col items-center justify-center gap-3 !border-tertiary-500 
        !bg-secondary-600  text-white !shadow-2xl !shadow-secondary-600"
        >
            <img
                src={`/achievements/${title.toLocaleLowerCase()}.png`}
                alt="Achievement"
                width={150}
            />
            <div className="font-montserrat text-sm font-bold">
                {title.charAt(0)
                    .toLocaleUpperCase() +
                    title.slice(1).toLocaleLowerCase()
                        .replaceAll("_", " ")
                }
            </div>
            <div className="text-center text-xs text-tertiary-200 font-montserrat">{description}</div>
        </Card>
    );
};

export default function Profile() {
    const { user } = useContext(AppContext);
    const [show, setShow] = useState(false);

    return (
        <div className="grid h-screen w-screen grid-cols-10 bg-secondary-500">
            <Sidepanel className="col-span-2 2xl:col-span-1" />
            <div className="col-span-8 2xl:col-span-9 flex h-screen flex-col items-center gap-4 overflow-y-scroll  px-4 py-16 scrollbar-hide md:gap-8">
                <div className="flex w-full max-w-[1024px] items-center gap-2 p-2 text-lg font-bold text-white md:gap-4 md:text-2xl">
                    <CgProfile />
                    Profile
                </div>
                <div className="flex w-full max-w-[1024px] flex-col justify-between gap-4 md:flex-row">
                    <div className="w-full max-w-[400px]">
                        <div className="flex w-full items-center justify-between gap-4 font-serif text-white">
                            <img src={`/levels/${user?.ladder}.svg`} alt="" width={70} />
                            <div className="place-items-left grid w-full gap-1">
                                <span>{user?.fullname}</span>
                                <div className="flex items-center gap-2">
                                    <img src={`/img/smalllogo.svg`} alt="" width={20} />
                                    <span>100/5000</span>
                                </div>
                                <div className="mb-4 h-4 w-full rounded-full bg-primary-800 dark:bg-gray-700">
                                    <div
                                        className="h-4 rounded-full bg-primary-400"
                                        style={{ width: "15%" }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <img src={`/img/win.png`} alt=" 12 " width={40} />
                                <div className="flex flex-col text-green-500">
                                    <span>12</span>
                                    Total Wins
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <img src={`/img/lose.png`} alt=" 12 " width={40} />
                                <div className="flex flex-col text-red-500">
                                    <span>2</span>
                                    Total Losses
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative flex items-center justify-between gap-2">
                        <Button className="!text-xs">Message</Button>
                        <Button className="!text-xs">Add Friend</Button>
                        <Button
                            variant="text"
                            className="!hover:bg-secondary-500 !bg-secondary-500 !text-white"
                            onClick={() => {
                                setShow((prev) => !prev);
                            }}
                        >
                            <BsThreeDotsVertical />
                        </Button>
                        {show && (
                            <RightClickMenu className=" mt-1 translate-x-1/2 translate-y-1/3 transform">
                                <RightClickMenuItem
                                    onClick={() => {
                                        setShow(false);
                                    }}
                                >
                                    Block
                                </RightClickMenuItem>
                            </RightClickMenu>
                        )}
                    </div>
                </div>
                <div className="relative hidden h-14 w-full max-w-[1024px] md:block">
                    <div className="absolute -top-5 z-10 flex w-full items-center justify-between">
                        {icons.map((item) => {
                            return <img src={`/levels/${item}`} alt="" width={40} />;
                        })}
                    </div>
                    <div className="absolute top-[45%] mb-4 h-4 w-full rounded-full bg-primary-800 dark:bg-gray-700">
                        <div
                            className="h-4 rounded-full bg-primary-400"
                            style={{ width: "75%" }}
                        ></div>
                    </div>
                </div>
                <Divider />
                <span className="w-full max-w-[1024px] text-xl font-bold text-white">
                    Achievements <span className="text-primary-500">9</span> / 9
                </span>
                <div className="flex w-full max-w-[1024px] items-center justify-center">
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:gap-8">
                        <Achievement
                            title="COMEBACK_KING"
                            description="Win a game after being down by 5 or more points."
                        />
                        <Achievement
                            title="PERFECT_GAME"
                            description="Achieve a score of 11-0 in a single game against the computer or another player."
                        />
                        <Achievement
                            title="SHARP_SHOOTER"
                            description="Score 10 or more points in a row without missing a shot."
                        />
                        <Achievement
                            title="MARATHON_MATCH"
                            description="Play a game that lasts more than 10 minutes."
                        />
                        <Achievement
                            title="SPEED_DEMON"
                            description="Score a point within 10 seconds of the start of a game."
                        />
                        <Achievement
                            title="MASTER_OF_SPIN"
                            description="Score a point with a spin shot that confuses the opponent."
                        />
                        <Achievement
                            title="TRICKSTER"
                            description="Score a point by bouncing the ball off the wall or the paddle."
                        />
                        <Achievement
                            title="IRON_PADDLE"
                            description="Block 50 or more shots in a single game."
                        />
                        <Achievement
                            title="STREAKER"
                            description="Win 10 or more games in a row against the computer or other players."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
