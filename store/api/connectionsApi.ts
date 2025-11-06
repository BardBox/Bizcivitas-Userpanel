import { baseApi } from "./baseApi";
import { User, ApiResponse } from "../../types/user.types";
import {
  ConnectionActionPayload,
  ConnectionRequest,
  ConnectionRequestsApiResponse,
} from "../../types/connection.types";

// Response types for improved type safety
interface ConnectionActionResponse {
  success: boolean;
  message: string;
  data?: {
    connectionId?: string;
    status?: string;
  };
}

// API Response wrapper for connection profile
interface ConnectionProfileApiResponse {
  statusCode: number;
  data: {
    userDetails: User;
  };
  message: string;
  success: boolean;
}

// Search parameters for user search
export interface UserSearchParams {
  keyword?: string;
  fname?: string;
  lname?: string;
  companyName?: string;
  city?: string;
  Country?: string;
  category?: string;
  subcategory?: string;
}

// Inject connection endpoints into baseApi
export const connectionsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // ============================================
    // CONNECTION QUERIES
    // ============================================
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
    getConnectionProfile: builder.query<User | null, string>({
      query: (userId) => `/connections/user/${userId}`,
      providesTags: (result, error, userId) => [
        { type: "Profile", id: userId },
      ],
      transformResponse: (
        response: ConnectionProfileApiResponse
      ): User | null => {
        // Handle the specific response structure: { data: { userDetails: {...} } }
        if (response?.data?.userDetails) {
          return response.data.userDetails;
        } else if (response?.data) {
          // Fallback for unexpected response format
          return response.data as any;
        } else if (response) {
          // Fallback for direct user object
          return response as any;
        } else {
          return null;
        }
      },
    }),
    getConnectionRequests: builder.query<
      ConnectionRequestsApiResponse,
      "sent" | "received"
    >({
      query: (type) => `/connections/${type}/connection-requests`,
      providesTags: ["Connections"],
    }),
    getSuggestionsAll: builder.query<User[], void>({
      query: () => "/users/getallusers",
      providesTags: ["Connections"],
      transformResponse: (response: any): User[] => {
        // Handle the response structure from /users/getallusers
        // Response format: { data: { users: [{ user: {...} }] } }
        if (response?.data?.users && Array.isArray(response.data.users)) {
          return response.data.users.map((item: any) => {
            // Extract from nested user object (like mobile app does)
            const user = item.user || item;

            // Map fields to match expected User type
            return {
              _id: user.userId || user._id || user.id,
              fname: user.fname || user.name?.split(' ')[0] || '',
              lname: user.lname || user.name?.split(' ').slice(1).join(' ') || '',
              email: user.email || '',
              avatar: user.avatar || '',
              classification: user.classification || user.businessCategory || 'Business Professional',
              companyName: user.companyName || user.business || user.myBusiness || '',
              profile: user.profile,
              role: user.role || 'user',
              membershipType: user.membershipType || '',
              business: user.business || user.Business || '',
              businessSubcategory: user.businessSubcategory || '',
              region: user.region || '',
              // Note: /users/getallusers doesn't return connectionStatus
              // so we default to "not-connected"
              connectionStatus: 'not-connected',
            };
          });
        }
        return [];
      },
    }),
    searchUsers: builder.query<User[], UserSearchParams | void>({
      query: (params) => ({
        url: "/users/search",
        params: params || {},
      }),
      providesTags: ["Connections"],
      transformResponse: (response: any): User[] => {
        // Handle the response structure from /users/search
        // Response format: { success: boolean, data: User[] }
        if (response?.data && Array.isArray(response.data)) {
          return response.data.map((user: any) => ({
            _id: user._id || user.id,
            fname: user.fname || '',
            lname: user.lname || '',
            email: user.email || '',
            avatar: user.avatar || '',
            classification: user.classification || 'Business Professional',
            companyName: user.companyName || '',
            profile: user.profile,
            role: user.role || 'user',
            membershipType: user.membershipType || '',
            business: user.business || '',
            businessSubcategory: user.businessSubcategory || '',
            region: user.region || '',
            city: user.city || '',
            state: user.state || '',
            country: user.country || '',
            connectionStatus: 'not-connected',
          }));
        }
        return [];
      },
    }),

    // ============================================
    // CONNECTION MUTATIONS
    // ============================================
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
  }),
});

// Export hooks for use in components
export const {
  // Connection Queries
  useGetConnectionsQuery,
  useGetConnectionProfileQuery,
  useGetConnectionRequestsQuery,
  useGetSuggestionsAllQuery,
  useSearchUsersQuery,
  useLazySearchUsersQuery,

  // Connection Mutations
  useSendConnectionRequestMutation,
  useAcceptConnectionRequestMutation,
  useDeleteConnectionMutation,
} = connectionsApi;
