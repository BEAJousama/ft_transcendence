"use client";

import axios from "axios";
import React from "react";
import IUser from "@/interfaces/user";
import { redirect, usePathname } from "next/navigation";

export interface IAppContext {
	user: IUser | undefined;
	loading: boolean;
	authenticated: boolean;
	setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
	updateUser: () => Promise<IUser | undefined>;
	updateAccessToken: () => void;
	checkConnection: () => void;
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

export const deleteCookieItem = (key: string, path = "/") => {
	document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=${path}`;
};

// Clears the session on both the frontend host and the API host (older
// backends set cookies there, which silently re-authenticated users).
export const logout = async () => {
	["access_token", "2fa_access_token", "complete_info"].forEach((key) => deleteCookieItem(key));
	try {
		await axios.post(`${process.env.BACK_END_URL}api/auth/logout`, {}, { withCredentials: true });
	} catch (_) {}
	window.location.replace("/");
};

axios.interceptors.request.use((config) => {
	const token = getCookieItem("access_token") || getCookieItem("2fa_access_token");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

export const AppContext = React.createContext<IAppContext>({
	user: undefined,
	loading: true,
	authenticated: false,
	setAuthenticated: () => {},
	updateUser: async (): Promise<undefined> => {},
	updateAccessToken: () => {},
	checkConnection: () => {},
});

export const fetcher = async (url: string) => {
	try {
		const response = await axios.get(`${process.env.BACK_END_URL}${url}`, {
			withCredentials: true,
		});
		return response.data;
	} catch (error) {
		throw error;
	}
};

const AppProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = React.useState<IUser | undefined>(undefined);
	const [accessToken, setAccessToken] = React.useState<string | undefined>(
		getCookieItem("access_token")
	);
	const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
	const [isLoading, setIsLoading] = React.useState<boolean>(true);
	const location = usePathname();

	const checkConnection = () => {
		const _accessToken = getCookieItem("access_token");
		if (!_accessToken || _accessToken !== accessToken) {
			setIsAuthenticated(false);
			setAccessToken("undefined");
			setUser(undefined);
			deleteCookieItem("access_token");
		}
	};

	const updateUser = async (): Promise<IUser | undefined> => {
		// The frontend cookie is the session; without it, never let a cookie on
		// the API host authenticate us, or "/" and "/home" redirect forever.
		if (!getCookieItem("access_token")) {
			setIsAuthenticated(false);
			setUser(undefined);
			setIsLoading(false);
			return undefined;
		}
		try {
			const data = await fetcher("api/auth/42");
			if (data) {
				setIsAuthenticated(true);
				setUser(data);
			} else {
				setIsAuthenticated(false);
			}
			setIsLoading(false);
			return data;
		} catch (_) {
			setIsAuthenticated(false);
			setIsLoading(false);
		}
		return undefined;
	};

	const updateAccessToken = () => {
		setAccessToken(getCookieItem("access_token"));
	};

	React.useEffect(() => {
		updateUser();
	}, []);

	React.useEffect(() => {
		if (location === "/") return;
		checkConnection();
	}, [location]);

	if (isLoading) {
		return (
			<AppContext.Provider
				value={{
					user: undefined,
					loading: true,
					authenticated: false,
					setAuthenticated: () => {},
					updateUser: async (): Promise<undefined> => {},
					updateAccessToken: () => {},
					checkConnection: () => {},
				}}
			>
				<body />
			</AppContext.Provider>
		);
	}

	if (!isAuthenticated && !isLoading && location !== "/") redirect("/");

	const appContextValue: IAppContext = {
		user,
		loading: isLoading,
		authenticated: isAuthenticated,
		setAuthenticated: setIsAuthenticated,
		updateUser,
		updateAccessToken,
		checkConnection,
	};

	return <AppContext.Provider value={appContextValue}>{children}</AppContext.Provider>;
};

export default AppProvider;
