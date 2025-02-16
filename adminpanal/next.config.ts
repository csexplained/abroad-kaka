import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Disable ESLint during builds
  },
  images: {
    domains: ["res.cloudinary.com"],
  },
};

export default nextConfig;
