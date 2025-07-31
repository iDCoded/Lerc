import type { NextConfig } from "next";

const withPwa = require("next-pwa")({
	dest: "public",
	register: true, // Auto register SW
	skipWaiting: true, // Activate new SW immediately
	disable: process.env.NODE_ENV === "development", // Disable PWA in development mode
});

module.exports = withPwa({
	reactStrictMode: true,
});
