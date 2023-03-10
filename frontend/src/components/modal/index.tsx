const Modal = ({
  children,
  className,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      id="staticModal"
      data-modal-backdrop="static"
      tabIndex={-1}
      aria-hidden="true"
      className="w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-modal md:h-full"
    >
      <div className="relative w-full h-full max-w-2xl md:h-auto">
        <div
          className={`relative bg-white rounded-lg shadow dark:bg-gray-700 p-8 ${className}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
