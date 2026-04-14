import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Autorise toutes les sources externes (images produits depuis le web)
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http",  hostname: "**" },
    ],
    // Autoriser les data URLs (PNG base64 générés après suppression du fond)
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
  },
};

export default nextConfig;
