"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  useGetAllNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllNotificationsMutation,
} from "../../../../store/api/notificationApi";

interface Notification {
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
  isUnread: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  // RTK Query hooks
  const { data, isLoading, refetch } = useGetAllNotificationsQuery();
  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  const [deleteAllNotifications] = useDeleteAllNotificationsMutation();

  const allNotifications = [
    ...(data?.unread || []),
    ...(data?.read || []),
  ].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const displayNotifications =
    activeTab === "unread" ? data?.unread || [] : allNotifications;

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (notification.isUnread) {
        await markAsRead(notification._id).unwrap();
      }

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
          const url = postType === 'bizpulse'
            ? `/feeds/biz-pulse/${notification.metadata.postId}`
            : `/feeds/biz-hub/${notification.metadata.postId}`;

          // If notification is about a comment, store scroll intent in session storage
          if (notification.metadata.commentId) {
            sessionStorage.setItem('scrollToComments', 'true');
          }

          router.push(url);
          return;
        }

        // Wall Feed notification - use backend-provided postType
        if (notification.metadata.wallFeedId) {
          // Use postType from backend, default to bizhub if not specified
          const postType = notification.metadata.postType || 'bizhub';
          const url = postType === 'bizpulse'
            ? `/feeds/biz-pulse/${notification.metadata.wallFeedId}`
            : `/feeds/biz-hub/${notification.metadata.wallFeedId}`;

          // If notification is about a comment, store scroll intent in session storage
          if (notification.metadata.commentId) {
            sessionStorage.setItem('scrollToComments', 'true');
          }

          router.push(url);
          return;
        }

        // Event notification
        if (
          notification.metadata.eventIds &&
          notification.metadata.eventIds.length > 0
        ) {
          router.push(`/feeds/events/${notification.metadata.eventIds[0]}`);
          return;
        }

        // Meeting notification
        if (
          notification.metadata.meetingIds &&
          notification.metadata.meetingIds.length > 0
        ) {
          router.push(`/feeds/meetings`);
          return;
        }

        // Meetup notification
        if (
          notification.metadata.meetupIds &&
          notification.metadata.meetupIds.length > 0
        ) {
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
          return; // No navigation, no toast
        }
      }

      // Fallback: Navigation based on notification type and message content
      const messageBody = notification.messageBody.toLowerCase();

      // Knowledge Hub notifications (fallback if no metadata.collectionId) - delete instead of navigating
      if (
        notification.type === "knowledge" ||
        notification.type === "collection" ||
        messageBody.includes("collection") ||
        messageBody.includes("document added") ||
        messageBody.includes("video added") ||
        notification.messageTitle.toLowerCase().includes("knowledge hub") ||
        notification.messageTitle.toLowerCase().includes("new document") ||
        notification.messageTitle.toLowerCase().includes("new video")
      ) {
        await deleteNotification(notification._id).unwrap();
        refetch();
        return; // No navigation, no toast
      }

      if (
        notification.type === "connection" ||
        messageBody.includes("connection request")
      ) {
        router.push("/feeds/connections?tab=requests&subtab=received");
        return;
      }

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

      if (notification.type === "event") {
        router.push("/feeds/events");
        return;
      }

      if (
        notification.type === "membership" ||
        notification.type === "upgrade"
      ) {
        router.push("/feeds/membership");
        return;
      }

      if (messageBody.includes("bizwin") || messageBody.includes("tyfcb")) {
        router.push("/feeds/dash");
        return;
      }

      if (
        messageBody.includes("referral") ||
        messageBody.includes("referral slip")
      ) {
        router.push("/feeds/dash");
        return;
      }

      if (messageBody.includes("meetup")) {
        router.push("/feeds/dash");
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
    } catch (error) {
      console.error("Failed to process notification:", error);
      toast.error("Failed to process notification");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      toast.success("All notifications marked as read");
      refetch();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const handleDeleteNotification = async (
    notificationId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    try {
      await deleteNotification(notificationId).unwrap();
      toast.success("Notification deleted");
      refetch();
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Are you sure you want to delete all notifications?")) {
      return;
    }

    try {
      await deleteAllNotifications().unwrap();
      toast.success("All notifications deleted");
      refetch();
    } catch (error) {
      console.error("Failed to delete all notifications:", error);
      toast.error("Failed to delete all notifications");
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "connection":
        return "🤝";
      case "event":
        return "📅";
      case "message":
      case "chat":
        return "💬";
      case "post":
        return "📝";
      case "wallFeed":
        return "📢";
      case "membership":
      case "upgrade":
        return "👑";
      case "meeting":
        return "🏢";
      case "meetup":
        return "👥";
      default:
        return "🔔";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab("all")}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "all"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              All ({data?.totalCount || 0})
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "unread"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Unread ({data?.unreadCount || 0})
            </button>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      {displayNotifications.length > 0 && (
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {displayNotifications.length} notification
                {displayNotifications.length !== 1 ? "s" : ""}
              </div>
              <div className="flex items-center space-x-3">
                {data && data.unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Mark all as read
                  </button>
                )}
                <button
                  onClick={handleDeleteAll}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Delete all
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        {isLoading ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading notifications...</p>
          </div>
        ) : displayNotifications.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activeTab === "unread"
                ? "No unread notifications"
                : "No notifications"}
            </h3>
            <p className="text-gray-600">
              {activeTab === "unread"
                ? "All caught up! Check back later for updates."
                : "You'll see notifications here when you get them."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayNotifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`bg-white rounded-lg p-4 cursor-pointer hover:shadow-md transition-all group ${
                  notification.isUnread ? "border-l-4 border-blue-600" : ""
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`text-sm font-medium ${
                            notification.isUnread
                              ? "text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {notification.messageTitle}
                        </h4>
                        <p
                          className={`text-sm mt-1 ${
                            notification.isUnread
                              ? "text-gray-700"
                              : "text-gray-600"
                          }`}
                        >
                          {notification.messageBody}
                        </p>
                        <div className="flex items-center mt-2 space-x-3">
                          <span className="text-xs text-gray-400">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          {notification.isUnread && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              New
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={(e) =>
                          handleDeleteNotification(notification._id, e)
                        }
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity ml-2"
                        title="Delete notification"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
