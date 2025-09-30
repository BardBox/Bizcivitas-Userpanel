// store/api/notificationApi.ts
import { baseApi } from "./baseApi";

export interface Notification {
  _id: string;
  userId: string;
  messageTitle: string;
  messageBody: string;
  type: string;
  action?: string;
  isUnread: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

interface NotificationsResponse {
  unread: Notification[];
  read: Notification[];
  unreadCount: number;
  readCount: number;
  totalCount: number;
}

// Inject notification endpoints into baseApi
export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all notifications (read and unread)
    getAllNotifications: builder.query<NotificationsResponse, void>({
      query: () => "/notifications/getAll",
      providesTags: ["Notification"],
      transformResponse: (response: ApiResponse<NotificationsResponse>) =>
        response.data,
    }),

    // Get only unread notifications
    getUnreadNotifications: builder.query<
      { notifications: Notification[]; count: number },
      void
    >({
      query: () => "/notifications/getUnread",
      providesTags: ["Notification"],
      transformResponse: (
        response: ApiResponse<{ notifications: Notification[]; count: number }>
      ) => response.data,
    }),

    // Mark a specific notification as read
    markNotificationAsRead: builder.mutation<Notification, string>({
      query: (notificationId) => ({
        url: `/notifications/markRead/${notificationId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
      transformResponse: (
        response: ApiResponse<{ notification: Notification }>
      ) => response.data.notification,
    }),

    // Mark all notifications as read
    markAllNotificationsAsRead: builder.mutation<
      { modifiedCount: number },
      void
    >({
      query: () => ({
        url: "/notifications/markAllRead",
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
      transformResponse: (response: ApiResponse<{ modifiedCount: number }>) =>
        response.data,
    }),

    // Delete a specific notification
    deleteNotification: builder.mutation<{ notificationId: string }, string>({
      query: (notificationId) => ({
        url: `/notifications/delete/${notificationId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
      transformResponse: (response: ApiResponse<{ notificationId: string }>) =>
        response.data,
    }),

    // Delete all notifications
    deleteAllNotifications: builder.mutation<{ deletedCount: number }, void>({
      query: () => ({
        url: "/notifications/deleteAll",
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
      transformResponse: (response: ApiResponse<{ deletedCount: number }>) =>
        response.data,
    }),

    // Update FCM token
    updateFcmToken: builder.mutation<
      { fcmTokens: string[] },
      { fcmToken: string }
    >({
      query: (data) => ({
        url: "/notifications/updateFcmToken",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<{ fcmTokens: string[] }>) =>
        response.data,
    }),

    // Send notification to specific user
    sendNotificationToUser: builder.mutation<
      any,
      {
        userId: string;
        messageTitle: string;
        messageBody: string;
        type: string;
      }
    >({
      query: (data) => ({
        url: "/notifications/sendToUser",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<any>) => response.data,
    }),

    // Send notification to all users
    sendNotificationToAll: builder.mutation<
      any,
      {
        messageTitle: string;
        messageBody: string;
        type: string;
      }
    >({
      query: (data) => ({
        url: "/notifications/sendToAll",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<any>) => response.data,
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetAllNotificationsQuery,
  useGetUnreadNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllNotificationsMutation,
  useUpdateFcmTokenMutation,
  useSendNotificationToUserMutation,
  useSendNotificationToAllMutation,
} = notificationApi;
