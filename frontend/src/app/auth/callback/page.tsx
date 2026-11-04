"use client";
import { useEffect } from "react";
import axios from "axios";
import { deleteCookieItem, setCookieItem } from "@/context/app.context";

const SESSION_KEYS = ["access_token", "2fa_access_token", "complete_info"] as const;

// Landing point of the OAuth redirect. The API sends a short-lived, single-use
// code (never the JWT itself); trade it for the session tokens, then leave.
const AuthCallback = () => {
	useEffect(() => {
		const code = new URLSearchParams(window.location.search).get("code");
		// Drop the code from the address bar/history right away.
		window.history.replaceState(null, "", "/auth/callback");
		if (!code) {
			window.location.replace("/");
			return;
		}
		(async () => {
			try {
				const { data } = await axios.post(`${process.env.BACK_END_URL}api/auth/exchange`, { code });
				SESSION_KEYS.forEach((key) => deleteCookieItem(key));
				if (data?.access_token) setCookieItem("access_token", data.access_token, 7);
				if (data?.["2fa_access_token"]) setCookieItem("2fa_access_token", data["2fa_access_token"]);
				if (data?.complete_info) setCookieItem("complete_info", data.complete_info);
				// 2FA and "complete your info" steps are handled on the landing page.
				const next = data?.["2fa_access_token"] || data?.complete_info ? "/" : "/home";
				window.location.replace(next);
			} catch (_) {
				window.location.replace("/");
			}
		})();
	}, []);

	return (
		<div className="flex h-screen w-screen items-center justify-center bg-secondary-800 text-white">
			Signing you in…
		</div>
	);
};

export default AuthCallback;
