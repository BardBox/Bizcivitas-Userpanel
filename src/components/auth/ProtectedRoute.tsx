"use client";

import { useFastAuth } from "@/hooks/useFastAuth";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useFastAuth();

  // Don't show loading screen - auth check is instant with localStorage
  // If not authenticated, useFastAuth will redirect to login
  if (isLoading || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
