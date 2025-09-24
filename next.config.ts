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
  transpilePackages: ['yeezy-wallet-sdk'],
  async headers() {
    const allowedAncestors = [
      process.env.NEXT_PUBLIC_IFRAME_PARENT_ORIGIN || '',
      process.env.NEXT_PUBLIC_IFRAME_PARENT_ORIGIN_STAGING || '',
    ].filter(Boolean);

    const cspValue = allowedAncestors.length
      ? `frame-ancestors ${allowedAncestors.join(' ')};`
      : 'frame-ancestors *;';

    return [
      {
        source: '/embed',
        headers: [
          { key: 'Content-Security-Policy', value: cspValue },
          // Avoid denying frames; CSP controls who can embed.
        ],
      },
    ];
  },
};

export default nextConfig;
