import { ProfileBanner, Sidepanel } from "../../components";

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
    <div className="flex w-[88%] flex-col gap-2 p-4">
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
        <Container title="Leader Board" icon="/img/3dMedal.svg">
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
        </Container>
        <Container title="Leader Board" icon="/img/3dCam.svg">
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
      </div>
    </div>
  );
}
