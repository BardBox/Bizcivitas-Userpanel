"use client";

import { useState, useEffect } from "react";
import { X, Bell } from "lucide-react";
import { useFirebaseNotifications } from "@/hooks/useFirebaseNotifications";

/**
 * Friendly, non-intrusive banner to prompt users to enable notifications
 * Shows only once, can be dismissed, respects user choice
 */
export default function NotificationPromptBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const {
    fcmToken,
    notificationPermission,
    isFCMSupported,
    requestNotificationPermission,
    isUpdatingToken,
  } = useFirebaseNotifications();

  useEffect(() => {
    // Only show if:
    // 1. FCM is supported
    // 2. User hasn't enabled notifications yet
    // 3. User hasn't dismissed the banner before
    // 4. Permission is still "default" (not denied)
    const hasSeenPrompt = localStorage.getItem("notification-prompt-dismissed");
    const shouldShow =
      isFCMSupported &&
      !fcmToken &&
      notificationPermission === "default" &&
      !hasSeenPrompt;

    setShowBanner(shouldShow);
  }, [fcmToken, notificationPermission, isFCMSupported]);

  const handleEnableNotifications = async () => {
    const success = await requestNotificationPermission();
    if (success) {
      setShowBanner(false);
      localStorage.setItem("notification-prompt-dismissed", "true");
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("notification-prompt-dismissed", "true");
  };

  if (!showBanner) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="flex-shrink-0 mt-0.5">
            <Bell className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Stay Updated with Notifications
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              Get instant updates on new posts, comments, connections, and events. Never miss important updates from your network.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleEnableNotifications}
                disabled={isUpdatingToken}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingToken ? "Enabling..." : "Enable Notifications"}
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss notification prompt"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
