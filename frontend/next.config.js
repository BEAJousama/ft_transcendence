/** @type {import('next').NextConfig} */

const nextConfig = {
	env: {
		BACK_END_URL: process.env.NEXT_PUBLIC_BACK_END_URL,
		FRONT_END_URL: process.env.NEXT_PUBLIC_FRONT_END_URL,
	},
	compiler: {
		removeConsole: process.env.NODE_ENV === "production",
	},
};

module.exports = nextConfig;
