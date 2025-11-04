/**
 * Central API Export Point
 *
 * This file re-exports all API hooks and utilities from domain-specific API files.
 * Import from here for a clean, organized approach:
 *
 * @example
 * import { useGetCurrentUserQuery, useGetConnectionsQuery } from '@/store/api'
 */

// ============================================
// BASE API
// ============================================
export { baseApi } from "./baseApi";

// ============================================
// PROFILE API (User & Profile Operations)
// ============================================
export {
  profileApi,
  // Queries
  useGetCurrentUserQuery,
  useGetFullProfileQuery,
  // Mutations - Profile Updates
  useUpdateProfileMutation,
  useUpdateProfessionDetailsMutation,
  useUpdatePersonalDetailsMutation,
  // Mutations - Bio & Skills
  useUpdateMyBioMutation,
  useUpdateMySkillsMutation,
  useEndorseSkillMutation,
  // Mutations - Additional Details
  useUpdateTravelDiaryMutation,
  useUpdateContactDetailsMutation,
  useUpdateAddressDetailsMutation,
  // Auth
  useLogoutMutation,
  // Utilities
  getUserFullName,
} from "./profileApi";

// ============================================
// CONNECTIONS API (Connection Management)
// ============================================
export {
  connectionsApi,
  // Queries
  useGetConnectionsQuery,
  useGetConnectionProfileQuery,
  useGetConnectionRequestsQuery,
  useGetSuggestionsAllQuery,
  useSearchUsersQuery,
  useLazySearchUsersQuery,
  // Mutations
  useSendConnectionRequestMutation,
  useAcceptConnectionRequestMutation,
  useDeleteConnectionMutation,
} from "./connectionsApi";
export type { UserSearchParams } from "./connectionsApi";

// ============================================
// EVENTS API (Event Management) - Using Latest Backend Schema
// ============================================
export {
  eventsApiLatest as eventsApi,
  // Queries
  useGetAllEventsQuery,
  useGetEventByIdQuery,
  useGetUserEventsQuery,
  useGetPastEventsQuery,
  useGetUserCommunityEventsQuery,
  // Mutations
  useJoinEventMutation,
  useLeaveEventMutation,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} from "./eventsApi.latest";

// ============================================
// NOTIFICATION API (Notification Management)
// ============================================
export {
  notificationApi,
  // Queries
  useGetAllNotificationsQuery,
  useGetUnreadNotificationsQuery,
  // Mutations
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllNotificationsMutation,
  useUpdateFcmTokenMutation,
  useSendNotificationToUserMutation,
  useSendNotificationToAllMutation,
} from "./notificationApi";

// ============================================
// TYPES (Re-export for convenience)
// ============================================
export type { User, FullProfile, ApiResponse } from "../../types/user.types";
export type {
  ConnectionActionPayload,
  ConnectionRequest,
  ConnectionRequestsApiResponse,
} from "../../types/connection.types";
export type {
  MongoEvent,
  PopulatedMongoEvent,
  FrontendEvent,
  EventFilters,
} from "../../types/mongoEvent.types";
export type { Notification } from "./notificationApi";
