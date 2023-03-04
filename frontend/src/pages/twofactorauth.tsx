import { useState, useRef, useContext } from "react";
import { Navigate } from "react-router-dom";
import { Button, Card, Input } from "../components";
import { AppContext } from "../context";

const TwoFactorAuth = () => {
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const { setUser } = useContext(AppContext);
  const inputsRef = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  if (shouldRedirect) {
    return <Navigate to="/" />;
  }

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
    <div className="h-screen w-screen flex items-center justify-center flex-col gap-5 bg-gray-200">
      <h1 className=" text-3xl">Welcome Back</h1>
      <p className="text-md">Verify the Authentication Code</p>
      <Card className="flex items-center justify-center flex-col gap-5">
        <h1 className="text-3xl text-center">Tow-Factor Authentication</h1>
        <p className="text-sm text-center">
          Open the two-step verification app on your mobile device to get your
          verification code .
        </p>
        <div
          className="flex gap-2"
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
                setUser && setUser(data);
                console.log(data);
                setShouldRedirect(true);
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
