import { BsThreeDotsVertical } from "react-icons/bs";
import {
    Button,
    Card,
    Divider,
    RightClickMenu,
    RightClickMenuItem,
    Sidepanel,
    Spinner,
} from "../../components";
import { CgProfile } from "react-icons/cg";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/app.context";
import clsx from "clsx";
import axios from "axios";
import IAchievement from "../../interfaces/achievement";
// import { useParams } from "react-router-dom";

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
    disabled,
    image,
}: {
    title: string;
    description: string;
    disabled?: boolean;
    image: string;
}) => {
    return (
        <Card
            className={clsx(
                `relative flex flex-col items-center justify-center gap-3 
        overflow-hidden  !border-tertiary-500 !bg-secondary-600 text-white !shadow-2xl !shadow-secondary-600 hover:before:hidden`,
                disabled &&
                `w-full before:absolute before:inset-0 before:bg-secondary-600 before:bg-opacity-5 before:backdrop-blur-sm before:content-['']`
            )}
        >
            <img
                src={`/achievements/${image}`}
                alt="Achievement"
                width={150}
                className="rounded-xl"
            />
            <div className="font-montserrat text-sm font-bold">
                {title.charAt(0).toLocaleUpperCase() +
                    title.slice(1).toLocaleLowerCase().replaceAll("_", " ")}
            </div>
            <div className="text-center font-montserrat text-xs text-tertiary-200">
                {description}
            </div>
        </Card>
    );
};

export default function Profile() {
    const { user } = useContext(AppContext);
    const [show, setShow] = useState(false);
    const [achievements, setAchievements] = useState<IAchievement[]>();

    // const { id } = useParams()
    const isDisabled = (name: string) => {
        const achievements = user?.achievements;
        if (!achievements) return true;
        return !achievements.find((item) => item.name === name)
    }
    useEffect(() => {
        (async () => {
            try {
                const accessToken = window.localStorage.getItem("access_token");
                const response = await axios.get(
                    `${process.env.REACT_APP_BACK_END_URL}api/users/achievements`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );

                response.data.sort((a: IAchievement, b: IAchievement) => {
                    const disabledA = isDisabled(a.name);
                    const disabledB = isDisabled(b.name);

                    if (disabledA && !disabledB) {
                        return 1; // Move disabledA to a higher index
                    } else if (!disabledA && disabledB) {
                        return -1; // Move disabledB to a higher index
                    } else {
                        return 0; // Preserve the original order
                    }
                });

                setAchievements(response.data);

            } catch { }
        })();

    }, []);



    return (
        <div className="grid h-screen w-screen grid-cols-10 bg-secondary-500">
            <Sidepanel className="col-span-2 2xl:col-span-1" />
            <div className="col-span-8 flex h-screen flex-col items-center gap-4 overflow-y-scroll px-4  py-16 scrollbar-hide md:gap-8 2xl:col-span-9">
                <div className="flex w-full max-w-[1024px] items-center gap-2 p-2 text-lg font-bold text-white md:gap-4  md:text-2xl">
                    <CgProfile />
                    Profile
                </div>
                <div className="flex w-full max-w-[1024px] flex-col justify-between gap-4 md:flex-row ">
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
                <div className="relative hidden h-14 w-full max-w-[1024px] md:block ">
                    <div className="absolute -top-5 z-10 flex w-full items-center justify-between">
                        {icons.map((item, i) => {
                            return <img key={i} src={`/levels/${item}`} alt="" width={40} />;
                        })}
                    </div>
                    <div className="absolute top-[45%] mb-4 h-4 w-[99%] rounded-full bg-primary-800 dark:bg-gray-700">
                        <div
                            className="h-4 rounded-full bg-primary-400"
                            style={{ width: "75%" }}
                        ></div>
                    </div>
                </div>
                <Divider />
                <span className="w-full max-w-[1024px] text-xl font-bold text-white">
                    Achievements <span className="text-primary-500">9</span> /
                    {achievements?.length}
                </span>
                <div className="flex w-full max-w-[1024px] items-center justify-center">
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:gap-8">
                        {!achievements ? (
                            <Spinner />
                        ) : (
                            achievements.map((item: IAchievement) => {
                                return (
                                    <Achievement
                                        key={item.id}
                                        title={item.name}
                                        description={item.description}
                                        image={item.image}
                                        disabled={isDisabled(item.name)}
                                    />
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
