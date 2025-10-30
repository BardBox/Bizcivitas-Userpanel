import { baseApi } from "./baseApi";

// Types for Dashboard APIs
export interface ChartDataPoint {
  date: string;
  given: number;
  received: number;
  count?: number;
}

// Backend response wrapper
interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message?: string;
  success?: boolean;
}

export interface ReferralChartData {
  dailyCounts: Array<{
    day: string;
    referrals: number; // received
    given: number; // sent
  }>;
  totalReferralsCount: number; // all-time received
  totalGivenCount: number; // all-time given
}

export interface BizWinChartData {
  dailySums: Array<{
    date: string;
    totalReceived: number;
    totalGiven: number;
  }>;
  overallReceived: number;
  overallGiven: number;
}

export interface MeetupChartData {
  dayWiseData: Array<{
    date: string;
    count: number;
  }>;
  last15DaysMeetupCount: number;
  allTimeCount: number;
}

export interface VisitorInvitationChartData {
  dayWiseData: Array<{
    date: string;
    count: number;
  }>;
  last15DaysCount: number;
  allTimeCount: number;
}

export interface Meeting {
  _id: string;
  title: string;
  date: string;
  time: string;
  place: string;
  visitor: string;
  speaker: string;
  attendees: string[];
  invited: string[];
  img: string;
  agenda: string;
}

export interface Event {
  _id: string;
  eventName: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  img: string;
  participants: string[];
  eventType: string;
  accessMode: string;
}

export interface Connection {
  _id: string;
  name: string;
  avatar: string;
  business: string;
  location: string;
  mutualConnections?: number;
}

type DateRange = "15days" | "3months" | "6months" | "tilldate";

// Dashboard API endpoints
export const dashboardApi = baseApi.injectEndpoints({
  overrideExisting: true, // Allow overriding duplicate endpoints
  endpoints: (builder) => ({
    // BizConnect (Referrals) Chart APIs
    getReferralsMonthlyCount: builder.query<ReferralChartData, void>({
      query: () => "/referrals/monthly-count",
      transformResponse: (response: ApiResponse<ReferralChartData>) =>
        response.data,
    }),
    getReferrals3MonthCounts: builder.query<ReferralChartData, void>({
      query: () => "/referrals/3-month-counts",
      transformResponse: (response: ApiResponse<ReferralChartData>) =>
        response.data,
    }),
    getReferrals6MonthCounts: builder.query<ReferralChartData, void>({
      query: () => "/referrals/6-month-counts",
      transformResponse: (response: ApiResponse<ReferralChartData>) =>
        response.data,
    }),
    getReferralsTillDateCounts: builder.query<ReferralChartData, void>({
      query: () => "/referrals/till-date-counts",
      transformResponse: (response: ApiResponse<ReferralChartData>) =>
        response.data,
    }),

    // BizWin (TYFCB/Record) Chart APIs
    getRecordLast15DaysCounts: builder.query<BizWinChartData, void>({
      query: () => "/record/last-15days-counts",
      transformResponse: (response: ApiResponse<BizWinChartData>) =>
        response.data,
    }),
    getRecord3MonthCounts: builder.query<BizWinChartData, void>({
      query: () => "/record/3-month-counts",
      transformResponse: (response: ApiResponse<BizWinChartData>) =>
        response.data,
    }),
    getRecord6MonthCounts: builder.query<BizWinChartData, void>({
      query: () => "/record/6-month-counts",
      transformResponse: (response: ApiResponse<BizWinChartData>) =>
        response.data,
    }),
    getRecordTillDateAmounts: builder.query<BizWinChartData, void>({
      query: () => "/record/till-date-amounts",
      transformResponse: (response: ApiResponse<BizWinChartData>) =>
        response.data,
    }),

    // Meetups Chart APIs
    getMeetupsMeetingCount: builder.query<MeetupChartData, void>({
      query: () => "/meetup/meeting-count",
      transformResponse: (response: ApiResponse<MeetupChartData>) =>
        response.data,
    }),
    getMeetups3MonthCounts: builder.query<MeetupChartData, void>({
      query: () => "/meetup/3-month-counts",
      transformResponse: (response: ApiResponse<MeetupChartData>) =>
        response.data,
    }),
    getMeetups6MonthCounts: builder.query<MeetupChartData, void>({
      query: () => "/meetup/6-month-counts",
      transformResponse: (response: ApiResponse<MeetupChartData>) =>
        response.data,
    }),
    getMeetupsAllTimeCount: builder.query<MeetupChartData, void>({
      query: () => "/meetup/all-time-count",
      transformResponse: (response: ApiResponse<MeetupChartData>) =>
        response.data,
    }),

    // Visitor Invitations Chart APIs
    getMeetingsLast15DaysInvitedCount: builder.query<
      VisitorInvitationChartData,
      void
    >({
      query: () => "/meetings/last-15-days-invited-count",
      transformResponse: (
        response: ApiResponse<VisitorInvitationChartData>
      ) => response.data,
    }),
    getMeetings3MonthFortnightInvitedCount: builder.query<
      VisitorInvitationChartData,
      void
    >({
      query: () => "/meetings/3-month-fortnight-invited-count",
      transformResponse: (
        response: ApiResponse<VisitorInvitationChartData>
      ) => response.data,
    }),
    getMeetings6MonthInvitedCount: builder.query<
      VisitorInvitationChartData,
      void
    >({
      query: () => "/meetings/6-month-invited-count",
      transformResponse: (
        response: ApiResponse<VisitorInvitationChartData>
      ) => response.data,
    }),
    getMeetingsAllTimeInvitedPeopleCount: builder.query<
      VisitorInvitationChartData,
      void
    >({
      query: () => "/meetings/all-time-invited-people-count",
      transformResponse: (
        response: ApiResponse<VisitorInvitationChartData>
      ) => response.data,
    }),

    // Upcoming Meetings
    getMeetingsByCommunity: builder.query<
      { success: boolean; data: Meeting[] },
      string
    >({
      query: (communityId) => `/meetings/community/${communityId}`,
    }),

    // Note: getUserEvents is defined in eventsApi.latest.ts, use that instead

    // Suggested Connections
    getConnectionSuggestions: builder.query<Connection[], void>({
      query: () => "/connections/getSuggestions",
      providesTags: ["Connections"],
    }),

    // User Connections
    getUserConnections: builder.query<Connection[], void>({
      query: () => "/connections/",
      providesTags: ["Connections"],
    }),

    // Dashboard Stats
    getDashboardStats: builder.query<
      {
        totalUsers: number;
        totalCommunities: number;
        totalCoreMembers: number;
        totalEvents: number;
      },
      void
    >({
      query: () => "/dashboard/stats",
    }),

    // User Referral State
    getUserReferralState: builder.query<
      {
        referralsGiven: number;
        referralsReceived: number;
        tyfcbGiven: number;
        tyfcbReceived: number;
      },
      string | void
    >({
      query: (userId) =>
        userId
          ? `/dashboard/user-referralstate/${userId}`
          : "/dashboard/user-referralstate",
    }),
  }),
});

// Export hooks for usage in components
export const {
  // BizConnect
  useGetReferralsMonthlyCountQuery,
  useGetReferrals3MonthCountsQuery,
  useGetReferrals6MonthCountsQuery,
  useGetReferralsTillDateCountsQuery,

  // BizWin
  useGetRecordLast15DaysCountsQuery,
  useGetRecord3MonthCountsQuery,
  useGetRecord6MonthCountsQuery,
  useGetRecordTillDateAmountsQuery,

  // Meetups
  useGetMeetupsMeetingCountQuery,
  useGetMeetups3MonthCountsQuery,
  useGetMeetups6MonthCountsQuery,
  useGetMeetupsAllTimeCountQuery,

  // Visitor Invitations
  useGetMeetingsLast15DaysInvitedCountQuery,
  useGetMeetings3MonthFortnightInvitedCountQuery,
  useGetMeetings6MonthInvitedCountQuery,
  useGetMeetingsAllTimeInvitedPeopleCountQuery,

  // Other Dashboard Data
  useGetMeetingsByCommunityQuery,
  // useGetUserEventsQuery - use from eventsApi.latest.ts instead
  useGetConnectionSuggestionsQuery,
  useGetUserConnectionsQuery,
  useGetDashboardStatsQuery,
  useGetUserReferralStateQuery,
} = dashboardApi;
