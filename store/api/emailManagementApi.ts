import { baseApi } from "./baseApi";

export interface SecondaryEmail {
  email: string;
  isVerified: boolean;
  verifiedAt: string | null;
  addedAt: string;
  addedBy: string | null;
  _id?: string;
}

export interface EmailHistoryEntry {
  email: string;
  wasPrimary: boolean;
  activeFrom: string;
  activeTo: string | null;
  changedBy: string | null;
  reason: string;
  notes: string;
  _id?: string;
}

export interface UserEmailsResponse {
  primaryEmail: string;
  secondaryEmails: SecondaryEmail[];
  emailHistory: EmailHistoryEntry[];
  allEmails: string[];
}

export interface AddSecondaryEmailRequest {
  email: string;
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface RemoveSecondaryEmailRequest {
  email: string;
}

export interface ChangePrimaryEmailRequest {
  newPrimaryEmail: string;
  password: string;
}

export const emailManagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get user's all emails
    getUserEmails: builder.query<UserEmailsResponse, void>({
      query: () => ({
        url: "/email-management",
        method: "GET",
      }),
      providesTags: ["UserEmails"],
      transformResponse: (response: any) => response.data,
    }),

    // Add secondary email
    addSecondaryEmail: builder.mutation<any, AddSecondaryEmailRequest>({
      query: (body) => ({
        url: "/email-management/add",
        method: "POST",
        body,
      }),
      invalidatesTags: ["UserEmails"],
      transformResponse: (response: any) => response.data,
    }),

    // Verify email with OTP
    verifyEmail: builder.mutation<any, VerifyEmailRequest>({
      query: (body) => ({
        url: "/email-management/verify",
        method: "POST",
        body,
      }),
      invalidatesTags: ["UserEmails"],
      transformResponse: (response: any) => response.data,
    }),

    // Resend verification email
    resendVerification: builder.mutation<any, ResendVerificationRequest>({
      query: (body) => ({
        url: "/email-management/resend",
        method: "POST",
        body,
      }),
      transformResponse: (response: any) => response.data,
    }),

    // Remove secondary email
    removeSecondaryEmail: builder.mutation<any, RemoveSecondaryEmailRequest>({
      query: (body) => ({
        url: "/email-management/remove",
        method: "DELETE",
        body,
      }),
      invalidatesTags: ["UserEmails"],
      transformResponse: (response: any) => response.data,
    }),

    // Change primary email
    changePrimaryEmail: builder.mutation<any, ChangePrimaryEmailRequest>({
      query: (body) => ({
        url: "/email-management/change-primary",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["UserEmails", "EmailHistory"],
      transformResponse: (response: any) => response.data,
    }),

    // Get email history
    getEmailHistory: builder.query<EmailHistoryEntry[], void>({
      query: () => ({
        url: "/email-management/history",
        method: "GET",
      }),
      providesTags: ["EmailHistory"],
      transformResponse: (response: any) => response.data,
    }),
  }),
});

export const {
  useGetUserEmailsQuery,
  useAddSecondaryEmailMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useRemoveSecondaryEmailMutation,
  useChangePrimaryEmailMutation,
  useGetEmailHistoryQuery,
} = emailManagementApi;
