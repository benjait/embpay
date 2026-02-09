import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable x-powered-by header to reduce fingerprinting
  poweredByHeader: false,

  // Restrict allowed image domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
