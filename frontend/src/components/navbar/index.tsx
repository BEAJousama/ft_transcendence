import Avatar from "../avatar";
import Input from "../input";
import { IoIosNotifications } from "react-icons/io";
import { BsFillChatFill } from "react-icons/bs";
import Button from "../button";

const Navbar = () => {
  return (
    <nav className="bg-white border-gray-200 px-2 sm:px-4 py-2.5 rounded dark:bg-gray-900">
      <div className="container flex flex-wrap items-center justify-between mx-auto">
        <a href="https://flowbite.com/" className="flex items-center">
          <img src="/img/logo.jpeg" className="h-6 mr-3 sm:h-9" alt="" />
          <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
            Pong
          </span>
        </a>
        <div className="w-2/4">
          <Input
            htmlType="text"
            className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search..."
          />
        </div>
        <div className="flex item-center justify-center gap-2">
          <Button
            variant="text"
            className=" bg-inherit text-white hover:bg-inherit"
          >
            <BsFillChatFill />
          </Button>
          <Button
            variant="text"
            className=" bg-inherit text-white hover:bg-inherit text-lg"
          >
            <IoIosNotifications />
          </Button>
          <Avatar src="https://github.com/Hicham-BelHoucin.png" alt="" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
