import { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast"; // You can replace this with your preferred toast library
import { requestForToken, messaging } from "@/lib/firebase";
import { useUpdateFcmTokenMutation } from "../../store/api/notificationApi";

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

  // Check if FCM is supported
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      messaging
    ) {
      setIsFCMSupported(true);
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Initialize FCM and get token
  const initializeFCM = useCallback(async () => {
    if (!isFCMSupported) {
      return null;
    }

    try {
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

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!isFCMSupported) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === "granted") {
        const token = await initializeFCM();
        return !!token;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, [isFCMSupported, initializeFCM]);

  // Handle foreground messages
  useEffect(() => {
    if (!isFCMSupported || !messaging) return;

    let unsubscribe: (() => void) | null = null;

    const setupMessageListener = async () => {
      try {
        const { onMessage } = await import("firebase/messaging");

        if (messaging) {
          unsubscribe = onMessage(messaging, (payload: { notification?: { title?: string; body?: string; click_action?: string }; data?: Record<string, unknown> }) => {
            const notification = payload.notification;
            const data = payload.data;

            // Show toast notification for foreground messages
            if (notification) {
              // Simple toast notification without complex JSX
              toast.success(`${notification.title}\n${notification.body}`, {
                duration: 5000,
                position: "top-right",
                icon: "🔔",
              });

              // Handle click action if provided
              if (notification.click_action || data?.click_action) {
                const clickAction =
                  notification.click_action || data?.click_action;
                // You can add navigation logic here based on click_action
              }
            }
          });
        }
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
  }, [isFCMSupported]);

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
        initializeFCM();
      }
    }
  }, [notificationPermission, fcmToken, initializeFCM, updateFcmToken]);

  // Clear token when user logs out or denies permission
  const clearFCMToken = useCallback(() => {
    setFcmToken(null);
    localStorage.removeItem("fcmToken");
  }, []);

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
