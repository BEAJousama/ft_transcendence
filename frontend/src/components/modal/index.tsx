import clsx from "clsx";
import Card from "../card";

const Modal = ({
  children,
  className,
  setShowModal,
}: {
  children: React.ReactNode;
  className?: string;
  setShowModal?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <div className="animation-fade fixed left-0 top-0 z-20 flex h-screen w-screen items-center justify-center animate-duration-500">
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm"></div>
      <Card
        setShowModal={setShowModal}
        className={clsx(`animate-duration-400 z-10  h-fit
      flex min-w-[90%] animate-jump-in flex-col items-center justify-start gap-4 border-none bg-secondary-800 text-white
       shadow-lg shadow-secondary-500 animate-ease-out lg:min-w-[40%] xl:min-w-[800px]`, className && className)}
      >
        {children}
      </Card>
    </div>
  );
};

export default Modal;
