"use client";

import { usePublicAuth } from "@/hooks/useFastAuth";

export default function PublicRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isReady, isRedirecting } = usePublicAuth();

  // Show minimal loading state while checking or redirecting
  if (!isReady || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dashboard-primary">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
          <p className="text-gray-600 text-sm">
            {isRedirecting ? "Redirecting..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
