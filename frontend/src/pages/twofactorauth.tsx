import { useState, useRef } from "react";
import { Button, Card, Input } from "../components";

const TwoFactorAuth = () => {
  const [code, setCode] = useState("");
  const inputsRef = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleInputChange = (index: number, value: string) => {
    if (value.length === 1) {
      setCode((prev) => {
        const newCode = prev.slice(0, index) + value + prev.slice(index + 1);
        return newCode;
      });
      if (inputsRef && inputsRef[index + 1]) {
        inputsRef[index + 1].current?.focus();
      }
    }
  };
  return (
    <div className="h-screen w-screen flex items-center justify-center flex-col gap-5 bg-gray-200">
      <h1 className=" text-3xl">Welcome Back</h1>
      <p className="text-md">Verify the Authentication Code</p>
      <Card className="flex items-center justify-center flex-col gap-5">
        <h1 className="text-3xl text-center">Tow-Factor Authentication</h1>
        <p className="text-sm text-center">
          Open the two-step verification app on your mobile device to get your
          verification code .
        </p>
        <div className="flex gap-2">
          <Input
            className="text-center"
            MaxLength={1}
            inputRef={inputsRef[0]}
            onChange={(e) => {
              handleInputChange(0, e.target.value);
            }}
            value={code[0] || ""}
          />
          <Input
            className="text-center"
            MaxLength={1}
            inputRef={inputsRef[1]}
            onChange={(e) => {
              handleInputChange(1, e.target.value);
            }}
            value={code[1] || ""}
          />
          <Input
            className="text-center"
            MaxLength={1}
            inputRef={inputsRef[2]}
            onChange={(e) => {
              handleInputChange(2, e.target.value);
            }}
            value={code[2] || ""}
          />
          <Input
            className="text-center"
            MaxLength={1}
            inputRef={inputsRef[3]}
            onChange={(e) => {
              handleInputChange(3, e.target.value);
            }}
            value={code[3] || ""}
          />
          <Input
            className="text-center"
            MaxLength={1}
            inputRef={inputsRef[4]}
            onChange={(e) => {
              handleInputChange(4, e.target.value);
            }}
            value={code[4] || ""}
          />
          <Input
            className="text-center"
            MaxLength={1}
            inputRef={inputsRef[5]}
            onChange={(e) => {
              handleInputChange(5, e.target.value);
            }}
            value={code[5] || ""}
          />
        </div>
        <Button className="w-full justify-center">Authenticate</Button>
        <Button variant="text" className="w-full justify-center">
          Back to basic login
        </Button>
      </Card>
    </div>
  );
};

export default TwoFactorAuth;
