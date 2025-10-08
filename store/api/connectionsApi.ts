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

// Inject connection endpoints into baseApi
export const connectionsApi = baseApi.injectEndpoints({
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
      query: () => "/connections/getSuggestionsAll",
      providesTags: ["Connections"],
      transformResponse: (response: any): User[] => {
        return response?.data?.suggestions || [];
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

  // Connection Mutations
  useSendConnectionRequestMutation,
  useAcceptConnectionRequestMutation,
  useDeleteConnectionMutation,
} = connectionsApi;
