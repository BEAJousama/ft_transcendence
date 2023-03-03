import { Button } from "../components";

const Login = () => {
  return (
    <div
      className="h-screen w-screen flex items-center justify-center flex-col gap-40"
      style={{
        backgroundImage: `url('/img/background_image.jpeg')`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <h1 className="text-white text-8xl	">PongPlaza</h1>
      <Button className=" rounded-xl">
        <img src="/img/42.svg" />
        <a href="http://localhost:3000/api/auth/42/callback">
          Login with intranet
        </a>
      </Button>
    </div>
  );
};

export default Login;
