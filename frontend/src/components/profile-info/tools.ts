import axios from "axios";
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

export { addFriend, cancelFriend, acceptFriend };
