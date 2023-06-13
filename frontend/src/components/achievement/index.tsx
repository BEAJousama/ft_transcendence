import clsx from "clsx";
import Card from "../card";


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
                loading="lazy"
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


export default Achievement;