"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated as checkAuthStatus, setAccessToken } from "@/lib/auth";

/**
 * Fast authentication hook that minimizes delays
 * Uses immediate redirects and optimized state management
 */
export function useFastAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
    // Check authentication immediately
    const authenticated = checkAuth();
    setIsLoading(false);

    // If not authenticated, redirect immediately
    if (!authenticated) {
      router.replace("/login");
    }
  }, []); // Remove dependencies to prevent infinite loop

  const redirectToLogin = useCallback(() => {
    router.replace("/login");
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
