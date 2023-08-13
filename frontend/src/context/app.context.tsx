"use client";

import axios from "axios";
import React from "react";
import IUser from "@/interfaces/user";
import { redirect, usePathname, useRouter } from "next/navigation";
import useSwr from "swr";

export interface IAppContext {
	user: IUser | undefined;
	loading: boolean;
	authenticated: boolean;
	setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
	fetchUser: () => Promise<void>;
	updateUser: () => Promise<void>;
}

export const getCookieItem = (key: string): string | undefined => {
	if (typeof document === "undefined") return undefined;
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

export const setCookieItem = (
	key: string,
	value: string,
	expiration: number | Date = 1,
	path = "/"
) => {
	if (typeof expiration === "number") {
		expiration = new Date(new Date().getTime() + expiration * 1000 * 60 * 60 * 24);
	}
	document.cookie = `${key}=${encodeURIComponent(
		value
	)};expires=${expiration.toUTCString()};path=${path}`;
};

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
	} catch (error) {
		throw error;
	}
};

const AppProvider = ({ children }: { children: React.ReactNode }) => {
	const {
		data,
		isLoading: loading,
		mutate,
	} = useSwr("api/auth/42", fetcher, {
		revalidateOnFocus: false,
		revalidateOnReconnect: false,
		refreshInterval: 0,
		refreshWhenHidden: false,
		refreshWhenOffline: false,
		shouldRetryOnError: false,
	});
	const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
	const [isLoading, setIsLoading] = React.useState<boolean>(true);
	const [prevAccessToken, setPrevAccessToken] = React.useState<string | undefined>(undefined);
	const router = useRouter();

	const path = usePathname();

	React.useEffect(() => {
		if (loading) return;
		if (data) {
			const accessToken = getCookieItem("access_token");
			setPrevAccessToken(accessToken);
			setIsAuthenticated(true);
		} else {
			setIsAuthenticated(false);
		}
		setIsLoading(false);
	}, [data, loading]);

	React.useEffect(() => {
		if (isLoading) return;
		const id = setInterval(async () => {
			const accessToken = getCookieItem("access_token");
			if (accessToken !== prevAccessToken && isAuthenticated) {
				setPrevAccessToken(accessToken);
				setIsAuthenticated(false);
				router.push("/");
			}
		}, 500);
		return () => clearInterval(id);
	}, [isLoading]);

	if (isLoading) {
		return (
			<AppContext.Provider
				value={{
					user: undefined,
					loading: false,
					authenticated: false,
					setAuthenticated: () => { },
					fetchUser: async () => { },
					updateUser: async () => { },
				}}
			>
				<body />
			</AppContext.Provider>
		);
	}

	if (!isAuthenticated && !isLoading && path !== "/") redirect("/");

	if (isAuthenticated && !isLoading && path === "/" && data.updatedAt !== data.createdAt) {
		redirect("/home");
	}

	const appContextValue: IAppContext = {
		user: data,
		loading: isLoading,
		authenticated: isAuthenticated,
		setAuthenticated: setIsAuthenticated,
		fetchUser: mutate,
		updateUser: mutate,
	};

	return <AppContext.Provider value={appContextValue}>{children}</AppContext.Provider>;
};

export default AppProvider;
