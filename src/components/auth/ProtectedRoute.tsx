"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  // Perform synchronous auth check on initialization
  // This prevents flash of protected content before redirect
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(() => {
    try {
      return isAuthenticated();
    } catch (error) {
      console.error("Auth check error:", error);
      return false;
    }
  });

  useEffect(() => {
    // If not authorized, redirect to login
    if (isAuthorized === false) {
      router.replace("/login");
    }
  }, [isAuthorized, router]);

  // Show loading state while authorization is being determined
  // or when unauthorized (before redirect completes)
  if (isAuthorized === null || isAuthorized === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Only render protected content when authorized
  // Note: For full server-side protection, consider using Next.js middleware
  // to check authentication before the page even loads on the client
  return <>{children}</>;
}
