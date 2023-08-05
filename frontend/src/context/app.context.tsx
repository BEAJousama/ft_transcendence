"use client";

import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import IUser from "@/interfaces/user";
import { Spinner } from "@/components";
import { redirect, usePathname } from "next/navigation";

export interface IAppContext {
	user: IUser | undefined;
	loading: boolean;
	authenticated: boolean;
	setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
	fetchUser: () => Promise<void>;
	updateUser: () => Promise<void>;
}

export const AppContext = React.createContext<IAppContext>({
	user: undefined,
	loading: true,
	authenticated: false,
	setAuthenticated: () => { },
	fetchUser: async () => { },
	updateUser: async () => { },
});

export const fetcher = async (url: string) => {
	const response = await axios.get(`${process.env.NEXT_PUBLIC_BACK_END_URL}${url}`, {
		withCredentials: true,
	});
	return response.data;
};

const AppProvider = ({ children }: { children: React.ReactNode }) => {
	const [data, setData] = useState<IUser | undefined>(undefined);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	const getCookieItem = (key: string): string | undefined => {
		const cookieString = document.cookie;
		const cookiesArray = cookieString.split("; ");

		for (const cookie of cookiesArray) {
			const [cookieKey, cookieValue] = cookie.split("=");
			if (cookieKey === key) {
				return decodeURIComponent(cookieValue);
			}
		}

		return undefined;
	};

	const fetchUser = useCallback(async () => {
		if (isAuthenticated) return;
		try {
			setIsLoading(true);
			const data = await fetcher("api/auth/42");
			if (data) {
				setData(data);
				if (getCookieItem("access_token")) {
					setIsAuthenticated(true);
				}
			}
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
			setIsAuthenticated(false);
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

	const path = usePathname();

	// console.log(path)

	if (!isAuthenticated && path !== "/") redirect("/");

	// if (isLoading && path !== "/")

	//   return <Spinner />;

	// if (isAuthenticated && path === "/")
	// 	redirect("/home");

	const appContextValue: IAppContext = {
		user: data,
		loading: isLoading,
		authenticated: isAuthenticated,
		setAuthenticated: setIsAuthenticated,
		fetchUser,
		updateUser,
	};

	return <AppContext.Provider value={appContextValue}>{children}</AppContext.Provider>;
};

export default AppProvider;
