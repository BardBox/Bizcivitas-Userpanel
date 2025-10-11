"use client";

import { useFastAuth } from "@/hooks/useFastAuth";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useFastAuth();

  // Show minimal loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dashboard-primary">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Only render children if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
