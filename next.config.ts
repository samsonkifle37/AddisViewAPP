import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "hrbxtdzpseitkegkeknt.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "assets.hyatt.com",
      },
    ],
    localPatterns: [
      {
        pathname: "/api/image-proxy**",
        search: "?url=**",
      },
      {
        pathname: "/fallbacks/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/explore',
        destination: '/tours',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
