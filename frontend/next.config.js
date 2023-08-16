/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require("@next/bundle-analyzer")({
	enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
	compiler: {
		// removeConsole: true,
		// removeConsole: process.env.NODE_ENV === "production",
	},
};

module.exports = withBundleAnalyzer({});
// module.exports = nextConfig;
