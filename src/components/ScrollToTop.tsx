"use client";

import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface ScrollToTopProps {
  threshold?: number; // Percentage of page scrolled before button appears (default: 25%)
  scrollPercentage?: number; // Percentage to scroll up/down when clicked (default: 40%)
  scrollToTop?: boolean; // If true, scroll all the way to top/bottom instead of by percentage (default: false)
  containerRef?: React.RefObject<HTMLElement | null>; // Optional container to monitor
  bidirectional?: boolean; // If true, shows up arrow when scrolled down, down arrow when scrolled up (default: true)
}

export default function ScrollToTop({
  threshold = 25,
  scrollPercentage = 40,
  scrollToTop = false,
  containerRef,
  bidirectional = true
}: ScrollToTopProps) {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const element = containerRef?.current || document.documentElement;
      const scrollTop = containerRef?.current ? element.scrollTop : window.pageYOffset || element.scrollTop;
      const scrollHeight = element.scrollHeight;
      const clientHeight = element.clientHeight;

      // Calculate scroll percentage
      const currentScrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;

      if (bidirectional) {
        // Show down arrow when near top, up arrow when scrolled down
        if (currentScrollPercentage <= (100 - threshold)) {
          // Near top or middle - show down arrow to scroll to bottom
          setScrollDirection("down");
        } else {
          // Near bottom - show up arrow to scroll to top
          setScrollDirection("up");
        }
      } else {
        // Traditional behavior - only show when scrolled down
        if (currentScrollPercentage >= threshold) {
          setScrollDirection("up");
        } else {
          setScrollDirection(null);
        }
      }
    };

    // Add scroll listener to container or window
    const scrollElement = containerRef?.current || window;
    scrollElement.addEventListener("scroll", handleScroll, { passive: true });

    // Check initial scroll position
    handleScroll();

    return () => {
      scrollElement.removeEventListener("scroll", handleScroll);
    };
  }, [threshold, containerRef, bidirectional]);

  const handleScroll = () => {
    const element = containerRef?.current || document.documentElement;
    const currentScrollTop = containerRef?.current ? element.scrollTop : window.pageYOffset || element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;
    const maxScroll = scrollHeight - clientHeight;

    let targetScrollTop: number;

    if (scrollDirection === "down") {
      // Scroll down
      if (scrollToTop) {
        // Scroll all the way to bottom
        targetScrollTop = maxScroll;
      } else {
        // Calculate how much to scroll down by percentage
        const scrollDownAmount = maxScroll * (scrollPercentage / 100);
        targetScrollTop = Math.min(maxScroll, currentScrollTop + scrollDownAmount);
      }
    } else {
      // Scroll up
      if (scrollToTop) {
        // Scroll all the way to top
        targetScrollTop = 0;
      } else {
        // Calculate how much to scroll up by percentage
        const scrollUpAmount = maxScroll * (scrollPercentage / 100);
        targetScrollTop = Math.max(0, currentScrollTop - scrollUpAmount);
      }
    }

    if (containerRef?.current) {
      // Scroll container element
      containerRef.current.scrollTo({
        top: targetScrollTop,
        behavior: "smooth",
      });
    } else {
      // Scroll window
      window.scrollTo({
        top: targetScrollTop,
        behavior: "smooth",
      });
    }
  };

  if (!scrollDirection) return null;

  const Icon = scrollDirection === "down" ? ChevronDown : ChevronUp;
  const label = scrollDirection === "down"
    ? (scrollToTop ? "Scroll to bottom" : `Scroll down ${scrollPercentage}%`)
    : (scrollToTop ? "Scroll to top" : `Scroll up ${scrollPercentage}%`);

  return (
    <button
      onClick={handleScroll}
      className="fixed bottom-20 right-4 z-50 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label={label}
      title={label}
    >
      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
    </button>
  );
}
