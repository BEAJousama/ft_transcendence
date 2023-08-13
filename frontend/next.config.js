/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

// const nextConfig = {
//   webpack(config, options) {
//     return config;
//   },
// };

module.exports = withBundleAnalyzer({});
