import { useState } from "react";
import Avatar from "../avatar";
import Button from "../button";
import Card from "../card";
import Input from "../input";
import { VscDebugContinueSmall } from "react-icons/vsc";
import Divider from "../divider";

const Uploadfile = () => {
  return (
    <div className="w-scrren h-screen flex items-center justify-center">
      <Card className="flex items-center justify-center flex-col gap-8">
        <div className="px-7 sm:px-9">
          <Avatar
            // dont forget to change to user's avatar
            src={
              "https://cdn.intra.42.fr/users/8e7af2a91845505e640b0f4362f6319d/hbel-hou.jpg"
            }
            alt=""
            className="w-28 h-28 sm:w-40 sm:h-40  md:w-60 md:h-60"
          />
        </div>
        <Divider />
        <Input label="username :" placeholder="Enter a username" />
        <Button
          className="w-full justify-center"
          onClick={() => {
            // check validation of username and update it
          }}
        >
          Continue
          <VscDebugContinueSmall />
        </Button>
      </Card>
    </div>
  );
};

export default Uploadfile;
