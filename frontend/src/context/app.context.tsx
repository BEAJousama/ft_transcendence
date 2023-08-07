"use client";

import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import IUser from "@/interfaces/user";
import { FourOFour, Spinner } from "@/components";
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
	try {
		const response = await axios.get(`${process.env.NEXT_PUBLIC_BACK_END_URL}${url}`, {
			withCredentials: true,
		});
		return response.data;
	}
	catch (error) {
		throw error;
	}
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
			if (!isAuthenticated) return;
			const user = await fetcher("api/auth/42");
			if (data && data !== user) {
				setData(data);
			}
		} catch (error) {
			setIsAuthenticated(false);
		}
	}, []);

	useEffect(() => {
		fetchUser();
		const id = setInterval(async () => {
			await updateUser();
		}, 500);
		return () => {
			clearInterval(id);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetchUser]);

	const path = usePathname();

	// if (isLoading) return <Spinner />;

	if (!isAuthenticated && !isLoading && path !== "/")
		redirect("/");

	const appContextValue: IAppContext = {
		user: data,
		loading: isLoading,
		authenticated: isAuthenticated,
		setAuthenticated: setIsAuthenticated,
		fetchUser,
		updateUser,
	};

	// try {
	// 	localStorage.getItem('access_token')
	// }
	// catch (e) {
	// 	return <FourOFour show={false} />
	// }



	return <AppContext.Provider value={appContextValue}>{children}</AppContext.Provider>;
};

export default AppProvider;
