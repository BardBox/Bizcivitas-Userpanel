"use client";

import { useState, Suspense, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import DashboardSidebar from "@/components/Dashboard/dashboard-sidebar";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import NavigationLoader from "@/components/NavigationLoader";
import { X } from "lucide-react";

export default function FeedsLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const pathname = usePathname();

  // Pages that should NOT have padding (main feed pages)
  const noPaddingPages = ["/feeds"];
  const shouldHavePadding = !noPaddingPages.includes(pathname);

  useEffect(() => {
    const mainElement = mainRef.current;
    if (!mainElement) return;

    const handleScroll = () => {
      const currentScrollY = mainElement.scrollTop;

      // Dispatch custom event with scroll data
      window.dispatchEvent(
        new CustomEvent("mainScroll", {
          detail: {
            scrollY: currentScrollY,
            lastScrollY: lastScrollY.current,
          },
        })
      );

      lastScrollY.current = currentScrollY;
    };

    mainElement.addEventListener("scroll", handleScroll, { passive: true });
    return () => mainElement.removeEventListener("scroll", handleScroll);
  }, []);

  // Listen for hamburger menu toggle from header
  useEffect(() => {
    const handleToggleMobileMenu = () => {
      setIsMobileMenuOpen((prev) => {
        const newState = !prev;
        // Notify header about menu state change
        window.dispatchEvent(
          new CustomEvent("mobileMenuStateChanged", {
            detail: { isOpen: newState },
          })
        );
        return newState;
      });
    };

    window.addEventListener("toggleMobileMenu", handleToggleMobileMenu);
    return () =>
      window.removeEventListener("toggleMobileMenu", handleToggleMobileMenu);
  }, []);

  // Notify header of initial state and changes
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("mobileMenuStateChanged", {
        detail: { isOpen: isMobileMenuOpen },
      })
    );
  }, [isMobileMenuOpen]);

  return (
    <div className="flex h-screen bg-dashboard-primary overflow-hidden px-4 md:p-0">
      {/* Desktop Sidebar */}
      <div className="hidden md:block relative z-30">
        <DashboardSidebar isMobile={false} />
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed left-0 top-16 h-full w-64 bg-dashboard-primary z-50 transform transition-transform duration-300 ease-in-out md:hidden translate-x-0">
          <DashboardSidebar
            onNavigate={() => setIsMobileMenuOpen(false)}
            onToggleMobile={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            isMobile={true}
          />
        </div>
      )}

      {/* Main Content */}
      <div
        className="flex-1 flex flex-col overflow-hidden"
        onClick={() => isMobileMenuOpen && setIsMobileMenuOpen(false)}
      >
        <DashboardHeader />
        <main
          ref={mainRef}
          className={`relative flex-1 overflow-y-auto pt-16 ${
            shouldHavePadding ? "md:p-12" : ""
          }`}
        >
          <NavigationLoader />
          <Suspense fallback={<NavigationLoader />}>{children}</Suspense>
        </main>
      </div>

      {/* Mobile Floating Button - Hidden since hamburger is now in header */}
      {/* {!isMobileMenuOpen && (
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="fixed top-20 left-4 md:hidden bg-orange-400 hover:bg-orange-500 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-30"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )} */}
    </div>
  );
}
