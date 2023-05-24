import axios from "axios";
import React, { useEffect, useState } from "react";



export type User = {
  id: number
  login: string
  username: string
  email: string
  fullname: string
  country: string
  phone: string
  avatar: string
  twoFactorAuth: boolean
  tfaSecret: string
  status: string
  ladder: string
  rating: number
  createdAt: Date
  updatedAt: Date
  wins: number
  losses: number
}

export interface IAppContext {
  user: User | undefined;
  setUser: (user: User) => void;
  logout: () => void;
  login: () => void;
  setUsername: (username: string) => void;
  setAvatar: (avatar: string) => void;
  setAuthenticated: (avatar: boolean) => void;
  setTwoFactorAuth: (avatar: boolean) => void;
  loading: boolean;
  authenticated: boolean;
  fetchUser: () => void;
  twoFactorAuth: boolean;
}

export const AppContext = React.createContext<IAppContext>({
  user: undefined,
  setUser: (user: User) => {},
  logout: () => {},
  login: () => {},
  setUsername: () => {},
  setAvatar: () => {},
  setAuthenticated: () => {},
  loading: true,
  authenticated: false,
  fetchUser: () => {},
  setTwoFactorAuth: () => {},
  twoFactorAuth: false,
});

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState<boolean>(false);

  const logout = () => {
    setUser(undefined);
  };

  const login = () => {};

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
      const accessToken = window.localStorage.getItem("access_token"); // Replace with your actual access token
      const response = await axios.get(
        `${process.env.REACT_APP_BACK_END_URL}api/auth/42/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.data) {
        setAuthenticated(true);
        setUser(response.data);
        setTwoFactorAuth(response.data.twoFactorAuth);
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
    login,
    setUsername,
    setAvatar,
    loading,
    authenticated,
    setAuthenticated,
    fetchUser,
    setTwoFactorAuth,
    twoFactorAuth,
  };

  return (
    <AppContext.Provider value={appContextValue}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
