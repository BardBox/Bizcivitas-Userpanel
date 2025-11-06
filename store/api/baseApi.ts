import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Use only NEXT_PUBLIC_BACKEND_URL from .env.local
const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_BACKEND_URL;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    credentials: "include", // This handles your HttpOnly cookies for authentication
    prepareHeaders: (headers, { getState }) => {
      // Only access localStorage on client-side after hydration
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          const accessToken = localStorage.getItem("accessToken");
          if (accessToken) {
            headers.set("Authorization", `Bearer ${accessToken}`);
          }
        }
      } catch (error) {
        // ✅ Silently handle localStorage access errors (keep console.error for debugging critical issues)
        if (process.env.NODE_ENV === "development") {
          console.warn("Could not access localStorage:", error);
        }
      }
      // RTK Query will automatically handle Content-Type for FormData
      return headers;
    },
  }),
  // Aggressive caching for instant navigation
  refetchOnFocus: false, // Don't refetch on window focus
  refetchOnReconnect: false, // Don't refetch on network reconnect
  refetchOnMountOrArgChange: false, // Use cached data, don't refetch on mount
  // Cache data for 10 minutes - keep data fresh without constant refetching
  keepUnusedDataFor: 600,
  // NOTE: Tag invalidation from mutations (like endorseSkill) will automatically refetch affected data
  // This means useGetCurrentUserQuery() called in multiple components will share the SAME cached data!
  tagTypes: [
    "User",
    "Profile",
    "Post",
    "Event",
    "Member",
    "Notification",
    "Connections",
    "Collection",
  ],
  endpoints: () => ({}), // Individual APIs will inject endpoints
});
