/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    // Prevent resolving optional native binding from pg
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      "pg-native": false,
    };
    return config;
  },
};

export default nextConfig;
