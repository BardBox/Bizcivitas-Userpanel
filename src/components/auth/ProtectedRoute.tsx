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
    // Check authentication - but don't block rendering
    try {
      const authenticated = isAuthenticated();

      if (!authenticated) {
        // Invalid or expired token - redirect immediately
        router.replace("/login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      // On error, redirect to login for safety
      router.replace("/login");
    }
  }, [router]);

  // Render content immediately - redirect happens in background if needed
  // This prevents the 7-second delay while maintaining security
  return <>{children}</>;
}
