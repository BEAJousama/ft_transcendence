import clsx from "clsx";

const Avatar = ({
  src,
  alt,
  className,
  status,
}: {
  src: string | undefined;
  alt: string;
  className?: string;
  status?: boolean;
}) => {
  return (
    <div className="relative inline-block">
      <img
        className={clsx("w-12 h-12 rounded-full border-1 border-white object-cover", className && className)}
        src={src}
        alt={alt}
        />
        {
          status && 
          <span className="w-3 h-3 rounded-full bg-green-500 border-1 border-white absolute bottom-0 right-0"></span>     
        }
    </div>
  );
};

export default Avatar;
