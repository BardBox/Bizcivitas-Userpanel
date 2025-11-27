"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated as checkAuthStatus, setAccessToken } from "@/lib/auth";

/**
 * Fast authentication hook that minimizes delays
 * Uses immediate redirects and optimized state management
 */
export function useFastAuth() {
  // Initialize state synchronously to avoid flash of loading state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(() => {
    // Only run on client
    if (typeof window !== "undefined") {
      return checkAuthStatus();
    }
    return null;
  });

  // If we have a value (even false), we're not loading. If null (SSR), we are.
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window !== "undefined") {
      return false; // We already checked auth status above
    }
    return true; // SSR needs to wait
  });

  const router = useRouter();

  const checkAuth = useCallback(() => {
    try {
      const authenticated = checkAuthStatus();
      setIsAuthenticated(authenticated);
      return authenticated;
    } catch (error) {
      console.error("Auth check error:", error);
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  useEffect(() => {
    // Double check on mount, but we likely already have the correct state
    const authenticated = checkAuth();
    setIsLoading(false);

    // If not authenticated, redirect immediately to home page
    if (!authenticated) {
      router.replace("/");
    }
  }, [checkAuth, router]);

  const redirectToLogin = useCallback(() => {
    router.replace("/");
  }, [router]);

  const redirectToFeeds = useCallback(() => {
    router.replace("/feeds");
  }, [router]);

  return {
    isAuthenticated,
    isLoading,
    checkAuth,
    redirectToLogin,
    redirectToFeeds,
  };
}

/**
 * Hook for public routes (login, register, etc.)
 * Redirects to feeds if already authenticated
 */
export function usePublicAuth() {
  const [isReady, setIsReady] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const authenticated = checkAuthStatus();

      if (authenticated) {
        // User is already logged in - redirect immediately
        setIsRedirecting(true);
        router.replace("/feeds");
      } else {
        // User is not logged in - show public page
        setIsReady(true);
      }
    } catch (error) {
      console.error("Public auth check error:", error);
      setIsReady(true);
    }
  }, []); // Remove dependencies to prevent infinite loop

  return {
    isReady,
    isRedirecting,
  };
}
