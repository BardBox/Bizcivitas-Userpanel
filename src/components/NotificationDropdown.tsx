"use client";

/**
 * NotificationDropdown Component - API-Only Approach
 *
 * IMPLEMENTATION:
 * - Uses on-demand fetching: only refetches when dropdown opens
 * - No polling intervals to reduce server load
 * - No FCM/push notifications (in-app notifications only)
 * - Smart navigation based on notification metadata and type
 * - Marks notifications as read automatically on click
 */

import React, { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  useDeleteNotificationMutation,
  useGetUnreadNotificationsQuery,
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
} from "../../store/api/notificationApi";
// FCM disabled - using API-only approach for in-app notifications
// import { useFirebaseNotifications } from "@/hooks/useFirebaseNotifications";

interface UserNotification {
  _id: string;
  messageTitle: string;
  messageBody: string;
  type: string;
  action?: string;
  metadata?: {
    postId?: string;
    wallFeedId?: string;
    postType?: 'bizhub' | 'bizpulse';
    eventIds?: string[];
    meetingIds?: string[];
    meetupIds?: string[];
    senderId?: string;
    receiverId?: string;
    connectionStatus?: string;
    commentId?: string;
    chatId?: string;
    messageId?: string;
    collectionId?: string;
    mediaId?: string;
    collectionType?: string;
    suggestedUserId?: string;
  };
  createdAt: string;
}

interface NotificationDropdownProps {
  className?: string;
}

export default function NotificationDropdown({
  className = "",
}: NotificationDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // RTK Query hooks - No polling, refetch only when needed
  const {
    data: unreadData,
    isLoading,
    refetch,
  } = useGetUnreadNotificationsQuery(undefined, {
    skip: !isMounted,
    // ✅ PERFORMANCE FIX: Removed pollingInterval to eliminate constant API requests
    // Firebase real-time notifications will trigger refetch when new notifications arrive
  });

  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  // Firebase notifications hook - DISABLED (using API-only approach)
  // const {
  //   fcmToken,
  //   notificationPermission,
  //   isFCMSupported,
  //   requestNotificationPermission,
  // } = useFirebaseNotifications();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ✅ PERFORMANCE FIX: Refetch when dropdown opens (user-initiated action)
  useEffect(() => {
    if (isOpen && isMounted) {
      refetch();
    }
  }, [isOpen, isMounted, refetch]);

  // FCM real-time listener - DISABLED (using API-only approach)
  // useEffect(() => {
  //   if (!isFCMSupported || !isMounted) return;
  //   // ... FCM listener code
  // }, [isFCMSupported, isMounted, fcmToken, notificationPermission, refetch]);

  const notifications = unreadData?.notifications || [];
  const unreadCount = unreadData?.count || 0;

  const handleNotificationClick = async (notification: UserNotification) => {
    try {
      // Close dropdown immediately when notification is clicked
      setIsOpen(false);

      await markAsRead(notification._id).unwrap();

      // Smart navigation based on notification metadata
      if (notification.metadata) {
        // ⚠️ IMPORTANT: Check for poll notifications FIRST before generic post checks
        // Poll notifications - Navigate to BizPulse and highlight specific poll
        const messageBody = notification.messageBody.toLowerCase();
        const messageTitle = notification.messageTitle.toLowerCase();
        const isPoll =
          notification.type === "poll" ||
          messageBody.includes("poll") ||
          messageTitle.includes("poll") ||
          messageBody.includes("pulse poll") ||
          messageTitle.includes("pulse poll");

        if (isPoll && (notification.metadata.postId || notification.metadata.wallFeedId)) {
          // Store poll ID in session storage
          const pollId = notification.metadata.postId || notification.metadata.wallFeedId;
          if (pollId) {
            sessionStorage.setItem('highlightPollId', pollId);
          }
          router.push("/feeds/biz-pulse");
          return;
        }

        // Post notification - use backend-provided postType
        if (notification.metadata.postId) {
          // Use postType from backend, default to bizhub if not specified
          const postType = notification.metadata.postType || 'bizhub';
          const postId = notification.metadata.postId;

          console.log('🔔 Post Notification:', {
            postId,
            postType,
            notificationType: notification.type,
            hasCommentId: !!notification.metadata.commentId
          });

          const url = postType === 'bizpulse'
            ? `/feeds/biz-pulse/${postId}`
            : `/feeds/biz-hub/${postId}`;

          // If notification is about a comment, store scroll intent in session storage
          if (notification.metadata.commentId) {
            sessionStorage.setItem('scrollToComments', 'true');
          }

          console.log('🔔 Navigating to:', url);
          router.push(url);
          return;
        }

        // Wall Feed notification - use backend-provided postType
        if (notification.metadata.wallFeedId) {
          // Use postType from backend, default to bizhub if not specified
          const postType = notification.metadata.postType || 'bizhub';
          const wallFeedId = notification.metadata.wallFeedId;

          console.log('🔔 WallFeed Notification:', {
            wallFeedId,
            postType,
            notificationType: notification.type,
            hasCommentId: !!notification.metadata.commentId
          });

          const url = postType === 'bizpulse'
            ? `/feeds/biz-pulse/${wallFeedId}`
            : `/feeds/biz-hub/${wallFeedId}`;

          // If notification is about a comment, store scroll intent in session storage
          if (notification.metadata.commentId) {
            sessionStorage.setItem('scrollToComments', 'true');
          }

          console.log('🔔 Navigating to:', url);
          router.push(url);
          return;
        }

        // Event notification - navigate to event detail
        if (notification.metadata.eventIds && notification.metadata.eventIds.length > 0) {
          router.push(`/feeds/events/${notification.metadata.eventIds[0]}`);
          return;
        }

        // Meeting notification - navigate to meetings
        if (notification.metadata.meetingIds && notification.metadata.meetingIds.length > 0) {
          router.push(`/feeds/meetings`);
          return;
        }

        // Meetup notification - navigate to meetups
        if (notification.metadata.meetupIds && notification.metadata.meetupIds.length > 0) {
          router.push(`/feeds/meetups`);
          return;
        }

        // Match/Suggestion notification - navigate to connections page with user ID from member directory
        if (notification.metadata.suggestedUserId) {
          router.push(`/feeds/connections/${notification.metadata.suggestedUserId}?from=member-directory`);
          return;
        }

        // Knowledge Hub Collection notification - delete notification instead of navigating
        if (notification.metadata.collectionId) {
          await deleteNotification(notification._id).unwrap();
          refetch();
          return; // Keep dropdown open, no navigation, no toast
        }
      }

      // Fallback: Navigation based on notification type and message content
      const messageBody = notification.messageBody.toLowerCase();
      const messageTitle = notification.messageTitle.toLowerCase();

      // Knowledge Hub notifications (fallback if no metadata.collectionId) - delete instead of navigating
      if (
        notification.type === "knowledge" ||
        notification.type === "collection" ||
        messageBody.includes("collection") ||
        messageBody.includes("document added") ||
        messageBody.includes("video added") ||
        messageTitle.includes("knowledge hub") ||
        messageTitle.includes("new document") ||
        messageTitle.includes("new video")
      ) {
        await deleteNotification(notification._id).unwrap();
        refetch();
        return; // Keep dropdown open, no navigation, no toast
      }

      // Close dropdown for all other notification types
      setIsOpen(false);

      // Connection notifications - Navigate to Requests > Received tab
      if (notification.type === "connection" || messageBody.includes("connection request")) {
        router.push("/feeds/connections?tab=requests&subtab=received");
        return;
      }

      // Message/Chat notifications - Navigate to specific chat if senderId exists
      if (notification.type === "message" || notification.type === "chat" ||
          messageBody.includes("message") || messageBody.includes("chat")) {
        // If metadata has senderId or chatId, open that specific chat
        if (notification.metadata?.senderId) {
          router.push(`/feeds/messages/${notification.metadata.senderId}`);
        } else if (notification.metadata?.chatId) {
          router.push(`/feeds/messages/${notification.metadata.chatId}`);
        } else {
          // Fallback to messages list
          router.push("/feeds/messages");
        }
        return;
      }

      // Event notifications
      if (notification.type === "event") {
        router.push("/feeds/events");
        return;
      }

      // Membership notifications
      if (notification.type === "membership" || notification.type === "upgrade") {
        router.push("/feeds/membership");
        return;
      }

      // BizWin/TYFCB notifications
      if (messageBody.includes("bizwin") || messageBody.includes("tyfcb")) {
        router.push("/feeds/dash"); // Dashboard with BizWin chart
        return;
      }

      // Referral notifications
      if (messageBody.includes("referral") || messageBody.includes("referral slip")) {
        router.push("/feeds/dash"); // Dashboard with referral chart
        return;
      }

      // Meetup notifications
      if (messageBody.includes("meetup")) {
        router.push("/feeds/dash"); // Dashboard with meetup chart
        return;
      }

      // Skill endorsement notifications - Navigate to user's own profile
      if (
        notification.type === "endorsement" ||
        messageBody.includes("endorsed") ||
        messageBody.includes("endorsement") ||
        messageBody.includes("skill")
      ) {
        router.push("/feeds/myprofile");
        return;
      }

      // Default: navigate to notifications page
      router.push("/feeds/notifications");
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast.error("Failed to process notification");
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

  // FCM notification enabler - DISABLED (not needed for API-only approach)
  // const handleEnableNotifications = async () => {
  //   if (notificationPermission === "denied") {
  //     toast.error(
  //       "Notifications are blocked. Please enable them in your browser settings.",
  //       { duration: 5000 }
  //     );
  //     return;
  //   }
  //   const success = await requestNotificationPermission();
  //   if (success) {
  //     toast.success("Notifications enabled successfully");
  //     refetch();
  //   }
  // };

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

  const handleToggleDropdown = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    // Dispatch custom event to close FloatingDrawer when notification dropdown opens
    if (newIsOpen) {
      console.log("🔔 Notification dropdown opened - dispatching event");
      window.dispatchEvent(new Event("notificationDropdownOpened"));
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleToggleDropdown}
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

              {/* FCM push notification prompt - REMOVED (using API-only approach) */}
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
                    router.push("/feeds/notifications");
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
