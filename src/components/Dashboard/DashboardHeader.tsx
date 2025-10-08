"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import NotificationDropdown from "@/components/NotificationDropdown";
import { useLogoutMutation } from "@/store/api";

export default function DashboardHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const [logout, { isLoading: logoutLoading }] = useLogoutMutation();
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // You can add search functionality here in the future
    console.log("Search query:", searchQuery);
  };

  const handleLogout = async () => {
    try {
      console.log("Attempting logout...");
      const result = await logout().unwrap();

      // Clear session storage only on client side
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("userProfile");
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");
      }

      router.push("/login");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // Show more detailed error message
      let errorMessage = "Unknown error";
      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.error) {
        errorMessage = err.error;
      } else if (err?.status) {
        errorMessage = `HTTP ${err.status}`;
      }

      alert(`Logout failed: ${errorMessage}. Please try again.`);
    }
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
          {/* Notification Dropdown */}
          <NotificationDropdown />

          {/* Settings Gear Icon */}
          <button className="text-white hover:bg-blue-600 rounded-lg transition-colors">
            <Image
              src="/dashboard/sidebaricons/settings.svg"
              width={24}
              height={24}
              alt="Settings Icon"
              className="object-contain"
              style={{ width: "40px", height: "40px" }}
            />
          </button>

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
