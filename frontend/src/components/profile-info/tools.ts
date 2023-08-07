import { AppContext } from "@/context/app.context";
import { IBlock } from "@/interfaces/user";
import axios from "axios";
import { useContext } from "react";
import { toast } from "react-toastify";

const addFriend = async (senderId: number, receiverId: number) => {
  try {
    await axios.post(
      `${process.env.NEXT_PUBLIC_BACK_END_URL}api/users/add-friend`,
      {
        senderId: senderId,
        receiverId: receiverId,
      },
      {
        withCredentials: true,
      }
    );
    toast.success("Friend Added Successfully");
  } catch (e) {
    toast.error("Could Not Add Friend");
  }
};

const acceptFriend = async (id: number) => {
  try {
    await axios.get(
      `${process.env.NEXT_PUBLIC_BACK_END_URL}api/users/accept-friend/${id}`,
      {
        withCredentials: true,
      }
    );
    toast.success("Friend Accepted Successfully");
  } catch (e) {
    toast.error("Could Not Accept Friend");
  }
};

const cancelFriend = async (id: number) => {
  try {
    await axios.delete(
      `${process.env.NEXT_PUBLIC_BACK_END_URL}api/users/remove-friend/${id}`,
      {
        withCredentials: true,
      }
    );
    toast.success("Friend Request Canceled Successfully");
  } catch (e) {
    toast.error("Could Not Cancel Friend Request");
  }
};

const BlockUser = async (blockerId: number, blockingId: number) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACK_END_URL}api/users/block-user`,
      {
        blockerId: blockerId,
        blockingId: blockingId,
      },
      {
        withCredentials: true,
      }
    );
    if (response) {
      toast.success("Friend blocked Successfully");
    }
  } catch (e) {
    toast.error("Could Not Block Friend ");
  }
};

const UnBlockUser = async (blockerId: number, blockingId: number) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACK_END_URL}api/users/block-user`,
      {
        blockerId: blockerId,
        blockingId: blockingId,
      },
      {
        withCredentials: true,
      }
    );
    if (response) {
      toast.success("Friend Unblocked Successfully");
    }
  } catch (e) {
    toast.error("Could Not Unblock Friend ");
  }
};

const isBlocked = (id: number) => {
  const { user } = useContext(AppContext);
  if (user) {
    const { blocking } = user;
    const res = blocking.map((block: IBlock) => {
      if (block.blockingId === id) {
        return true;
      }
      return false;
    });
    return res.includes(true);
  }
  return false;
};

export {
  addFriend,
  cancelFriend,
  acceptFriend,
  BlockUser,
  UnBlockUser,
  isBlocked,
};
