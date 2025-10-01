"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PublicRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("accessToken");

    if (token) {
      // User is logged in - redirect to feeds
      router.replace("/feeds");
    } else {
      // User is not logged in - show login page
      setIsReady(true);
    }
  }, [router]);

  // Don't render until auth check is complete
  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}
