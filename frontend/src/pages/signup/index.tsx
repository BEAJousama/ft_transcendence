import { Avatar, Card, Button, Input } from "./../../components";
import { useState } from "react";
import { MdOutlineModeEdit } from "react-icons/md";
import { useRef } from "react";

export default function SignUp() {
  const ref = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<Blob>();
  const [previewImage, setPreviewImage] = useState<string>(
    "https://github.com/Hicham-BelHoucin.png"
  );
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
          <Input label="User Name" value="hbel-hou" />
          <Input label="Full Name" disabled value="hicham belhoucin" />
          <Input label="Phone number" value="0676891512" />
          <Input label="Email" value="hicham.belhoucin@gmail.com" />
        </div>
        <div className="flex w-full items-center justify-center gap-8">
          <Button
            className="w-full justify-center"
            type="success"
            onClick={() => {
              console.log("submit");
            }}
          >
            Submit
          </Button>
          <Button
            className="w-full justify-center"
            type="danger"
            onClick={() => {
              setPreviewImage("https://github.com/Hicham-BelHoucin.png");
              // setError("");
              setFile(undefined);
            }}
          >
            Reset
          </Button>
        </div>
      </Card>
    </div>
  );
}
