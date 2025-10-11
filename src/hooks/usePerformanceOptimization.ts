"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Custom hook for performance optimizations
 * Provides utilities to prevent unnecessary re-renders and optimize performance
 */
export function usePerformanceOptimization() {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());

  // Track render count
  useEffect(() => {
    renderCountRef.current += 1;
    lastRenderTimeRef.current = Date.now();
  });

  // Debounce function to prevent excessive API calls
  const debounce = useCallback(
    <T extends (...args: any[]) => any>(
      func: T,
      delay: number
    ): ((...args: Parameters<T>) => void) => {
      let timeoutId: NodeJS.Timeout;
      return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
      };
    },
    []
  );

  // Throttle function to limit function calls
  const throttle = useCallback(
    <T extends (...args: any[]) => any>(
      func: T,
      limit: number
    ): ((...args: Parameters<T>) => void) => {
      let inThrottle: boolean;
      return (...args: Parameters<T>) => {
        if (!inThrottle) {
          func(...args);
          inThrottle = true;
          setTimeout(() => (inThrottle = false), limit);
        }
      };
    },
    []
  );

  // Check if component is rendering too frequently
  const isRenderingTooFrequently = useCallback(() => {
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTimeRef.current;
    return timeSinceLastRender < 16; // Less than 60fps
  }, []);

  // Get performance stats
  const getPerformanceStats = useCallback(() => {
    return {
      renderCount: renderCountRef.current,
      lastRenderTime: lastRenderTimeRef.current,
      isRenderingTooFrequently: isRenderingTooFrequently(),
    };
  }, [isRenderingTooFrequently]);

  return {
    debounce,
    throttle,
    getPerformanceStats,
    isRenderingTooFrequently,
  };
}

/**
 * Hook to prevent unnecessary re-renders by memoizing expensive calculations
 */
export function useMemoizedValue<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  const ref = useRef<{ deps: React.DependencyList; value: T } | null>(null);

  if (
    !ref.current ||
    !deps.every((dep, index) => dep === ref.current!.deps[index])
  ) {
    ref.current = { deps, value: factory() };
  }

  return ref.current.value;
}

/**
 * Hook to optimize scroll events
 */
export function useOptimizedScroll(
  callback: (event: Event) => void,
  delay: number = 16
) {
  const { throttle } = usePerformanceOptimization();
  const throttledCallback = useCallback(
    throttle(callback, delay),
    [callback, delay, throttle]
  );

  useEffect(() => {
    window.addEventListener("scroll", throttledCallback, { passive: true });
    return () => window.removeEventListener("scroll", throttledCallback);
  }, [throttledCallback]);
}

/**
 * Hook to optimize resize events
 */
export function useOptimizedResize(
  callback: (event: Event) => void,
  delay: number = 100
) {
  const { debounce } = usePerformanceOptimization();
  const debouncedCallback = useCallback(
    debounce(callback, delay),
    [callback, delay, debounce]
  );

  useEffect(() => {
    window.addEventListener("resize", debouncedCallback, { passive: true });
    return () => window.removeEventListener("resize", debouncedCallback);
  }, [debouncedCallback]);
}
