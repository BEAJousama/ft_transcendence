import axios from "axios";
import { Button, Card, Input } from "./../../components";
import { useRef, useState } from "react";
import { Navigate } from "react-router-dom";

const TwoFactorAuth = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [shouldRedirect, setShouldRedirect] = useState<boolean>(false);

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

  if (shouldRedirect) return <Navigate to="/" />;

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-5 bg-secondary-800 text-gray-200">
      <h1 className="text-xl lg:text-3xl">Welcome Back</h1>
      <p className="lg:text-md text-sm">Verify the Authentication Code</p>
      <Card className="mx-4 flex max-w-xs flex-col items-center justify-center  gap-4  border-none bg-secondary-500 shadow-lg shadow-secondary-500 sm:mx-0 lg:max-w-sm">
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
        {error && (
          <p className="w-full pl-4 text-left text-xs font-medium text-red-600 dark:text-red-500">
            {error}
          </p>
        )}
        <Button
          className="w-full justify-center"
          onClick={async () => {
            try {
              const accessToken =
                window.localStorage.getItem("2fa_access_token");
              const response = await axios.post(
                `${process.env.REACT_APP_BACK_END_URL}api/auth/2fa/verify`,
                { code },
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              );

              if (response.data) {
                window.localStorage.setItem(
                  "access_token",
                  response.data.access_token
                );
                // await fetchUser();
                setShouldRedirect(true);
              }
              setError("Invalid Code");
            } catch (error) {
              setError("Invalid Code");
            }
          }}
        >
          Authenticate
        </Button>

        <Button
          variant="text"
          className="w-full justify-center"
          onClick={() => {
            setCode("");
            setError("");
            inputsRef[0].current?.focus();
          }}
        >
          Reset
        </Button>
      </Card>
    </div>
  );
};

export default TwoFactorAuth;
