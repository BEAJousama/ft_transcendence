import Button from "../button";
import Card from "../card";

const JoinGameCard = () => {
    return (
        <Card
            className="flex w-full !max-w-md flex-col items-center
              justify-center bg-gradient-to-tr from-secondary-500 to-secondary-800 text-white"
        >
            <p>Join A Game</p>
            <p>Let The Fun Begin</p>
            <img src="/img/3839218-removebg-preview.png" alt="" width={280} />
            <Button className="w-full justify-center">Play Now</Button>
        </Card>
    );
};

export default JoinGameCard