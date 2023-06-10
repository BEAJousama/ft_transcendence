import { Avatar, Card, Button, Input } from "./../../components";
import { useContext, useState } from "react";
import { MdOutlineModeEdit } from "react-icons/md";
import { useRef } from "react";
import { useFormik } from "formik";
import { AppContext } from "../../context/app.context";
import axios from "axios";
import { Navigate } from "react-router-dom";

export default function SignUp() {
  const { user, updateUser } = useContext(AppContext)
  const formik = useFormik({
    initialValues: {
      username: user?.username,
      email: user?.email,
      phone: user?.phone,
      fullname: user?.fullname,
    },
    onSubmit: (values) => { }
  })
  const ref = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<Blob>();
  const [previewImage, setPreviewImage] = useState<string>(
    user?.avatar || ""
  );
  const [redirect, setRedirect] = useState<boolean>(user ? new Date(user?.createdAt).toLocaleString() !== new Date(user?.updatedAt).toLocaleString() : false)

  if (redirect)
    return <Navigate to="/" />

  // console.log(user ? new Date(user?.createdAt).toLocaleString() === new Date(user?.updatedAt).toLocaleString() : false)

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-secondary-700">
      <Card className="m-4 flex max-w-xs flex-col items-center justify-center gap-4 border-none bg-secondary-500 shadow-md shadow-secondary-500 md:max-w-7xl md:gap-8 md:p-16">
        <div className="relative">
          <Avatar
            src={previewImage}
            alt="porfile-picture"
            className="h-24 w-24 md:h-32 md:w-32"
          />
          <Button
            variant="contained"
            className="absolute -bottom-1 right-0 m-0 rounded-full !px-2 !py-2 md:right-2"
            onClick={() => {
              ref.current?.click();
            }}
          >
            <MdOutlineModeEdit />
            <input
              type="file"
              hidden
              ref={ref}
              accept="image/png, image/jpeg"
              onChange={(e) => {
                if (e.target.files) {
                  setFile(e.target.files[0]);
                  if (e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setPreviewImage(reader.result as string);
                    };
                    reader.readAsDataURL(file ? file : e.target.files[0]);
                  }
                }
              }}
            />
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Full Name" disabled value={formik.values.fullname} />
          <Input label="User Name" value={formik.values.username} onChange={formik.handleChange} />
          <Input label="Phone number" placeholder="+212" value={formik.values.phone} onChange={formik.handleChange} />
          <Input label="Email" value={formik.values.email} onChange={formik.handleChange} />
        </div>
        <div className="flex w-full items-center justify-center gap-8">
          <Button
            className="w-full justify-center"
            type="success"
            onClick={async () => {
              const accessToken = window.localStorage.getItem("access_token");
              await axios.post(
                `${process.env.REACT_APP_BACK_END_URL}api/users/${user?.id}`,
                {
                  user: {
                    username: formik.values.username,
                    email: formik.values.email,
                    phone: formik.values.phone,
                    avatar: previewImage,
                  },
                },
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              );
              await updateUser();
              setRedirect(true);
            }}
          >
            Submit
          </Button>
          <Button
            className="w-full justify-center"
            type="danger"
            onClick={formik.handleReset}
          >
            Reset
          </Button>
        </div>
      </Card>
    </div>
  );
}
