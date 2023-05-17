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
      {new Array(25).fill(0).map((_, i) => {
        return (
          <Channel
            key={i}
            name="User Name"
            pinned={!(i % 2) ? true : false}
            muted={i % 2 ? true : false}
            avatar={`https://randomuser.me/api/portraits/women/${i}.jpg`}
            description="Let's make sure we prepare well so we can have a great experience at Gitex Africa and in Marrakech."
            onClick={onClick}
          />
        );
      })}
    </div>
  );
};

export default ChannelList;
