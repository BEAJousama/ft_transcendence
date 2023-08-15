
import { twMerge } from "tailwind-merge";
import Button from "../button";


const Welcome = ({ className, setShowModal }: {
  className: string, setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}) => {

  return (
    <div className={twMerge("relative overflow-hidden col-span-10 flex h-screen  w-full items-center justify-center flex-col gap-4 bg-secondary-50 md:col-span-7 max-wd-md animate-fade-right border-l-[1px] border-secondary-500 ", className && className )}>
      <div className="flex items-center justify-center p-1 h-full w-full relative" style={{ backgroundImage: `url('/img/3dchat.svg')`, backgroundRepeat: 'no-repeat', backgroundSize: 'contain', height: 600, width: 600 }}>
        <div className="flex justify-centerbg-opacity-50 backdrop-filter backdrop-blur-lg absolute top-0 left-0 right-0 bottom-0" >
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="text-primary-500 text-2xl  font-bold relative z-10 flex justify-center ">
            Welcome to your chat section!
          </h1>
          <p className="text-primary-50 text-lg font-semibold  relative z-10 flex justify-center"> Stay connected with your friends. </p>
          <p className="text-primary-50 text-lg font-semibold  relative z-10 flex justify-center"> Start a new conversation or select one from the list.</p>
          <p className="text-primary-50 text-lg font-semibold  relative z-10 flex justify-center"> Use the search bar to find specific channels. <br /> <br /> </p>
          <p className="text-primary-50 text-lg font-semibold  relative z-10 flex justify-center pb-10"> Happy chatting!</p>
          <Button
            variant="contained"
            type="secondary"
            className="rounded-md z-20 w-50"
            onClick={() => {
              setShowModal(true);
            }}
          >
            start a new chat
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;