"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  useDeleteNotificationMutation,
  useGetUnreadNotificationsQuery,
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
} from "../../store/api/notificationApi";
import { useFirebaseNotifications } from "@/hooks/useFirebaseNotifications";

interface UserNotification {
  _id: string;
  messageTitle: string;
  messageBody: string;
  type: string;
  action?: string;
  createdAt: string;
}

interface NotificationDropdownProps {
  className?: string;
}

export default function NotificationDropdown({
  className = "",
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // RTK Query hooks
  const {
    data: unreadData,
    isLoading,
    refetch,
  } = useGetUnreadNotificationsQuery(undefined, {
    skip: !isMounted,
    pollingInterval: 30000, // Poll every 30 seconds for new notifications
  });

  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  // Firebase notifications hook
  const {
    fcmToken,
    notificationPermission,
    isFCMSupported,
    requestNotificationPermission,
  } = useFirebaseNotifications();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const notifications = unreadData?.notifications || [];
  const unreadCount = unreadData?.count || 0;

  const handleNotificationClick = async (notification: UserNotification) => {
    try {
      await markAsRead(notification._id).unwrap();

      // Handle notification action if present
      if (notification.action) {
        // You can add navigation logic here based on notification.action
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const handleDeleteNotification = async (
    notificationId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    try {
      await deleteNotification(notificationId).unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleEnableNotifications = async () => {
    if (notificationPermission === "denied") {
      alert(
        "Notifications are blocked. Please enable them in your browser settings."
      );
      return;
    }

    const success = await requestNotificationPermission();
    if (success) {
      refetch();
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "event":
        return "📅";
      case "message":
        return "💬";
      case "membership":
        return "👑";
      case "system":
        return "⚙️";
      default:
        return "🔔";
    }
  };

  if (!isMounted) {
    return (
      <button
        className={`text-white hover:bg-blue-600 rounded-lg transition-colors ${className}`}
      >
        <Image
          src="/dashboard/sidebaricons/notification.svg"
          width={24}
          height={24}
          alt="Notification Icon"
          className="object-contain"
          style={{ width: "40px", height: "40px" }}
        />
      </button>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-white hover:bg-blue-600 rounded-lg transition-colors relative"
      >
        <Image
          src="/dashboard/sidebaricons/notification.svg"
          width={24}
          height={24}
          alt="Notification Icon"
          className="object-contain"
          style={{ width: "40px", height: "40px" }}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-20 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Enable notifications prompt */}
              {isFCMSupported && notificationPermission !== "granted" && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-xs text-yellow-800">
                    Enable push notifications to stay updated
                  </p>
                  <button
                    onClick={handleEnableNotifications}
                    className="text-xs text-yellow-600 hover:text-yellow-800 underline"
                  >
                    Enable now
                  </button>
                </div>
              )}
            </div>

            {/* Notifications list */}
            <div className="max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="text-4xl mb-2">🔔</div>
                  <p>No new notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer group"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-lg">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.messageTitle}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {notification.messageBody}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={(e) =>
                          handleDeleteNotification(notification._id, e)
                        }
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t bg-gray-50">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    // Navigate to notifications page if you have one
                  }}
                  className="w-full text-sm text-blue-600 hover:text-blue-800"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
