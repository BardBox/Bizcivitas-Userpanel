"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Detailed performance logger to find EXACT bottleneck
 */
export default function PerformanceLogger() {
  const pathname = usePathname();

  useEffect(() => {
    const start = performance.now();
    console.log(`🔵 [PERF] useEffect triggered for: ${pathname}`);

    // Log when page is interactive
    const checkInteractive = () => {
      const end = performance.now();
      const duration = end - start;
      console.log(`🟢 [PERF] Page interactive after: ${duration.toFixed(2)}ms`);

      if (duration > 1000) {
        console.warn(`⚠️ [PERF] SLOW PAGE RENDER! ${duration.toFixed(2)}ms`);
      }
    };

    const timer = setTimeout(checkInteractive, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Log immediately when component mounts (before useEffect)
  console.log(`🟡 [PERF] PerformanceLogger mounted for: ${pathname}`);

  return null;
}
