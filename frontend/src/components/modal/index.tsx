import Card from "../card";

const Modal = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="animation-fade fixed left-0 top-0 flex h-screen w-screen items-center justify-center animate-duration-500">
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm"></div>
      <Card
        className="animate-duration-400 z-10 
      flex min-w-[90%] animate-jump-in flex-col items-center justify-start gap-4 border-none bg-secondary-800 text-white
       shadow-lg shadow-secondary-500 animate-ease-out lg:min-w-[40%] xl:min-w-[800px]"
      >
        {children}
      </Card>
    </div>
  );
};

export default Modal;
