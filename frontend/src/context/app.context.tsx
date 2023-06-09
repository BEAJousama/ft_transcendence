import axios from "axios";
import React, { useEffect, useState } from "react";
import IUser from "../interfaces/user";
import useSWR, { KeyedMutator, mutate, mutate as swrMutate } from "swr"

export interface IAppContext {
<<<<<<< HEAD
  user: User | undefined;
  users: User[];
  setUser: (user: User) => void;
  setUsers: (users: User[]) => void;
  logout: () => void;
  login: () => void;
  setUsername: (username: string) => void;
  setAvatar: (avatar: string) => void;
  setAuthenticated: (avatar: boolean) => void;
  setTwoFactorAuth: (avatar: boolean) => void;
=======
  user: IUser | undefined;
>>>>>>> d388a1ae471b8f463509911435d87705eaeb3f3f
  loading: boolean;
  authenticated: boolean,
  fetchUser: () => Promise<void>
  updateUser: () => Promise<void>
}

export const AppContext = React.createContext<IAppContext>({
  user: undefined,
<<<<<<< HEAD
  users: [],
  setUser: (user: User) => {},
  setUsers: (users: User[]) => {},
  logout: () => {},
  login: () => {},
  setUsername: () => {},
  setAvatar: () => {},
  setAuthenticated: () => {},
=======
>>>>>>> d388a1ae471b8f463509911435d87705eaeb3f3f
  loading: true,
  authenticated: false,
  fetchUser: async () => { },
  updateUser: async () => { }
});

<<<<<<< HEAD
const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [users, setUsers] = useState<User[]>([]);
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
  const fetchUsers = async () => {
    const accessToken = window.localStorage.getItem("access_token");
    fetch("http://localhost:3000/api/users", {
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
=======
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
>>>>>>> d388a1ae471b8f463509911435d87705eaeb3f3f

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
<<<<<<< HEAD
    user: user,
    users: users,
    setUsers,
    setUser,
    logout,
    login,
    setUsername,
    setAvatar,
    loading,
    authenticated,
    setAuthenticated,
=======
    user: data,
    loading: isLoading,
    authenticated: isAuthenticated,
>>>>>>> d388a1ae471b8f463509911435d87705eaeb3f3f
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
