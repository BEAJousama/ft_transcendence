import  clsx from "clsx";
import Button from "../button";


const Welcome = ({className, setShowModal} : {className: string, setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}) => {

  return (
    <div className={clsx("relative overflow-hidden col-span-10 flex h-screen w-full items-center justify-center flex-col gap-4 rounded-t-3xl rounded-b-3xl bg-secondary-600 md:col-span-7 max-wd-md animate-fade-right", className && className )}>
      <div className="flex items-center justify-center p-1 h-full w-full relative" style={{ backgroundImage: `url('/img/chatmenu.svg')`, backgroundRepeat: 'no-repeat', backgroundSize: 'contain', height: 600, width: 600 }}>
        <div className="flex justify-centerbg-opacity-50 backdrop-filter backdrop-blur-lg absolute top-0 left-0 right-0 bottom-0" >
        </div>
        <div > 
          <h1 className="text-primary-400 text-2xl font-montserrat font-bold relative z-10 flex justify-center mb-3">
              Welcome to your chat section! 
          </h1>
          <p className="text-primary-100 text-base font-montserrat relative z-10 flex justify-center mb-3"> Stay connected with your friends. </p>
          <p className="text-primary-100 text-base font-montserrat relative z-10 flex justify-center mb"> Start a new conversation or select one from the list.</p>
          <p className="text-primary-100 text-base font-montserrat relative z-10 flex justify-center mb-3"> Use the search bar to find specific channels. <br /> <br /> </p>
          <p className="text-primary-100 text-base font-montserrat relative z-10 flex justify-center"> Happy chatting!</p>
          <Button
            variant="contained"
            className=" mt-14 bottom-0 left-0 right-0 relative m-auto w-1/2 !bg-inherit !text-primary-300 text-xl !font-normal hover:border-primary-300"
            onClick={() => {
              setShowModal(true);
            }
            }
          >
            start a new chat
          </Button>
        </div>
      </div>
    </div>
  );
  
  
  
  
  
};


export default Welcome;
/* Welcome to your chat section! Stay connected with your friends. Start a new conversation or select one from the list.Use the search bar to find specific messages.Happy chatting! */
