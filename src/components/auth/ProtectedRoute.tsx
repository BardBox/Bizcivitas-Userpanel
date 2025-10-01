"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check authentication with proper token validation
    try {
      const authenticated = isAuthenticated();

      if (!authenticated) {
        // Invalid or expired token - redirect immediately
        router.replace("/login");
      } else {
        // Valid token - show content
        setIsAuthorized(true);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // On error, redirect to login for safety
      router.replace("/login");
    }
  }, [router, pathname]);

  // Don't render anything until auth check is complete
  // This prevents any flash of protected content
  if (!isAuthorized) {
    return null; // or return a loading spinner
  }

  return <>{children}</>;
}
