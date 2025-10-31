/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  // Suppress hydration warnings for browser extensions
  reactStrictMode: true,
};

module.exports = nextConfig;

