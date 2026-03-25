import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const ObjectValues = Object.values; // needed if TS has issues, but shouldn't and it's simpler to just not do it

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /\/api\/ai\/.*/i,
        handler: "NetworkOnly",
        options: {
          cacheName: "ai-planner-network-only",
        },
      },
      {
        urlPattern: /\/api\/places.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "places-api-cache",
        },
      },
      {
        urlPattern: /.*(?:localhost|\.com)\/.*(?:transport|emergency|profile|stays|tours|dining).*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "offline-pages-cache",
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
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
