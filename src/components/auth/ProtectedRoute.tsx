"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Check authentication on client-side only
    // This avoids hydration mismatch between server and client
    try {
      const authenticated = isAuthenticated();

      if (!authenticated) {
        // Invalid or expired token - redirect to login
        router.replace("/login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      // On error, redirect to login for safety
      router.replace("/login");
    }
  }, [router]);

  // Render children immediately to match server-rendered HTML
  // Redirect happens in useEffect on client-side if unauthorized
  // Note: For full server-side protection, use Next.js middleware
  // to check authentication before the page even loads
  return <>{children}</>;
}
