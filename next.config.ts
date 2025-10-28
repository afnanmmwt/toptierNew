import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: true,

  async rewrites() {
    return [
      {
        source: "/robots.txt",
        destination: "/robots",
      },
    ];
  },

  experimental: {
    optimizeCss: false,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: [
      // Your main domain
      {
        protocol: "https",
        hostname: "toptiertravel.vip",
        pathname: "/**",
      },
      // Common hotel image sources
      {
        protocol: "http",
        hostname: "photos.hotelbeds.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.stuba.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.expedia.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "flagpedia.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.stuba.com",
        pathname: "/**",
      },
      // Optional wildcard (last fallback — only if needed)
      {
        protocol: "https",
        hostname: "**",
        pathname: "/**",
      },
       {
        protocol: "http",
        hostname: "photos.hotelbeds.com", // allow hotelbeds images
        pathname: "/**",
      },
         {
        protocol: "http",
        hostname: "**",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
