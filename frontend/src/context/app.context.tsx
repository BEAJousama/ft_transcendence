import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import IUser from "../interfaces/user";

export interface IAppContext {
  // user: User | undefined;
  setUser: (user: IUser) => void;
  logout: () => void;
  login: () => void;
  setUsername: (username: string) => void;
  setAvatar: (avatar: string) => void;
  setAuthenticated: (avatar: boolean) => void;
  setTwoFactorAuth: (avatar: boolean) => void;
  user: IUser | undefined;
  loading: boolean;
  authenticated: boolean;
  fetchUser: () => Promise<void>;
  updateUser: () => Promise<void>;
}

export const AppContext = React.createContext<IAppContext>({
  user: undefined,
  setUser: (user: IUser) => { },
  logout: () => { },
  login: () => { },
  setUsername: () => { },
  setAvatar: () => { },
  setAuthenticated: () => { },
  loading: true,
  authenticated: false,
  fetchUser: async () => {
    // updateUser: async () => {};
  },
  setTwoFactorAuth: function (avatar: boolean): void {
    throw new Error("Function not implemented.");
  },
  updateUser: function (): Promise<void> {
    throw new Error("Function not implemented.");
  }
});

export const fetcher = async (url: string) => {
  const accessToken = window.localStorage.getItem("access_token"); // Replace with your actual access token
  const response = await axios.get(
    `${process.env.REACT_APP_BACK_END_URL}${url}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data;
};

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<IUser | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const logout = () => {
    setData(undefined);
  };

  const login = () => {};

  const setUsername = (username: string) => {
    setData((prevUser) => {
      if (prevUser) {
        return { ...prevUser, username };
      } else {
        return undefined;
      }
    });
  };

  const setAvatar = (avatar: string) => {
    setData((prevUser) => {
      if (prevUser) {
        return { ...prevUser, avatar };
      } else {
        return undefined;
      }
    });
  };



  const fetchUser = useCallback(async () => {
    if (isAuthenticated) return;
    try {
      setIsLoading(true);
      const data = await fetcher("api/auth/42");
      if (data)
        setIsAuthenticated(true);
      setData(data);
    } catch (error) {
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, [isAuthenticated]);

  const updateUser = useCallback(async () => {
    try {
      const data = await fetcher("api/auth/42");
      setData(data);
    } catch (error) {
      setIsAuthenticated(false)
    }
  }, []);

  useEffect(() => {
    fetchUser();
    const handleLocalStorageChange = async () => {
      await updateUser();
    };
    window.addEventListener("storage", handleLocalStorageChange);
    return () => {
      window.removeEventListener("storage", handleLocalStorageChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUser]);

  const appContextValue: IAppContext = {
    logout,
    login,
    setUsername,
    setAvatar,
    user: data,
    loading: isLoading,
    authenticated: isAuthenticated,
    fetchUser,
    updateUser,
    setUser: function (user: IUser): void {
      throw new Error("Function not implemented.");
    },
    setAuthenticated: function (avatar: boolean): void {
      throw new Error("Function not implemented.");
    },
    setTwoFactorAuth: function (avatar: boolean): void {
      throw new Error("Function not implemented.");
    }
  };


  return (
    <AppContext.Provider value={appContextValue}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
