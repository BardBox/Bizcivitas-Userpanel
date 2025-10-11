"use client";

import { useEffect } from "react";
import { useRedirectPerformance } from "@/hooks/useRedirectPerformance";

/**
 * Component to test redirect performance
 * Add this to any page to monitor redirect times
 */
export default function RedirectTester() {
  const { markRedirectStart, markRedirectEnd } = useRedirectPerformance("RedirectTester");

  useEffect(() => {
    // Mark when component starts
    markRedirectStart();
    
    // Simulate some work
    const timer = setTimeout(() => {
      markRedirectEnd();
    }, 100);

    return () => clearTimeout(timer);
  }, [markRedirectStart, markRedirectEnd]);

  return null; // This component doesn't render anything
}

