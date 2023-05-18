import { Button, Card, Input } from "./../../components";
import { useRef, useState } from "react";

const TwoFactorAuth = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const inputsRef = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleInputChange = (index: number, value: string) => {
    setCode((prev) => {
      const newCode = prev.slice(0, index) + "" + prev.slice(index + 1);
      return newCode;
    });
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
    <div className="bg-secondary-800 flex h-screen w-screen flex-col items-center justify-center gap-5 text-gray-200">
      <h1 className="text-xl lg:text-3xl">Welcome Back</h1>
      <p className="lg:text-md text-sm">Verify the Authentication Code</p>
      <Card className="bg-secondary-500 shadow-secondary-500 mx-4 flex max-w-xs flex-col  items-center  justify-center gap-4 border-none shadow-lg sm:mx-0 lg:max-w-sm">
        <h1 className="text-center text-xl lg:text-3xl">
          Tow-Factor Authentication
        </h1>
        <p className="text-sx text-center lg:text-sm">
          Open the two-step verification app on your mobile device to get your
          verification code .
        </p>
        <div
          className="flex gap-1 md:gap-2"
          onPaste={(event) => {
            event.preventDefault();
            const pastedData = event.clipboardData.getData("Text");
            setCode(pastedData);
          }}
        >
          <Input
            isError={error ? true : false}
            className="text-center"
            MaxLength={1}
            inputRef={inputsRef[0]}
            onChange={(e) => {
              handleInputChange(0, e.target.value);
            }}
            value={code[0] || ""}
          />
          <Input
            isError={error ? true : false}
            className="text-center"
            MaxLength={1}
            inputRef={inputsRef[1]}
            onChange={(e) => {
              handleInputChange(1, e.target.value);
            }}
            value={code[1] || ""}
          />
          <Input
            isError={error ? true : false}
            className="text-center"
            MaxLength={1}
            inputRef={inputsRef[2]}
            onChange={(e) => {
              handleInputChange(2, e.target.value);
            }}
            value={code[2] || ""}
          />
          <Input
            isError={error ? true : false}
            className="text-center"
            MaxLength={1}
            inputRef={inputsRef[3]}
            onChange={(e) => {
              handleInputChange(3, e.target.value);
            }}
            value={code[3] || ""}
          />
          <Input
            isError={error ? true : false}
            className="text-center"
            MaxLength={1}
            inputRef={inputsRef[4]}
            onChange={(e) => {
              handleInputChange(4, e.target.value);
            }}
            value={code[4] || ""}
          />
          <Input
            isError={error ? true : false}
            className="text-center"
            MaxLength={1}
            inputRef={inputsRef[5]}
            onChange={(e) => {
              handleInputChange(5, e.target.value);
            }}
            value={code[5] || ""}
          />
        </div>
        <Button
          className="w-full justify-center"
          onClick={async () => {
            // let history = useHistory();
            const res = await fetch(
              "http://localhost:3000/api/auth/2fa/verify",
              {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ code }),
              }
            );
            const data = await res.json();
            if (data.isvalid) {
              (async () => {
                const res = await fetch("http://localhost:3000/api/auth/42/", {
                  method: "GET",
                  credentials: "include",
                  headers: {
                    "Content-Type": "application/json",
                  },
                });
                const data = await res.json();
                console.log(data);
              })();
            } else {
              setError("Invalid Code");
            }
          }}
        >
          Authenticate
        </Button>
        <Button variant="text" className="w-full justify-center">
          Back to basic login
        </Button>
      </Card>
    </div>
  );
};

export default TwoFactorAuth;
