import { Card, Button } from "./../../components";

// max-w-lg
export default function Login() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-secondary-700 ">
      <Card className="flex max-w-xs flex-col items-center justify-center gap-8 border-none bg-secondary-500 p-16 shadow-lg shadow-secondary-500 lg:max-w-lg lg:gap-16 lg:p-24">
        <div className="m-4">
          <img src="/img/logo.png" alt="logo" />
        </div>
        <div className="m-2 lg:m-0">
          <Button className=" justify-center text-xs lg:text-lg">
            <img src="/img/42logo.svg" alt="logo" width={30} />
            <a
              className="text-black"
              href="http://127.0.0.1:3000/api/auth/42/callback"
            >
              Login with Intra
            </a>
          </Button>
        </div>
      </Card>
    </div>
  );
}
