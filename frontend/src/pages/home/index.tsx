import { Avatar, ProfileBanner, Sidepanel } from "../../components";



const Game = () => {
  return (
    <div className="flex items-center justify-center bg-tertiary-500 rounded-full h-12 m-4 w-full">
      <div className="flex items-center justify-center w-full">
        <Avatar
          src={`https://randomuser.me/api/portraits/women/${2}.jpg`}
          className="w-16 h-16"
          alt="" />
        <div className="flex flex-col text-white items-end justify-end w-full px-4">
          <span className="text-center w-[20%] font-bold">3</span>
          <span className="text-center w-[20%] font-bold">login</span>
        </div>
      </div>
      <span className="text-3xl text-primary-500 shadow-lg  shadow-primary-500">•</span>
      <div className="flex items-center justify-end w-full">
        <div className="flex flex-col text-white items-start justify-center w-full px-4">
          <span className="text-center w-[20%] font-bold">3</span>
          <span className="text-center w-[20%] font-bold">login</span>
        </div>
        <Avatar
          src={`https://randomuser.me/api/portraits/women/${4}.jpg`}
          className="w-16 h-16"
          alt="" />
      </div>
    </div>
  )
}

const Container = ({
  children,
  title,
  icon,
}: {
  children?: React.ReactNode;
  title: string;
  icon: string;
}) => {
  return (
    <div className="flex w-[88%] max-w-[800px] flex-col gap-2 p-4">
      <div className="relative m-5 flex h-[500px] rounded border-2 border-secondary-400">
        <img
          src={icon}
          alt="icon"
          className="absolute -top-10 left-1/2 -translate-x-1/2 transform"
        />
        <span className=" absolute left-1/2 top-2 z-10 -translate-x-1/2 transform text-xl font-bold text-white">
          {title}
        </span>
        <div className=" absolute left-1/2 top-10 flex max-h-[450px] w-full -translate-x-1/2 transform flex-col items-center justify-center gap-2 overflow-auto px-5 pt-20 scrollbar-hide">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <div className="grid h-screen w-screen grid-cols-10 overflow-hidden bg-secondary-500">
      <Sidepanel className="col-span-2 2xl:col-span-1" />
      <div className="col-span-8 overflow-auto scrollbar-hide">
        {/* <Container title="Leader Board" icon="/img/3dMedal.svg">
          {new Array(25).fill(0).map((_, i) => {
            return (
              <ProfileBanner
                key={i}
                name="User Name"
                avatar={`https://randomuser.me/api/portraits/women/${i}.jpg`}
                description="Let's make sure we prepare well so we can have a great experience at Gitex Africa and in Marrakech."
              />
            );
          })}
        </Container>
        <Container title="FRIEND LIST" icon="/img/friendlist.svg">
          {new Array(25).fill(0).map((_, i) => {
            return (
              <ProfileBanner
                key={i}
                name="User Name"
                avatar={`https://randomuser.me/api/portraits/women/${i}.jpg`}
                description="Let's make sure we prepare well so we can have a great experience at Gitex Africa and in Marrakech."
              />
            );
          })}
        </Container> */}
        <Container title="LIVE FEED" icon="/img/3dCam.svg">
          {new Array(25).fill(0).map((_, i) => {
            return (
              <Game
                key={i}
              // name="User Name"
              // avatar={`https://randomuser.me/api/portraits/women/${i}.jpg`}
              // description="Let's make sure we prepare well so we can have a great experience at Gitex Africa and in Marrakech."
              />
            );
          })}
        </Container>
      </div>
    </div>
  );
}
