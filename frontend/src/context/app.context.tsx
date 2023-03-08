import axios from "axios";
import React, { useEffect, useState } from "react";
import { User } from "../interfaces/user";

export interface IAppContext {
  user: User | undefined;
  setUser: (user: User) => void;
  logout: () => void;
  setUsername: (username: string) => void;
  setAvatar: (avatar: string) => void;
  loading: boolean;
}

export const AppContext = React.createContext<IAppContext>({
  user: undefined,
  setUser: (user: User) => {},
  logout: () => {},
  setUsername: () => {},
  setAvatar: () => {},
  loading: true,
});

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const logout = () => {
    setUser(undefined);
  };

  const setUsername = (username: string) => {
    setUser((prevUser) => {
      if (prevUser) {
        return { ...prevUser, username };
      } else {
        return undefined;
      }
    });
  };

  const setAvatar = (avatar: string) => {
    setUser((prevUser) => {
      if (prevUser) {
        return { ...prevUser, avatar };
      } else {
        return undefined;
      }
    });
  };

  const fetchUser = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/auth/42/", {
        withCredentials: true,
      });
      if (response.data) {
        setUser(response.data);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const appContextValue: IAppContext = {
    user: user,
    setUser,
    logout,
    setUsername,
    setAvatar,
    loading,
  };

  return (
    <AppContext.Provider value={appContextValue}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
