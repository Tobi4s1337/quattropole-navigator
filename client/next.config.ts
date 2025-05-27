import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**", // Allows any path under this hostname
      },
      {
        protocol: "https",
        hostname: "einkaufen.saarbruecken.de",
        port: "",
        pathname: "/**", // Allows any path under this hostname
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
        port: "",
        pathname: "/**", // Allows any path under this hostname
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        port: "",
        pathname: "/**", // Allows any path under this hostname
      },
      {
        protocol: "https",
        hostname: "www.europa-galerie-saarbruecken.de",
        port: "",
        pathname: "/**", // Allows any path under this hostname
      },
      {
        protocol: "https",
        hostname: "www.sonaesierra.com",
        port: "",
        pathname: "/**", // Allows any path under this hostname
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
