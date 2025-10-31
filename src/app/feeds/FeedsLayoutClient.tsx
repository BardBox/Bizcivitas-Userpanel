"use client";

import { useState, Suspense } from "react";
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

  return (
    <div className="flex h-screen bg-dashboard-primary overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block relative">
        <DashboardSidebar isMobile={false} />
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-dashboard-primary z-50 transform transition-transform duration-300 ease-in-out md:hidden
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 hover:bg-dashboard-primary rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <DashboardSidebar
          onNavigate={() => setIsMobileMenuOpen(false)}
          onToggleMobile={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobile={true}
        />
      </div>

      {/* Main Content */}
      <div
        className="flex-1 flex flex-col overflow-hidden"
        onClick={() => isMobileMenuOpen && setIsMobileMenuOpen(false)}
      >
        <DashboardHeader />
        <main className="p-3 md:p-6 relative flex-1 overflow-y-auto">
          <NavigationLoader />
          <Suspense fallback={<NavigationLoader />}>{children}</Suspense>
        </main>
      </div>

      {/* Mobile Floating Button */}
      {!isMobileMenuOpen && (
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
      )}
    </div>
  );
}
