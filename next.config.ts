import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV !== "development",
    styledComponents: {
      ssr: true,
      displayName: true,
      pure: true,
    },
  },
  transpilePackages: ['clique-wallet-sdk'],
};

export default nextConfig;
