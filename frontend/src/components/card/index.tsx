import { useClickAway } from "react-use";
import { useRef } from "react";

const Card = ({
  children,
  className,
  setShowModal,
}: {
  children?: React.ReactNode;
  className?: string;
  setShowModal?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const ref = useRef(null);

  useClickAway(ref, () => {
    console.log("clickaway");
    setShowModal && setShowModal(false);
  });
  return (
    <div
      className={`max-w-sm rounded-lg border p-6 shadow ${className}`}
      ref={ref}
    >
      {children}
    </div>
  );
};

export default Card;
