"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Skip loading indicator on first render
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }

    // Start loading immediately when pathname changes
    setLoading(true);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Hide loader after a short delay (allow page to render)
    timeoutRef.current = setTimeout(() => {
      setLoading(false);
    }, 600);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pathname, searchParams]);

  // Don't show on first render
  if (isFirstRender || !loading) return null;

  return (
    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
        </div>

        {/* Loading Text */}
        <p className="text-gray-700 font-medium text-base">Loading...</p>
      </div>
    </div>
  );
}
