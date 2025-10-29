"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import NotificationDropdown from "@/components/NotificationDropdown";
import { useLogoutMutation } from "@/store/api";

export default function DashboardHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const showNotificationIcon = false; // temporarily hide notifications icon
  const [logout, { isLoading: logoutLoading }] = useLogoutMutation();
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // You can add search functionality here in the future
    // ✅ CLEANUP: Removed debug console.log
  };

  const handleLogout = async () => {
    // Get FCM token from localStorage
    // Use placeholder if not found (backend requires fcmToken field)
    const fcmToken = localStorage.getItem("fcmToken") || "no-fcm-token";

    // Call logout API in background (fire and forget)
    logout({ fcmToken }).catch((err) => {
      // Silently fail - user is already logged out on frontend
      console.error("Logout API error (already logged out):", err);
    });

    // Clear all storage IMMEDIATELY
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
    }

    // Force immediate hard redirect using window.location
    // This is more reliable than router.replace for logout
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-20 bg-blue-500 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-lg text-gray-900 placeholder-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Search size={20} />
            </button>
          </div>
        </form>
        <div className="flex items-center ml-4">
          {/* Notification Dropdown (disabled) */}
          {showNotificationIcon && <NotificationDropdown />}

          {/* Settings Gear Icon */}
        
        {showNotificationIcon && <button className="text-white hover:bg-blue-600 rounded-lg transition-colors">
            <Image
              src="/dashboard/sidebaricons/settings.svg"
              width={24}
              height={24}
              alt="Settings Icon"
              className="object-contain"
              style={{ width: "40px", height: "40px" }}
            />
          </button>
        } 
          {/* Logout Button */}
          <button
            className="ml-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            onClick={handleLogout}
            disabled={logoutLoading}
          >
            {logoutLoading ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </header>
  );
}
