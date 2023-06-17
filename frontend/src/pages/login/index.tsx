import { useContext, useEffect, useState, KeyboardEvent } from "react";
import { Card, Button, Spinner, Input } from "./../../components";
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
    validateOnChange: false,
    validateOnBlur: true,
    validate: (values) => {
      const errors: {
        username?: string;
        password?: string;
      } = {};

      if (!values.username) {
        errors.username = "Please enter your username";
      }

      else if (!values.password) {
        errors.password = "Please enter your password";
      }

      return errors;
    },
    onSubmit: async (values) => { },
  });

  const handleLogin = async () => {
    try {
      setError("");
      formik.validateForm();

      if (
        Object.keys(formik.errors).length > 0 ||
        Object.keys(await formik.validateForm()).length > 0
      ) {
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
      setError("Incorrect username or password");
      console.log(_e);
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

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
    <div
      className="flex h-screen w-screen items-center justify-center overflow-auto bg-secondary-700 scrollbar-hide"
      onKeyDown={handleKeyPress}
    >
      {loading ? (
        <Spinner />
      ) : (
        <Card className="flex w-full max-w-xs  flex-col items-center justify-center gap-4  border-none bg-secondary-500 px-8 py-12 text-white shadow-lg shadow-secondary-500 md:max-w-md lg:max-w-lg lg:gap-4 lg:px-12 lg:py-16">
          <img src="/img/smalllogo.svg" alt="logo" width={40} />
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl">Welcome Back</h1>
            <p className=" text-tertiary-200">Please enter your credentials</p>
          </div>
          <Input
            value={formik.values.username}
            error={formik.errors.username}
            isError={!!formik.errors.username}
            onChange={formik.handleChange}
            name="username"
            label="Username"
            onBlur={formik.handleBlur}
          />
          <Input
            value={formik.values.password}
            error={formik.errors.password}
            isError={!!formik.errors.password}
            onChange={formik.handleChange}
            name="password"
            label="Password"
            htmlType="password"
            onBlur={formik.handleBlur}
          />
          {error && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-500">
              <span className="font-medium">{error}</span>
            </p>
          )}
          <Button className="w-full" onClick={handleLogin}>
            Sign in
          </Button>
          <div className="flex w-full items-center gap-2">
            <hr className="w-[70%] border-gray-600" />
            or
            <hr className="w-[70%] border-gray-600" />
          </div>
          <div className="flex w-full justify-center gap-4 md:flex-col">
            <Link
              to={`${process.env.REACT_APP_BACK_END_URL}api/auth/42/callback`}
            >
              <Button type="secondary" className="h-14 w-14 justify-center rounded-full text-xs md:h-auto md:w-full md:rounded lg:text-base">
                <img src="/img/42Logo-light.svg" alt="logo" width={30} />
                <p className="hidden md:block">
                  Continue with Intra
                </p>
              </Button>
            </Link>
            <Link
              to={`${process.env.REACT_APP_BACK_END_URL}api/auth/google/login`}
            >
              <Button type="secondary" className="h-14 w-14 justify-center rounded-full text-xs md:h-auto md:w-full md:rounded lg:text-base">
                <img src="/img/google.svg" alt="logo" width={30} />
                <p className="hidden md:block">
                  Continue with Google
                </p>
              </Button>
            </Link>
          </div>
          <div className="w-full pt-1 text-center text-tertiary-300 flex flex-col md:flex-row items-center justify-center">
            Don't have an account?
            <Link to="/signup" className="ml-1 text-tertiary-100 underline hover:text-primary-500  hover:scale-105 transition ease-in-out duration-400">
              Sign up
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
