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
    postType?: "bizhub" | "bizpulse";
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
  iconPath?: string;
}

export default function NotificationDropdown({
  className = "",
  iconPath = "/Notification.svg",
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

  // Close notification dropdown when user dropdown opens
  useEffect(() => {
    const handleUserDropdownOpened = () => {
      setIsOpen(false);
    };

    window.addEventListener("userDropdownOpened", handleUserDropdownOpened);
    return () => {
      window.removeEventListener(
        "userDropdownOpened",
        handleUserDropdownOpened
      );
    };
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

        if (
          isPoll &&
          (notification.metadata.postId || notification.metadata.wallFeedId)
        ) {
          // Store poll ID in session storage
          const pollId =
            notification.metadata.postId || notification.metadata.wallFeedId;
          if (pollId) {
            sessionStorage.setItem("highlightPollId", pollId);
          }
          router.push("/feeds/biz-pulse");
          return;
        }

        // Post notification - use backend-provided postType
        if (notification.metadata.postId) {
          // Use postType from backend, default to bizhub if not specified
          const postType = notification.metadata.postType || "bizhub";
          const postId = notification.metadata.postId;

          const url =
            postType === "bizpulse"
              ? `/feeds/biz-pulse/${postId}`
              : `/feeds/biz-hub/${postId}`;

          // If notification is about a comment, store scroll intent in session storage
          if (notification.metadata.commentId) {
            sessionStorage.setItem("scrollToComments", "true");
          }

          router.push(url);
          return;
        }

        // Wall Feed notification - use backend-provided postType
        if (notification.metadata.wallFeedId) {
          // Use postType from backend, default to bizhub if not specified
          const postType = notification.metadata.postType || "bizhub";
          const wallFeedId = notification.metadata.wallFeedId;

          const url =
            postType === "bizpulse"
              ? `/feeds/biz-pulse/${wallFeedId}`
              : `/feeds/biz-hub/${wallFeedId}`;

          // If notification is about a comment, store scroll intent in session storage
          if (notification.metadata.commentId) {
            sessionStorage.setItem("scrollToComments", "true");
          }

          router.push(url);
          return;
        }

        // Event notification - navigate to event detail
        if (
          notification.metadata.eventIds &&
          notification.metadata.eventIds.length > 0
        ) {
          router.push(`/feeds/events/${notification.metadata.eventIds[0]}`);
          return;
        }

        // Meeting notification - navigate to meetings
        if (
          notification.metadata.meetingIds &&
          notification.metadata.meetingIds.length > 0
        ) {
          router.push(`/feeds/meetings`);
          return;
        }

        // Meetup notification - navigate to meetups
        if (
          notification.metadata.meetupIds &&
          notification.metadata.meetupIds.length > 0
        ) {
          router.push(`/feeds/meetups`);
          return;
        }

        // Match/Suggestion notification - navigate to connections page with user ID from member directory
        if (notification.metadata.suggestedUserId) {
          router.push(
            `/feeds/connections/${notification.metadata.suggestedUserId}?from=member-directory`
          );
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
      if (
        notification.type === "connection" ||
        messageBody.includes("connection request")
      ) {
        router.push("/feeds/connections?tab=requests&subtab=received");
        return;
      }

      // Message/Chat notifications - Navigate to specific chat if senderId exists
      if (
        notification.type === "message" ||
        notification.type === "chat" ||
        messageBody.includes("message") ||
        messageBody.includes("chat")
      ) {
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
      if (
        notification.type === "membership" ||
        notification.type === "upgrade"
      ) {
        router.push("/feeds/membership");
        return;
      }

      // BizWin/TYFCB notifications
      if (messageBody.includes("bizwin") || messageBody.includes("tyfcb")) {
        router.push("/feeds/dash"); // Dashboard with BizWin chart
        return;
      }

      // Referral notifications
      if (
        messageBody.includes("referral") ||
        messageBody.includes("referral slip")
      ) {
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
    // Return icon background color classes and SVG icon based on type
    switch (type) {
      case "event":
        return {
          bg: "bg-purple-100",
          text: "text-purple-600",
          svg: (
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          ),
        };
      case "message":
        return {
          bg: "bg-blue-100",
          text: "text-blue-600",
          svg: (
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          ),
        };
      case "membership":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-600",
          svg: (
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
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          ),
        };
      case "system":
        return {
          bg: "bg-gray-100",
          text: "text-gray-600",
          svg: (
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          ),
        };
      case "connection":
        return {
          bg: "bg-green-100",
          text: "text-green-600",
          svg: (
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          ),
        };
      default:
        return {
          bg: "bg-blue-100",
          text: "text-blue-600",
          svg: (
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
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          ),
        };
    }
  };

  if (!isMounted) {
    return (
      <button className={className}>
        <img
          src={iconPath}
          alt="Notifications"
          className="!w-[32px] !h-[32px] transition-all hover:drop-shadow-lg"
        />
      </button>
    );
  }

  const handleToggleDropdown = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    // Dispatch custom event for state change
    window.dispatchEvent(
      new CustomEvent("notificationDropdownStateChanged", {
        detail: { isOpen: newIsOpen },
      })
    );

    // Legacy event for backward compatibility (if needed)
    if (newIsOpen) {
      window.dispatchEvent(new Event("notificationDropdownOpened"));
    }
  };

  const closeDropdown = () => {
    setIsOpen(false);
    window.dispatchEvent(
      new CustomEvent("notificationDropdownStateChanged", {
        detail: { isOpen: false },
      })
    );
  };

  return (
    <div className={`relative ${className}`}>
      <button onClick={handleToggleDropdown} className="relative">
        <img
          src={iconPath}
          alt="Notifications"
          className="!w-[32px] !h-[32px] transition-all hover:drop-shadow-lg"
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
            onClick={closeDropdown}
          />

          {/* Dropdown */}
          <div className="fixed left-4 right-4 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 bg-white rounded-lg shadow-lg border z-50 max-h-[calc(100vh-5rem)] sm:max-h-96 overflow-hidden">
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
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    Loading notifications...
                  </p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    No new notifications
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    You're all caught up!
                  </p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const iconData = getNotificationIcon(notification.type);
                  return (
                    <div
                      key={notification._id}
                      className="p-3 border-b border-gray-100 hover:bg-blue-50/50 cursor-pointer group transition-colors"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-full ${iconData.bg} flex items-center justify-center flex-shrink-0`}
                        >
                          <span className={iconData.text}>{iconData.svg}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {notification.messageTitle}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-0.5">
                            {notification.messageBody}
                          </p>
                          <p className="text-xs text-gray-400 mt-1.5">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                        <button
                          onClick={(e) =>
                            handleDeleteNotification(notification._id, e)
                          }
                          className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full hover:bg-red-100 flex items-center justify-center text-gray-400 hover:text-red-600 transition-all"
                          title="Delete notification"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t bg-gray-50">
                <button
                  onClick={() => {
                    closeDropdown();
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
