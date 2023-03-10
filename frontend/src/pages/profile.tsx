import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components";
import { User } from "../interfaces/user";

const Profile = () => {
  const [users, setUsers] = useState<User[]>([]);
  const fetchUsers = async () => {
    const response = await axios.get("http://localhost:3000/api/users/", {
      withCredentials: true,
    });
    if (response.data) {
      setUsers(response.data);
      console.log(response.data);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="flex items-center justify-center flex-col gap-4">
        {users ? (
          <>
            {users.map((item, i) => {
              if (item.login !== "hbel-hou") {
                return (
                  <div key={i}>
                    <Button>
                      <Link to={`/users/${item.id}`}>{item.username}</Link>
                    </Button>
                  </div>
                );
              }
            })}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Profile;
