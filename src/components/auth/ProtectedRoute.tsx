"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check authentication immediately on mount
    const token = localStorage.getItem("accessToken");

    if (!token) {
      // No token found - redirect immediately
      router.replace("/login");
    } else {
      // Token exists - show content
      setIsAuthorized(true);
    }
  }, [router, pathname]);

  // Don't render anything until auth check is complete
  // This prevents any flash of protected content
  if (!isAuthorized) {
    return null; // or return a loading spinner
  }

  return <>{children}</>;
}
