"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, clearAccessToken } from "@/lib/auth";

export default function PublicRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if user is already logged in with valid token
    try {
      const authenticated = isAuthenticated();

      if (authenticated) {
        // User has valid token - redirect to feeds
        router.replace("/feeds");
      } else {
        // Clear any stale/invalid tokens
        clearAccessToken();
        localStorage.removeItem("accessToken");
        localStorage.removeItem("role");

        // Show public page
        setIsReady(true);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // On error, clear tokens and show login
      clearAccessToken();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("role");
      setIsReady(true);
    }
  }, [router]);

  // Don't render until auth check is complete
  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}
