/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require("@next/bundle-analyzer")({
	enabled: process.env.ANALYZE === "true",
});

// const nextConfig = {

// };

module.exports = withBundleAnalyzer({});
// module.exports = nextConfig;
