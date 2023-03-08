import { useContext } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components";
import { AppContext } from "../context/app.context";

const Login = () => {
  const { user, setUser } = useContext(AppContext);
  return (
    <div
      className="h-screen w-full flex items-center justify-center flex-col "
      style={{
        backgroundImage: `url('/img/background_image.jpeg')`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <h1 className="text-white lg:text-8xl text-4xl">PongPlaza</h1>
      <Button className=" rounded-xl mt-40">
        <img src="/img/42.svg" alt="" />
        <Link to="http://localhost:3000/api/auth/42/callback">
          Login with intranet
        </Link>
      </Button>
      <Button className="mt-4">
        <Link to="http://localhost:3000/api/auth/logout">Logout</Link>
      </Button>
    </div>
  );
};

export default Login;
