import ProfileBanner from "../profilebanner";
import Channel from "./channel";

const ChannelList = ({ onClick, setShowModal }: any) => {
  return (
    <div className="lg:col-span-3 col-span-8 flex flex-col justify-start gap-4 py-2 w-full h-screen overflow-y-scroll scrollbar-hide">
      <ProfileBanner
        show={false}
        name="hicham"
        description="Online"
        showAddGroup={true}
        className="px-4"
        setShowModal={setShowModal}
      />

    </div>
  );
};

export default ChannelList;
