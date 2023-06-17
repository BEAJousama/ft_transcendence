import axios from "axios";
import React, { useEffect, useState } from "react";
import IUser from "../interfaces/user";
import useSWR, { KeyedMutator, mutate, mutate as swrMutate } from "swr"

export interface IAppContext {
  // user: User | undefined;
  users: IUser[];
  setUser: (user: IUser) => void;
  setUsers: (users: IUser[]) => void;
  logout: () => void;
  login: () => void;
  setUsername: (username: string) => void;
  setAvatar: (avatar: string) => void;
  setAuthenticated: (avatar: boolean) => void;
  setTwoFactorAuth: (avatar: boolean) => void;
  user: IUser | undefined;
  loading: boolean;
  authenticated: boolean,
  fetchUser: () => Promise<void>
  updateUser: () => Promise<void>
}

export const AppContext = React.createContext<IAppContext>({
  user: undefined,
  users: [],
  setUser: (user: IUser) => { },
  setUsers: (users: IUser[]) => { },
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
}

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<IUser | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [users, setUsers] = useState<IUser[]>([]);
  const [twoFactorAuth, setTwoFactorAuth] = useState<boolean>(false);

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
  const fetchUsers = async () => {
    const accessToken = window.localStorage.getItem("access_token");
    fetch("http://10.11.7.15:3000/api/users", {
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${accessToken}`, // notice the Bearer before your token
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
      }
    );
  };


  const fetchUser = async () => {

    if (isAuthenticated) return
    try {
      setIsLoading(true)
      const data = await fetcher('api/auth/42');
      setIsAuthenticated(true)
      setData(data);
    } catch (error) {
      setIsAuthenticated(false)
      // setIsLoading(false)
    }
    setIsLoading(false)
  }

  const updateUser = async () => {
    try {
      const data = await fetcher('api/auth/42');
      setData(data);
    } catch (error) { }
  }

  useEffect(() => {
    fetchUsers();
    fetchUser();
    const handleLocalStorageChange = async () => {
      await fetchUser()
    };
    window.addEventListener('storage', handleLocalStorageChange);
    return () => {
      window.removeEventListener('storage', handleLocalStorageChange);
    };

  }, [])

  const appContextValue: IAppContext = {
    users: users,
    setUsers,
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
