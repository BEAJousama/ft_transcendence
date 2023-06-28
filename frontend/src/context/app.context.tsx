import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import IUser from "../interfaces/user";

export interface IAppContext {
  users: IUser[];
  setUser: (user: IUser) => void;
  setUsers: (users: IUser[]) => void;
  user: IUser | undefined;
  loading: boolean;
  authenticated: boolean;
  fetchUser: () => Promise<void>;
  updateUser: () => Promise<void>;
}

export const AppContext = React.createContext<IAppContext>({
  user: undefined,
  users: [],
  setUser: (user: IUser) => { },
  setUsers: (users: IUser[]) => { },
  loading: true,
  authenticated: false,
  fetchUser: async () => {
  },
  updateUser: async () => { }
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
  const [users, setUsers] = useState<IUser[]>([]);

  const fetchUsers = useCallback(async () => {
    // const accessToken = window.localStorage.getItem("access_token");
    // fetch("http://localhost:3000/api/users", {
    //   method: 'GET',
    //   headers: {
    //     'Authorization': `Bearer ${accessToken}`, // notice the Bearer before your token
    //   }
    // })
    //   .then((res) => res.json())
    //   .then((data) => {
    //     setUsers(data);
    //   }
    //   );
    const data = await fetcher("api/users");
    setUsers(data);
  }, []);


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
    fetchUsers();
    fetchUser();
    const handleLocalStorageChange = async () => {
      await updateUser();
    };
    window.addEventListener("storage", handleLocalStorageChange);
    return () => {
      window.removeEventListener("storage", handleLocalStorageChange);
    };
  }, [fetchUser]);

  const appContextValue: IAppContext = {
    users: users,
    setUsers,
    user: data,
    loading: isLoading,
    authenticated: isAuthenticated,
    fetchUser,
    updateUser,
    setUser: function (user: IUser): void {
      throw new Error("Function not implemented.");
    },

  };


  return (
    <AppContext.Provider value={appContextValue}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
