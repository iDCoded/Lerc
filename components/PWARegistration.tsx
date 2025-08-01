"use client";

import { useEffect, useState } from "react";

export function PWARegistration() {
	const [isOnline, setIsOnline] = useState(true);
	const [isPWAInstalled, setIsPWAInstalled] = useState(false);

	useEffect(() => {
		// Check online status
		const handleOnline = () => setIsOnline(true);
		const handleOffline = () => setIsOnline(false);

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);
		setIsOnline(navigator.onLine);

		// Check if PWA is installed
		const checkPWAInstallation = () => {
			if (window.matchMedia("(display-mode: standalone)").matches) {
				setIsPWAInstalled(true);
			}
		};

		checkPWAInstallation();

		// Register service worker
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker
				.register("/sw.js")
				.then((registration) => {
					console.log(
						"[PWA] Service Worker registered successfully:",
						registration
					);
				})
				.catch((error) => {
					console.error("[PWA] Service Worker registration failed:", error);
				});
		}

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, []);

	// Show offline indicator
	if (!isOnline) {
		return (
			<div className="fixed top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
				<div className="flex items-center gap-2">
					<div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
					<span className="text-sm font-medium">Offline Mode</span>
				</div>
			</div>
		);
	}

	return null;
}
