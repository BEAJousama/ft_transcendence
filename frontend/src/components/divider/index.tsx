const Divider = ({ vertical }: { vertical?: boolean }) => {
  return (
    <>
      {!vertical ? (
        <hr className="h-[1px] w-full rounded border-0 bg-gray-700 " />
      ) : (
        <hr className="h-full w-[1px] rounded border-0 bg-gray-700 " />
      )}
    </>
  );
};

export default Divider;
