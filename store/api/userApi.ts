import { baseApi } from "./baseApi";

export interface User {
  _id?: string;
  id?: string; // Some APIs return 'id' instead of '_id'
  fname: string;
  lname: string;
  email: string;
  avatar?: string;
  role?: string;
  mobile?: number;
  contactNo?: number; // From connections API
  username?: string;
  gender?: string;
  membershipType?: string;
  membershipStatus?: boolean;
  renewalDate?: string;
  paymentSummary?: any;
  website?: string;
  community?: {
    communityName: string;
    region: string;
    _id: string;
  } | null;
  profile?: {
    professionalDetails?: {
      classification?: string;
      companyName?: string;
      myBusiness?: string;
      industry?: string;
      business?: string;
      businessSubcategory?: string;
      gstRegisteredState?: string;
      directNumber?: string;
      companyAddress?: string;
    };
    addresses?: {
      address?: {
        city?: string;
        country?: string;
        state?: string;
      };
    };
  };
  // Additional fields from actual API response
  classification?: string | null;
  companyName?: string | null;
  myBusiness?: string | null;
  industry?: string | null;
  city?: string | null;
  country?: string | null;
  state?: string | null;
  business?: string | null;
  businessSubcategory?: string;
  region?: string;
  // Connections data
  connections?: Array<{
    _id: string;
    user?: {
      _id: string;
      name: string;
      avatar?: string;
    };
    sender?: string;
    receiver?: string;
    isAccepted: boolean;
    createdAt?: string;
    updatedAt?: string;
  }>;
}

export interface FullProfile {
  _id: string;
  contactDetails?: {
    email?: string;
    mobileNumber?: string;
    isEmailVerified?: boolean;
    website?: string;
    socialNetworkLinks?: Array<any>;
  };
  addresses?: {
    address?: {
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      country?: string;
      pincode?: number;
    };
    billing?: {
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      country?: string;
      pincode?: number;
    };
  };
  myBio?: {
    mySkills?: string[];
    myAsk?: string[];
    myGives?: string[];
    tags?: string[];
    hobbiesAndInterests?: string;
    cityOfResidence?: string;
    myBurningDesireIsTo?: string;
    myKeyToSuccess?: string;
    previousTypesOfJobs?: string;
    somethingNoOneHereKnowsAboutMe?: string;
    yearsInBusiness?: number;
    yearsInThatCity?: number;
  };
  professionalDetails?: {
    classification?: string;
    companyAddress?: string;
    companyName?: string;
    directNumber?: string;
    gstRegisteredState?: string;
    industry?: string;
    membershipStatus?: string;
    myBusiness?: string;
    renewalDueDate?: string;
    business?: string;
    businessSubcategory?: string;
    companyLogo?: string;
    businessAddress?: string;
    businessCity?: string;
    businessState?: string;
    businessCountry?: string;
  };
  travelDiary?: {
    businessBucketList?: string[];
    dealsOnWheels?: string[];
    dreamDestination?: string;
    myFootprints?: string[];
  };

  businessNeeds?: {
    current?: string[];
    future?: string[];
  };
  community?: {
    id: string;
    name: string;
    image?: string;
  };
  coreGroup?: {
    id: string;
    name: string;
  };
  visibility?: {
    professionalDetails?: boolean;
  };
  billingAddress?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  businessAddress?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  mySkillItems?: Array<{
    _id: string;
    name: string;
    score: number;
  }>;
  weeklyPresentation?: {
    title?: string;
    description?: string;
    presentationDate?: string;
  };
}

interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
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
        if (response?.data?.connections && Array.isArray(response.data.connections)) {
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
      providesTags: (_, __, userId) => [{ type: 'Profile', id: userId }],
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
  useGetCurrentUserQuery,
  useGetFullProfileQuery,
  useUpdateProfileMutation,
  useGetConnectionsQuery,
  useGetConnectionProfileQuery,
  useLogoutMutation,
  useUpdateProfessionDetailsMutation,
  useUpdateMyBioMutation,
  useUpdateTravelDiaryMutation,
  useUpdateContactDetailsMutation,
  useUpdatePersonalDetailsMutation,
} = userApi;

// Utility function
export const getUserFullName = (user: any): string => {
  return `${user?.fname || ""} ${user?.lname || ""}`.trim();
};
