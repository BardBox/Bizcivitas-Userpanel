"use client";

import { useState, Suspense, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import DashboardSidebar from "@/components/Dashboard/dashboard-sidebar";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import NavigationLoader from "@/components/NavigationLoader";
import { SidebarProvider } from "@/contexts/SidebarContext";
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

  // Main /feeds page should only have horizontal padding, no vertical padding
  const isMainFeedsPage = pathname === "/feeds";

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
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden md:p-0 relative">
        {/* Background with opacity */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/background.svg)',
            backgroundRepeat: 'repeat',
            backgroundSize: '45%',
            opacity: 0.7
          }}
        />

        {/* Desktop Sidebar */}
        <div className="hidden md:block relative z-30">
          <DashboardSidebar isMobile={false} />
        </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Dark backdrop - starts below header */}
          <div
            className="fixed inset-0 top-16 bg-black/50 z-40 md:hidden transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer sidebar - starts below header */}
          <div className="fixed left-0 top-16 bottom-0 w-64 z-50 md:hidden transform transition-transform duration-300 ease-in-out">
            {/* Background with opacity for mobile drawer */}
            <div
              className="absolute inset-0 z-0"
              style={{
                backgroundImage: 'url(/background.svg)',
                backgroundRepeat: 'repeat',
                backgroundSize: '40%',
                opacity: 0.5
              }}
            />
            <div className="relative z-10 h-full overflow-y-auto">
              <DashboardSidebar
                onNavigate={() => setIsMobileMenuOpen(false)}
                onToggleMobile={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                isMobile={true}
              />
            </div>
          </div>
        </>
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
            isMainFeedsPage ? "px-3" : "px-3 md:p-12"
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
    </SidebarProvider>
  );
}
