import { baseApi } from "./baseApi";

export const membershipApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get membership benefits
    getMembershipBenefits: builder.query<
      {
        success: boolean;
        data: Array<{
          _id: string;
          membershipType: string;
          content: string[];
        }>;
      },
      void
    >({
      query: () => "/memberships/admin/benefits",
    }),
  }),
});

export const { useGetMembershipBenefitsQuery } = membershipApi;
