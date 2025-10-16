"use client";

import { useEffect, useRef } from "react";

/**
 * Detects if React Strict Mode is enabled
 * In Strict Mode, useEffect runs TWICE in development
 */
export default function StrictModeDetector() {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;

    if (renderCount.current === 1) {
      console.log("🟢 First render - checking for Strict Mode...");
    } else if (renderCount.current === 2) {
      console.error("🔴 STRICT MODE IS ENABLED! This is causing 10s navigation delays!");
      console.error("🔴 You MUST restart your dev server for next.config.ts changes to take effect!");
      console.error("🔴 Run: npm run dev");
    }

    // Cleanup to detect unmount
    return () => {
      if (renderCount.current === 1) {
        console.warn("⚠️ Component unmounted - Strict Mode is doing mount/unmount/remount!");
      }
    };
  }, []);

  return null;
}
