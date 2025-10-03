import { baseApi } from "./baseApi";
import { User, FullProfile, ApiResponse } from "../../types/user.types";
import {
  ConnectionActionPayload,
  ConnectionRequest,
} from "../../types/connection.types";

// Re-export types for backward compatibility
export type { User, FullProfile, ApiResponse };

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
    updateProfessionDetails: builder.mutation<any, FormData | object>({
      query: (data) => ({
        url: "/profiles/professionalDetails",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Profile"],
    }),
    updateMyBio: builder.mutation<any, object>({
      query: (data) => ({
        url: "/profiles/bioDetails",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Profile"],
    }),
    updateTravelDiary: builder.mutation<any, object>({
      query: (data) => ({
        url: "/profiles/travelDiary",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Profile"],
    }),
    updateContactDetails: builder.mutation<any, object>({
      query: (data) => ({
        url: "/profiles/contactDetails",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Profile"],
    }),
    updatePersonalDetails: builder.mutation<any, object>({
      query: (data) => ({
        url: "/profiles/personalDetails",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Profile", "User"],
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
    deleteConnection: builder.mutation<any, ConnectionActionPayload>({
      query: (data) => ({
        url: "/connections/delete-connection",
        method: "DELETE",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["Connections", "Profile"],
    }),
    sendConnectionRequest: builder.mutation<any, ConnectionRequest>({
      query: (data) => ({
        url: "/connections/send-request",
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["Connections", "Profile"],
    }),
    acceptConnectionRequest: builder.mutation<any, ConnectionActionPayload>({
      query: (data) => ({
        url: "/connections/accept-request",
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["Connections", "Profile"],
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/users/logout",
        method: "PATCH",
        credentials: "include",
      }),
      invalidatesTags: ["User", "Profile"],
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data,
    }),
    getSuggestionsAll: builder.query<any, string>({
      query: () => "/connections/getSuggestionsAll",
      providesTags: ["Connections"],
      transformResponse: (response: any) => {
        return response?.data?.suggestions || [];
      },
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
  useUpdateTravelDiaryMutation,
  useUpdateContactDetailsMutation,
  useUpdatePersonalDetailsMutation,
  useGetSuggestionsAllQuery,
} = userApi;

// Utility function
export const getUserFullName = (user: any): string => {
  return `${user?.fname || ""} ${user?.lname || ""}`.trim();
};
