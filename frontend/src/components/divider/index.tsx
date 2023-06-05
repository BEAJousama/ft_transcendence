import clsx from "clsx";


const Divider = ({ vertical, center, title }: { vertical?: boolean, center?: boolean, title?: string }) => {
  return (
    <div className={clsx(center && " flex items-center justify-center m-3")}>
      {!vertical ? (
        <div className="flex w-full flex-col items-center justify-center flex-row text-secondary-300 text-sm">
          <p>{title}</p>
          <hr className="h-[1px] w-[75%] rounded border-0 bg-gray-700 " />
        </div>
      ) : (
        <div>
          <p>{title}</p>
          <hr className="h-[75%] w-[1px] rounded border-0 bg-gray-700 " />
        </div>
      )}
    </div>
  );
};

export default Divider;
