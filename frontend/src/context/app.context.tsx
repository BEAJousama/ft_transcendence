"use client";

import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import IUser from "@/interfaces/user";

export interface IAppContext {
  user: IUser | undefined;
  loading: boolean;
  authenticated: boolean;
  fetchUser: () => Promise<void>;
  updateUser: () => Promise<void>;
}

export const AppContext = React.createContext<IAppContext>({
  user: undefined,
  loading: true,
  authenticated: false,
  fetchUser: async () => { },
  updateUser: async () => { },
});

export const fetcher = async (url: string) => {
  const accessToken = window.localStorage.getItem("access_token"); // Replace with your actual access token
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_BACK_END_URL}${url}`,
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
      // const { data } = useSWR("api/auth/42", fetcher, { refreshInterval: 1000 });
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
    // const id = setInterval(async () => {
    //   await updateUser();
    // }, 1000);
    return () => {
      // clearInterval(id);
      window.removeEventListener("storage", handleLocalStorageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUser]);

  const appContextValue: IAppContext = {
    user: data,
    loading: isLoading,
    authenticated: isAuthenticated,
    fetchUser,
    updateUser,
  };


  return (
    <AppContext.Provider value={appContextValue}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
