/**
 * Firebase Notifications Hook
 *
 * PERFORMANCE OPTIMIZATION:
 * - Works with lazy-loaded Firebase SDK
 * - Only loads Firebase when user actually enables notifications
 * - Checks FCM support without loading the full SDK
 */

import { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { requestForToken, getMessagingInstance } from "@/lib/firebase";
import {
  useUpdateFcmTokenMutation,
  useRemoveFcmTokenMutation,
} from "../../store/api/notificationApi";

export interface FCMNotification {
  title?: string;
  body?: string;
  icon?: string;
  click_action?: string;
  data?: Record<string, unknown>;
}

export const useFirebaseNotifications = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");
  const [isFCMSupported, setIsFCMSupported] = useState<boolean>(false);
  const [updateFcmToken, { isLoading: isUpdatingToken }] =
    useUpdateFcmTokenMutation();
  const [removeFcmToken] = useRemoveFcmTokenMutation();

  // ✅ PERFORMANCE FIX: Check FCM support without loading Firebase SDK
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "Notification" in window &&
      typeof Notification?.requestPermission === "function"
    ) {
      // Only set as supported if both Service Worker and Notification API are present
      setIsFCMSupported(true);
      setNotificationPermission(Notification.permission);
    } else {
      setIsFCMSupported(false);
    }
  }, []);

  // Initialize FCM and get token (lazy loads Firebase)
  const initializeFCM = useCallback(async () => {
    if (!isFCMSupported) {
      return null;
    }

    try {
      // ✅ This will lazy load Firebase SDK only when called
      const token = await requestForToken();
      if (token) {
        setFcmToken(token);

        // Store token in localStorage for persistence
        localStorage.setItem("fcmToken", token);

        // Update token in backend via RTK Query
        await updateFcmToken({ fcmToken: token }).unwrap();

        return token;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error initializing FCM:", error);
      return null;
    }
  }, [isFCMSupported, updateFcmToken]);

  // Request notification permission (lazy loads Firebase)
  const requestNotificationPermission = useCallback(async () => {
    // Basic check before loading Firebase
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === "granted") {
        // ✅ Firebase is loaded here only when user grants permission
        const token = await initializeFCM();
        return !!token;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, [initializeFCM]);

  // Handle foreground messages (lazy loads Firebase messaging listener)
  useEffect(() => {
    if (!isFCMSupported || notificationPermission !== "granted") return;

    let unsubscribe: (() => void) | null = null;

    const setupMessageListener = async () => {
      try {
        // ✅ Lazy load Firebase messaging instance
        const messagingInstance = await getMessagingInstance();
        if (!messagingInstance) return;

        // ✅ Lazy load onMessage from Firebase
        const { onMessage } = await import("firebase/messaging");

        unsubscribe = onMessage(
          messagingInstance,
          (payload: {
            notification?: {
              title?: string;
              body?: string;
              click_action?: string;
            };
            data?: Record<string, unknown>;
          }) => {
            const notification = payload.notification;
            const data = payload.data;

            // Show toast notification for foreground messages
            if (notification) {
              toast.success(`${notification.title}\n${notification.body}`, {
                duration: 5000,
                position: "top-right",
                icon: "🔔",
                // Optionally, add onClick handler if you want to handle click navigation in the future
              });

              // Minimal type-safe click_action handler
              const clickAction =
                notification.click_action || data?.click_action;
              if (
                typeof clickAction === "string" &&
                clickAction.trim().length > 0
              ) {
                // Optionally, validate as URL or path
                // For now, open in new tab if it looks like a URL or path
                // You may want to restrict to http(s) or app routes only
                const isValidUrl =
                  /^https?:\/\//.test(clickAction) ||
                  clickAction.startsWith("/");
                if (isValidUrl) {
                  window.open(clickAction, "_blank", "noopener,noreferrer");
                }
              }
            }
          }
        );
      } catch (error) {
        console.error("Error setting up message listener:", error);
      }
    };

    setupMessageListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isFCMSupported, notificationPermission]);

  // Initialize FCM on component mount if permission is already granted
  useEffect(() => {
    if (notificationPermission === "granted" && !fcmToken) {
      // Check if we have a stored token first
      const storedToken = localStorage.getItem("fcmToken");
      if (storedToken) {
        setFcmToken(storedToken);
        // Verify token is still valid by updating it in backend
        updateFcmToken({ fcmToken: storedToken }).catch(console.error);
      } else {
        // ✅ Firebase will be lazy loaded here only if needed
        initializeFCM();
      }
    }
  }, [notificationPermission, fcmToken, initializeFCM, updateFcmToken]);

  // Clear token when user logs out or denies permission
  const clearFCMToken = useCallback(async () => {
    const currentToken = fcmToken || localStorage.getItem("fcmToken");

    // Remove token from backend if it exists
    if (currentToken) {
      try {
        await removeFcmToken({ fcmToken: currentToken }).unwrap();
        console.log("FCM token removed from backend");
      } catch (error) {
        console.error("Failed to remove FCM token from backend:", error);
      }
    }

    // Clear local state and storage
    setFcmToken(null);
    localStorage.removeItem("fcmToken");
  }, [fcmToken, removeFcmToken]);

  return {
    fcmToken,
    notificationPermission,
    isFCMSupported,
    isUpdatingToken,
    requestNotificationPermission,
    initializeFCM,
    clearFCMToken,
  };
};
