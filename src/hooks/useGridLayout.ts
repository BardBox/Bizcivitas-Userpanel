import { useState, useEffect } from "react";

/**
 * Custom hook to calculate items per page based on screen resolution and grid layout
 * Returns the number of items that should be displayed per page
 */
export function useGridLayout() {
  const [itemsPerPage, setItemsPerPage] = useState(8); // SSR-safe default

  useEffect(() => {
    // Guard against SSR
    if (typeof window === "undefined") return;

    function calculateItemsPerPage() {
      const width = window.innerWidth;

      // Based on Tailwind breakpoints and grid layout from connections page:
      // grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4

      let columns = 1;
      let rows = 3; // Default 3 rows

      // Determine columns based on screen width (matching Tailwind breakpoints)
      if (width >= 1280) {
        // xl: 4 columns
        columns = 4;
        rows = 2; // 4x2 = 8 items
      } else if (width >= 1024) {
        // lg: 3 columns
        columns = 3;
        rows = 3; // 3x3 = 9 items
      } else if (width >= 768) {
        // md: 2 columns
        columns = 2;
        rows = 4; // 2x4 = 8 items
      } else if (width >= 640) {
        // sm: 2 columns
        columns = 2;
        rows = 3; // 2x3 = 6 items
      } else {
        // mobile: 1 column
        columns = 1;
        rows = 6; // 1x6 = 6 items
      }

      const calculatedItems = columns * rows;
      setItemsPerPage(calculatedItems);
    }

    // Calculate on mount
    calculateItemsPerPage();

    // Recalculate on window resize
    window.addEventListener("resize", calculateItemsPerPage);

    // Cleanup
    return () => window.removeEventListener("resize", calculateItemsPerPage);
  }, []);

  return itemsPerPage;
}

/**
 * Get grid configuration details for debugging or display purposes
 */
export function useGridConfig() {
  const [config, setConfig] = useState<{
    columns: number;
    rows: number;
    itemsPerPage: number;
    breakpoint: "xs" | "sm" | "md" | "lg" | "xl";
  }>({
    columns: 1,
    rows: 3,
    itemsPerPage: 8,
    breakpoint: "xs",
  }); // SSR-safe default

  useEffect(() => {
    // Guard against SSR
    if (typeof window === "undefined") return;

    function calculateConfig() {
      const width = window.innerWidth;

      let columns = 1;
      let rows = 3;
      let breakpoint: "xs" | "sm" | "md" | "lg" | "xl" = "xs";

      if (width >= 1280) {
        columns = 4;
        rows = 2;
        breakpoint = "xl";
      } else if (width >= 1024) {
        columns = 3;
        rows = 3;
        breakpoint = "lg";
      } else if (width >= 768) {
        columns = 2;
        rows = 4;
        breakpoint = "md";
      } else if (width >= 640) {
        columns = 2;
        rows = 3;
        breakpoint = "sm";
      } else {
        columns = 1;
        rows = 6;
        breakpoint = "xs";
      }

      setConfig({
        columns,
        rows,
        itemsPerPage: columns * rows,
        breakpoint,
      });
    }

    calculateConfig();
    window.addEventListener("resize", calculateConfig);
    return () => window.removeEventListener("resize", calculateConfig);
  }, []);

  return config;
}
