import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  transpilePackages: ["react-simple-maps"],
};

export default nextConfig;
