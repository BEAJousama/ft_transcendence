import { useContext, useEffect, useState } from "react";
import { Card, Button, Spinner } from "./../../components";
import axios from "axios";
import { AppContext } from "./../../context/app.context";
import { Navigate } from "react-router-dom";

// max-w-lg
export default function Login() {
  const { authenticated, fetchUser } = useContext(AppContext);
  const [loading, setLaoding] = useState<boolean>(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios(
          `${process.env.REACT_APP_BACK_END_URL}api/auth/42/login`
        );
        if (res.data.name) {
          setTwoFactorAuth(res.data.name === "2fa_access_token");
          window.localStorage.setItem(res.data.name, res.data.value);
          await fetchUser();
        }
        setLaoding(false);
      } catch (_e) {
        setLaoding(false);
      }
    })();
  }, [fetchUser]);

  if (authenticated) {
    return <Navigate to="/" />;
  }

  if (twoFactorAuth) return <Navigate to="/tfa" />;
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-secondary-700 ">
      {loading ? (
        <Spinner />
      ) : (
        <Card className="flex max-w-xs flex-col items-center justify-center gap-8 border-none bg-secondary-500 p-16 shadow-lg shadow-secondary-500 lg:max-w-lg lg:gap-16 lg:p-24">
          <div className="m-4">
            <img src="/img/logo.png" alt="logo" />
          </div>
          <div className="m-2 lg:m-0">
            <Button className=" justify-center text-xs lg:text-lg">
              <img src="/img/42logo.svg" alt="logo" width={30} />
              <a
                className="text-black"
                href={`${process.env.REACT_APP_BACK_END_URL}api/auth/42/callback`}
              >
                Login with Intra
              </a>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
