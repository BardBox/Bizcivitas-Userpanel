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
        // Silently handle any localStorage access errors
        console.warn("Could not access localStorage:", error);
      }
      // RTK Query will automatically handle Content-Type for FormData
      return headers;
    },
  }),
  // ⚡ CRITICAL: Performance fix - Don't refetch on window focus (this was causing 366 renders!)
  refetchOnFocus: false,
  // NOTE: Tag invalidation from mutations (like endorseSkill) will automatically refetch affected data
  tagTypes: [
    "User",
    "Profile",
    "Post",
    "Event",
    "Member",
    "Notification",
    "Connections",
  ],
  endpoints: () => ({}), // Individual APIs will inject endpoints
});
