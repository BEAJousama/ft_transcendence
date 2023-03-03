const Avatar = ({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) => {
  return (
    <img
      className={`w-10 h-10 rounded-full ${className}`}
      src={src}
      alt={alt}
    />
  );
};

export default Avatar;
