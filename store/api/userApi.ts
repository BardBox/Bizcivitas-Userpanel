/**
 * @deprecated This file is deprecated and will be removed in a future version.
 *
 * ⚠️ DO NOT USE THIS FILE FOR NEW CODE ⚠️
 *
 * This file has been split into domain-specific API files for better organization:
 *
 * - Profile Operations: Use `@/store/api/profileApi` or `@/store/api`
 *   (getCurrentUser, getFullProfile, updateProfile, updatePersonalDetails,
 *    updateProfessionDetails, updateMyBio, updateMySkills, updateTravelDiary,
 *    updateContactDetails, updateAddressDetails, endorseSkill, logout)
 *
 * - Connection Operations: Use `@/store/api/connectionsApi` or `@/store/api`
 *   (getConnections, getConnectionProfile, getConnectionRequests, getSuggestionsAll,
 *    sendConnectionRequest, acceptConnectionRequest, deleteConnection)
 *
 * Migration Example:
 *
 * Before:
 * import { useGetCurrentUserQuery, useGetConnectionsQuery } from '@/store/api/userApi'
 *
 * After:
 * import { useGetCurrentUserQuery, useGetConnectionsQuery } from '@/store/api'
 *
 * All exports are re-exported from the central index file for convenience.
 */

import { baseApi } from "./baseApi";
import { User, FullProfile, ApiResponse } from "../../types/user.types";
import {
  ConnectionActionPayload,
  ConnectionRequest,
  ConnectionRequestsApiResponse,
} from "../../types/connection.types";

// Re-export types for backward compatibility
export type { User, FullProfile, ApiResponse };

// Mutation response types for improved type safety
interface ProfileUpdateResponse {
  success: boolean;
  message: string;
  companyLogo?: string; // Company logo URL returned after upload
  data?: {
    profile?: FullProfile;
  };
}

interface BioDetailsResponse {
  success: boolean;
  message: string;
  data?: {
    myBio?: {
      hobbiesAndInterests?: string;
      myBurningDesireIsTo?: string;
    };
    mySkillItems?: Array<{ _id: string; name: string; score: number }>;
  };
}

interface SkillsUpdateResponse {
  success: boolean;
  message: string;
  data?: {
    mySkillItems?: Array<{ _id: string; name: string; score: number }>;
  };
}

interface TravelDiaryResponse {
  success: boolean;
  message: string;
  data?: {
    travelDiary?: Array<{
      _id: string;
      destination: string;
      date: string;
      notes?: string;
    }>;
  };
}

interface ContactDetailsResponse {
  success: boolean;
  message: string;
  data?: {
    contact?: {
      personal?: string;
      professional?: string;
      email?: string;
      website?: string;
    };
  };
}

interface AddressDetailsResponse {
  success: boolean;
  message: string;
  data?: {
    addresses?: Array<{
      _id: string;
      type: string;
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    }>;
  };
}

interface PersonalDetailsResponse {
  success: boolean;
  message: string;
  data?: {
    fname?: string;
    lname?: string;
    dateOfBirth?: string;
    gender?: string;
  };
}

interface EndorseSkillResponse {
  success: boolean;
  message: string;
  data?: {
    skill?: {
      _id: string;
      name: string;
      score: number;
    };
  };
}

interface ConnectionActionResponse {
  success: boolean;
  message: string;
  data?: {
    connectionId?: string;
    status?: string;
  };
}

// Inject user endpoints into baseApi
export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentUser: builder.query<User, void>({
      query: () => "/users/get-user",
      providesTags: ["User"],
      transformResponse: (response: ApiResponse<User>) => response.data,
    }),
    getFullProfile: builder.query<FullProfile, void>({
      query: () => "/profiles/getProfile",
      providesTags: ["Profile"],
      transformResponse: (response: ApiResponse<FullProfile>) => response.data,
    }),
    updateProfile: builder.mutation<User, Partial<User> | FormData>({
      query: (data) => ({
        url: "/profiles/userDetails",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["User", "Profile"],
      transformResponse: (response: ApiResponse<User>) => response.data,
    }),
    updateProfessionDetails: builder.mutation<
      ProfileUpdateResponse,
      FormData | object
    >({
      query: (data) => ({
        url: "/profiles/professionalDetails",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Profile"],
    }),
    updateMyBio: builder.mutation<BioDetailsResponse, object>({
      query: (data) => ({
        url: "/profiles/bioDetails",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Profile"],
    }),
    updateMySkills: builder.mutation<
      SkillsUpdateResponse,
      {
        mySkillItems: Array<{
          _id?: string;
          name?: string;
        }>;
      }
    >({
      query: (data) => ({
        url: "/profiles/bioDetails",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Profile"],
    }),
    updateTravelDiary: builder.mutation<TravelDiaryResponse, object>({
      query: (data) => ({
        url: "/profiles/travelDiary",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Profile"],
    }),
    updateContactDetails: builder.mutation<ContactDetailsResponse, object>({
      query: (data) => ({
        url: "/profiles/contactDetails",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Profile"],
    }),
    updateAddressDetails: builder.mutation<AddressDetailsResponse, object>({
      query: (data) => ({
        url: "/profiles/addressesDetails",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Profile"],
    }),
    updatePersonalDetails: builder.mutation<PersonalDetailsResponse, object>({
      query: (data) => ({
        url: "/profiles/personalDetails",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Profile", "User"],
    }),
    endorseSkill: builder.mutation<
      EndorseSkillResponse,
      { skillId: string; targetUserId: string }
    >({
      query: ({ skillId, targetUserId }) => ({
        url: `/profiles/skills/${skillId}/increment`,
        method: "POST",
        body: { targetUserId },
      }),
      invalidatesTags: (_, __, { targetUserId }) => [
        { type: "Profile", id: targetUserId },
        "Profile",
      ],
    }),
    getConnections: builder.query<User[], void>({
      query: () => "/connections",
      providesTags: ["Connections"],
      transformResponse: (response: any) => {
        // Handle the actual API response structure: { data: { connections: [...] } }
        if (
          response?.data?.connections &&
          Array.isArray(response.data.connections)
        ) {
          return response.data.connections;
        } else if (response?.data && Array.isArray(response.data)) {
          return response.data;
        } else if (Array.isArray(response)) {
          return response;
        } else {
          return [];
        }
      },
    }),
    getConnectionProfile: builder.query<any, string>({
      query: (userId) => `/connections/user/${userId}`,
      providesTags: (_, __, userId) => [{ type: "Profile", id: userId }],
      transformResponse: (response: any) => {
        // Handle the specific response structure: { data: { userDetails: {...} } }
        if (response?.data?.userDetails) {
          return response.data.userDetails;
        } else if (response?.data) {
          return response.data;
        } else if (response) {
          return response;
        } else {
          return null;
        }
      },
    }),
    deleteConnection: builder.mutation<
      ConnectionActionResponse,
      ConnectionActionPayload
    >({
      query: (data) => ({
        url: "/connections/delete-connection",
        method: "DELETE",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["Connections", "Profile"],
    }),
    sendConnectionRequest: builder.mutation<
      ConnectionActionResponse,
      ConnectionRequest
    >({
      query: (data) => ({
        url: "/connections/send-request",
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["Connections", "Profile"],
    }),
    acceptConnectionRequest: builder.mutation<
      ConnectionActionResponse,
      ConnectionActionPayload
    >({
      query: (data) => ({
        url: "/connections/accept-request",
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["Connections", "Profile"],
    }),
    logout: builder.mutation<{ message: string }, { fcmToken: string }>({
      query: (data) => ({
        url: "/users/logout",
        method: "PATCH",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["User", "Profile"],
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data,
    }),
    getSuggestionsAll: builder.query<any, void>({
      query: () => "/connections/getSuggestionsAll",
      providesTags: ["Connections"],
      transformResponse: (response: any) => {
        return response?.data?.suggestions || [];
      },
    }),
    getConnectionRequests: builder.query<
      ConnectionRequestsApiResponse,
      "sent" | "received"
    >({
      query: (type) => `/connections/${type}/connection-requests`,
      providesTags: ["Connections"],
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetCurrentUserQuery,
  useGetFullProfileQuery,
  useUpdateProfileMutation,
  useGetConnectionsQuery,
  useGetConnectionProfileQuery,
  useDeleteConnectionMutation,
  useSendConnectionRequestMutation,
  useAcceptConnectionRequestMutation,
  useLogoutMutation,
  useUpdateProfessionDetailsMutation,
  useUpdateMyBioMutation,
  useUpdateMySkillsMutation,
  useUpdateTravelDiaryMutation,
  useUpdateContactDetailsMutation,
  useUpdateAddressDetailsMutation,
  useUpdatePersonalDetailsMutation,
  useEndorseSkillMutation,
  useGetSuggestionsAllQuery,
  useGetConnectionRequestsQuery,
} = userApi;

// Utility function
export const getUserFullName = (user: any): string => {
  return `${user?.fname || ""} ${user?.lname || ""}`.trim();
};
