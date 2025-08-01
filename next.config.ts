import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	// Remove PWA for now to fix the configuration issues
	// We'll add it back later with proper configuration
};

export default nextConfig;
