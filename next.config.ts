import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Autorise toutes les sources externes (images produits depuis le web)
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http",  hostname: "**" },
    ],
  },
};

export default nextConfig;
