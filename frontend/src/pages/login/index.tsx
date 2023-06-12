import { useContext, useEffect, useState } from "react";
import { Card, Button, Spinner, Input, Divider } from "./../../components";
import axios from "axios";
import { AppContext } from "./../../context/app.context";
import { Link, Navigate } from "react-router-dom";
import { useFormik } from "formik";

// max-w-lg
export default function Login() {
  const { authenticated, fetchUser } = useContext(AppContext);
  const [loading, setLaoding] = useState<boolean>(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState<boolean>(false);
  const [error, setError] = useState("");
  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validate: (values) => {
      const errors: {
        username?: string;
        password?: string;
      } = {};

      if (!values.username) {
        errors.username = "Username is required";
      }

      if (!values.password) {
        errors.password = "Password is required";
      }

      return errors;
    },
    onSubmit: async (values) => { }
  })

  useEffect(() => {
    (async () => {
      try {
        const res = await axios(
          `${process.env.REACT_APP_BACK_END_URL}api/auth/42/login`
        );
        if (res.data.name) {
          setTwoFactorAuth(res.data.name === "2fa_access_token");
          window.localStorage?.setItem(res.data.name, res.data.value);
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
        <Card className="flex text-white gap-4  max-w-xs flex-col items-center justify-center  border-none bg-secondary-500 p-16 shadow-lg shadow-secondary-500 md:max-w-md lg:max-w-lg lg:gap-4 lg:px-16 lg:py-8 w-full">
          <img src="/img/smalllogo.svg" alt="logo" width={40} />
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl">Welcome Back</h1>
            <p className=" text-tertiary-200">Please enter your details</p>
          </div>
          <Input value={formik.values.username} error={formik.errors.username} isError={!!formik.errors.username} onChange={formik.handleChange} name="username" label="UserName" />
          <Input value={formik.values.password} error={formik.errors.password} isError={!!formik.errors.password} onChange={formik.handleChange} name="password" label="Password" htmlType="password" />
          {error && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-500">
              <span className="font-medium">{error}</span>
            </p>
          )}
          <Button className="w-full" onClick={async () => {
            try {
              setError("")
              formik.validateForm();

              if (Object.keys(formik.errors).length > 0) {
                return;
              }
              const res = await axios.post(
                `${process.env.REACT_APP_BACK_END_URL}api/auth/signin`,
                {
                  username: formik.values.username,
                  password: formik.values.password,
                }
              );
              if (res.data.name) {
                setTwoFactorAuth(res.data.name === "2fa_access_token");
                window.localStorage?.setItem(res.data.name, res.data.value);
                await fetchUser();
              }
            } catch (_e) {
              setError("Email or Password incorrect ")
              console.log(_e)
            }
          }}>
            Sign in
          </Button>
          <div className="w-full flex items-center gap-2">
            <hr className="border-gray-600 w-[70%]" />
            or
            <hr className="border-gray-600 w-[70%]" />
          </div>
          <div className="w-full flex justify-center md:flex-col gap-4">
            <Link to={`${process.env.REACT_APP_BACK_END_URL}api/auth/42/callback`} >
              <Button className="md:w-full rounded-full md:rounded md:h-auto w-14 h-14 justify-center text-xs lg:text-lg">
                <img src="/img/42logo.svg" alt="logo" width={30} />
                <p
                  className="text-black hidden md:block"
                >
                  Continue with Intra
                </p>
              </Button>
            </Link>
            <Link to={`${process.env.REACT_APP_BACK_END_URL}api/auth/google/login`}>
              <Button className="md:w-full rounded-full md:rounded md:h-auto w-14 h-14 justify-center text-xs lg:text-lg">
                <img src="/img/google.svg" alt="logo" width={30} />
                <p
                  className="text-black hidden md:block"
                >
                  Continue with Google
                </p>
              </Button>
            </Link>
          </div>
          <div className="pt-1 text-center w-full text-tertiary-300">
            Don't have an account?
            <Link to="/signup" className="ml-1 text-tertiary-400">
              Sign up
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
