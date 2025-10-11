"use client";

import { useEffect, useRef } from "react";

/**
 * Hook to monitor redirect performance
 * Helps identify slow redirects and bottlenecks
 */
export function useRedirectPerformance(routeName: string) {
  const startTimeRef = useRef<number>(0);
  const redirectStartRef = useRef<number>(0);

  useEffect(() => {
    // Mark when component starts loading
    startTimeRef.current = performance.now();
    
    return () => {
      // Mark when component finishes loading
      const endTime = performance.now();
      const totalTime = endTime - startTimeRef.current;
      
      if (totalTime > 1000) { // Log if takes more than 1 second
        console.warn(`🐌 Slow ${routeName} load: ${totalTime.toFixed(0)}ms`);
      } else {
        console.log(`✅ Fast ${routeName} load: ${totalTime.toFixed(0)}ms`);
      }
    };
  }, [routeName]);

  const markRedirectStart = () => {
    redirectStartRef.current = performance.now();
  };

  const markRedirectEnd = () => {
    if (redirectStartRef.current > 0) {
      const redirectTime = performance.now() - redirectStartRef.current;
      console.log(`🔄 Redirect time: ${redirectTime.toFixed(0)}ms`);
    }
  };

  return {
    markRedirectStart,
    markRedirectEnd,
  };
}
