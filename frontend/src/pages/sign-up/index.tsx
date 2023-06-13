import { Avatar, Card, Button, Input } from "../../components";
import { useContext, useState } from "react";
import { MdOutlineModeEdit } from "react-icons/md";
import { useRef } from "react";
import { useFormik } from "formik";
import { AppContext } from "../../context/app.context";
import axios from "axios";
import { Link, Navigate, redirect } from "react-router-dom";

export default function SignUp() {
  function isValidEmail(email: string) {
    // Regular expression pattern for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  function isStrongPassword(password: string) {
    // Check for a combination of uppercase letters, lowercase letters, numbers, and symbols
    const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).*$/;
    return passwordRegex.test(password)
  }

  const formik = useFormik({
    initialValues: {
      email: "",
      username: "",
      fullname: "",
      password: "",
      confirmPassword: "",
    },
    validate: (values) => {
      const errors: {
        email?: string;
        username?: string;
        fullname?: string;
        password?: string;
        confirmPassword?: string;
      } = {};

      // Validate email
      if (!values.email) {
        errors.email = "Email is required";
      } else if (!isValidEmail(values.email)) {
        errors.email = "Invalid email format";
      }

      // Validate username
      if (!values.username) {
        errors.username = "Username is required";
      }

      // Validate fullname
      if (!values.fullname) {
        errors.fullname = "Fullname is required";
      }

      // Validate password
      if (!values.password) {
        errors.password = "Password is required";
      }
      // else if (values.password.length < 12) {
      //   errors.password = "Password should be at least 12 characters long";
      // } else if (values.password.length < 14) {
      //   errors.password = "Consider using a password that is 14 characters or longer for better security";
      // }
      // else if (!isStrongPassword(values.password)) {
      //   errors.password = "Password must contain a combination of uppercase letters, lowercase letters, numbers, and symbols, and should not be a common word or name";
      // }

      // Validate confirmPassword
      if (!values.confirmPassword) {
        errors.confirmPassword = "Confirm Password is required";
      } else if (values.password !== values.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }

      return errors
    },
    onSubmit: (values) => { },
  });

  const [error, setError] = useState("");
  const [redirect, setRedirect] = useState<boolean>();

  if (redirect) return <Navigate to="/login" />;

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-secondary-700">
      <Card className="flex w-full max-w-xs  flex-col items-center justify-center gap-4  border-none bg-secondary-500 p-16 text-white shadow-lg shadow-secondary-500 md:max-w-md lg:max-w-lg lg:gap-4 lg:px-16 lg:py-8">
        <img src="/img/smalllogo.svg" alt="logo" width={40} />
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl">Let's create your account</h1>
          <p className=" text-tertiary-200">Please enter your details</p>
        </div>
        <Input
          required
          onChange={formik.handleChange}
          value={formik.values.fullname}
          error={formik.errors.fullname}
          isError={!!formik.errors.fullname}
          name="fullname"
          label="FullName"
        />
        <Input
          required
          onChange={formik.handleChange}
          value={formik.values.username}
          error={formik.errors.username}
          isError={!!formik.errors.username}
          name="username"
          label="UserName"
          htmlType="email"
        />
        <Input
          required
          onChange={formik.handleChange}
          value={formik.values.email}
          error={formik.errors.email}
          isError={!!formik.errors.email}
          name="email"
          label="Email"
        />
        <Input
          required
          onChange={formik.handleChange}
          value={formik.values.password}
          error={formik.errors.password}
          isError={!!formik.errors.password}
          name="password"
          label="Password"
          htmlType="password"
        />
        <Input
          required
          onChange={formik.handleChange}
          value={formik.values.confirmPassword}
          error={formik.errors.confirmPassword}
          isError={!!formik.errors.confirmPassword}
          name="confirmPassword"
          label="Confirm Password"
          htmlType="password"
        />
        {error && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-500">
            <span className="font-medium">{error}</span>
          </p>
        )}
        <Button
          className="w-full"
          onClick={async () => {
            try {
              setError("")
              formik.validateForm();

              if (Object.keys(formik.errors).length > 0) {
                return;
              }


              const res = await axios.post(
                `${process.env.REACT_APP_BACK_END_URL}api/auth/signup`,
                {
                  fullname: formik.values.fullname,
                  username: formik.values.username,
                  password: formik.values.password,
                  email: formik.values.email,
                }
              );
              if (res.data) {
                console.log(res.data);
                setError("");
                setRedirect(true);
              }
              console.log(res)
            } catch (e: any) {
              console.log(e);
              setError(e.response.data.message);
            }
          }}
        >
          Sign Up
        </Button>
        <div className="w-full pt-1 text-center text-tertiary-300">
          Already have an account?
          <Link to="/login" className="ml-1 text-tertiary-400">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}
