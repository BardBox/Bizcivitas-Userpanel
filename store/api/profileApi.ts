import { baseApi } from "./baseApi";
import { User, FullProfile, ApiResponse } from "../../types/user.types";

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
  statusCode: number;
  data?: {
    _id: string;
    name: string;
    score: number;
  };
}

// Inject profile endpoints into baseApi
export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ============================================
    // USER & PROFILE QUERIES
    // ============================================
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

    // ============================================
    // PROFILE UPDATE MUTATIONS
    // ============================================
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
    updatePersonalDetails: builder.mutation<PersonalDetailsResponse, object>({
      query: (data) => ({
        url: "/profiles/personalDetails",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Profile", "User"],
    }),

    // ============================================
    // BIO & SKILLS MUTATIONS
    // ============================================
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

    // ============================================
    // ADDITIONAL DETAILS MUTATIONS
    // ============================================
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

    // ============================================
    // AUTH MUTATIONS
    // ============================================
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
  }),
});

// Export hooks for use in components
export const {
  // User & Profile Queries
  useGetCurrentUserQuery,
  useGetFullProfileQuery,

  // Profile Update Mutations
  useUpdateProfileMutation,
  useUpdateProfessionDetailsMutation,
  useUpdatePersonalDetailsMutation,

  // Bio & Skills Mutations
  useUpdateMyBioMutation,
  useUpdateMySkillsMutation,
  useEndorseSkillMutation,

  // Additional Details Mutations
  useUpdateTravelDiaryMutation,
  useUpdateContactDetailsMutation,
  useUpdateAddressDetailsMutation,

  // Auth
  useLogoutMutation,
} = profileApi;

// Utility function
export const getUserFullName = (user?: User): string => {
  return `${user?.fname || ""} ${user?.lname || ""}`.trim();
};
