"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLogoutMutation } from "@/store/api";
import { useAppDispatch } from "@/store/hooks";
import { logout as logoutAction } from "@/store/slices/authSlice";
import toast from "react-hot-toast";

interface UserProfileDropdownProps {
  className?: string;
}

export default function UserProfileDropdown({
  className = "",
}: UserProfileDropdownProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [logoutUser, { isLoading: logoutLoading }] = useLogoutMutation();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close user dropdown when notification dropdown opens
  useEffect(() => {
    const handleNotificationDropdownOpened = () => {
      setIsOpen(false);
    };

    window.addEventListener("notificationDropdownOpened", handleNotificationDropdownOpened);
    return () => {
      window.removeEventListener("notificationDropdownOpened", handleNotificationDropdownOpened);
    };
  }, []);

  const handleToggleDropdown = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    // Dispatch custom event to close NotificationDropdown when user dropdown opens
    if (newIsOpen) {
      window.dispatchEvent(new Event("userDropdownOpened"));
    }
  };

  const handleAccountSettings = () => {
    setIsOpen(false);
    router.push("/feeds/account-settings");
  };

  const handleLogout = async () => {
    try {
      // Get FCM token from localStorage
      // Use placeholder if not found (backend requires fcmToken field)
      const fcmToken = localStorage.getItem("fcmToken") || "no-fcm-token";

      await logoutUser({ fcmToken }).unwrap();

      // Dispatch Redux logout action to clear auth state
      dispatch(logoutAction());

      // Clear all local storage
      localStorage.clear();

      toast.success("Logged out successfully");

      // Force immediate hard redirect to home page (root page)
      window.location.href = "/";
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(error?.data?.message || "Logout failed");
    }
  };

  if (!isMounted) {
    return (
      <button
        className={`flex items-center justify-center transition-colors hover:bg-gray-200 rounded-lg p-2 ${className}`}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="#1db212"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </button>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleToggleDropdown}
        className="flex items-center justify-center transition-colors hover:bg-gray-200 relative rounded-lg p-2"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="#1db212"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-green-50">
              <h3 className="text-sm font-semibold text-gray-900">
                Account Menu
              </h3>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              {/* Account Settings */}
              <button
                onClick={handleAccountSettings}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Image
                    src="/settings-user.svg"
                    width={16}
                    height={16}
                    alt="Settings"
                    className="flex-shrink-0"
                    style={{
                      width: "16px",
                      height: "16px",
                      filter: "brightness(0) saturate(100%) invert(57%) sepia(71%) saturate(426%) hue-rotate(82deg) brightness(95%) contrast(90%)"
                    }}
                  />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900">
                    Account Settings
                  </p>
                  <p className="text-xs text-gray-500">
                    Manage your profile
                  </p>
                </div>
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                disabled={logoutLoading}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {logoutLoading ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-gray-900">
                        Logging out...
                      </p>
                      <p className="text-xs text-gray-500">
                        Please wait
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                      <Image
                        src="/logout.svg"
                        width={16}
                        height={16}
                        alt="Logout"
                        className="flex-shrink-0"
                        style={{
                          width: "16px",
                          height: "16px",
                          filter: "brightness(0) saturate(100%) invert(57%) sepia(71%) saturate(426%) hue-rotate(82deg) brightness(95%) contrast(90%)"
                        }}
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-gray-900">
                        Logout
                      </p>
                      <p className="text-xs text-gray-500">
                        Sign out of your account
                      </p>
                    </div>
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
