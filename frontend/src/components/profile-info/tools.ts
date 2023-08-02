import axios from "axios";

const addFriend = async (senderId: number, receiverId: number) => {
  try {
    const accessToken = window.localStorage?.getItem("access_token");
    await axios.post(
      `${process.env.REACT_APP_BACK_END_URL}api/users/add-friend`,
      {
        senderId: senderId,
        receiverId: receiverId,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return "Friend Added Successfully";
  } catch (e) {
    return "Could Not Add Friend";
  }
};

const acceptFriend = async (id: number) => {
  try {
    const accessToken = window.localStorage?.getItem("access_token");
    await axios.get(
      `${process.env.REACT_APP_BACK_END_URL}api/users/accept-friend/${id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return "Friend Accepted Successfully";
  } catch (e) {
    return "Could Not Accept Friend";
  }
};

const cancelFriend = async (id: number) => {
  try {
    const accessToken = window.localStorage?.getItem("access_token");
   await axios.delete(
      `${process.env.REACT_APP_BACK_END_URL}api/users/remove-friend/${id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return "Friend Request Canceled Successfully";
  } catch (e) {
    return "Could Not Cancel Friend Request";
  }
};

export { addFriend, cancelFriend, acceptFriend };
