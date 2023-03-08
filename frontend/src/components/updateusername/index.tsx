import { useContext, useRef, useState } from "react";
import Avatar from "../avatar";
import Button from "../button";
import Card from "../card";
import Input from "../input";
import { VscDebugContinueSmall } from "react-icons/vsc";
import Divider from "../divider";
import axios from "axios";
import { AppContext } from "../../context/app.context";
import { MdEdit } from "react-icons/md";

const Updateusername = () => {
  const { user, setUsername, setAvatar } = useContext(AppContext);
  const [name, setName] = useState<string>(user?.username || "");
  const ref = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File>();
  const [error, setError] = useState<string>();
  const [disabled, setDisabled] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>(
    user?.avatar || "/img/avatar-placeholder.png"
  );

  return (
    <div className="w-scrren h-screen flex items-center justify-center">
      <Card className="flex items-center justify-center flex-col gap-8">
        <div className="px-7 sm:px-9 relative">
          <Avatar
            // dont forget to change to user's avatar
            src={previewImage}
            alt=""
            className="w-28 h-28 sm:w-40 sm:h-40  md:w-60 md:h-60"
          />
          <Button
            className=" absolute  right-10 -bottom-1.5 md:right-14 md:bottom-3 rounded-full md:h-10 h-8 w-8 md:w-10 px-0 py-0 justify-center right md:text-lg"
            onClick={() => {
              ref.current?.click();
            }}
            disabled={disabled}
          >
            <input
              hidden
              ref={ref}
              accept="image/png, image/jpeg, image/jpg"
              type="file"
              onChange={(e) => {
                if (e.target.files) {
                  setFile(e.target.files[0]);
                  if (e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setPreviewImage(reader.result as string);
                    };
                    reader.readAsDataURL(e.target.files[0]);
                  }
                }
              }}
            />
            <MdEdit />
          </Button>
        </div>
        <Divider />
        <div className="w-full flex gap-2 flex-col">
          <Input
            label="username :"
            placeholder="Enter a username"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
          {error && (
            <p className="p-0 m-0 text-sm text-red-600 dark:text-red-500 flex items-center justify-start">
              <span className="font-medium">{error}</span>
            </p>
          )}
        </div>
        <Button
          className="w-full justify-center"
          onClick={async () => {
            function isUserNameValid(username: string) {
              /* 
                Usernames can only have: 
                - Lowercase Letters (a-z) 
                - Numbers (0-9)
                - Dots (.)
                - Underscores (_)
              */
              const res = /^[a-z0-9_\.]+$/.exec(username);
              const valid = !!res;
              if (!valid) setError("Error: Please enter a valid username.");
              return valid;
            }
            // check validation of username && avatar and update them
            if (user && file && name && isUserNameValid(name)) {
              try {
                setDisabled(true);
                if (file.size / 5242880 > 1) {
                  setError(
                    "Error: File too large. Maximum file size limit exceeded."
                  );
                  return;
                }
                setUsername(name);
                setAvatar(previewImage);
                await axios.post(
                  `http://localhost:3000/api/users/${user.id}`,
                  {
                    data: user,
                  },
                  {
                    withCredentials: true,
                  }
                );
                console.log(user);
                setError("");
                setDisabled(false);
              } catch (error) {
                setDisabled(false);
                console.log(error);
              }
            } else if (!file) {
              setError("Error: Please select an image.");
            } else if (!name) {
              setError("Error: Please enter a username.");
            }
          }}
        >
          Continue
          <VscDebugContinueSmall />
        </Button>
      </Card>
    </div>
  );
};

export default Updateusername;
