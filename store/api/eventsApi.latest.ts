import {
  convertMongoEventToFrontend,
  EventApiResponse,
  EventFilters,
  EventsApiResponse,
  FrontendEvent,
  PopulatedMongoEvent,
} from "../../types/mongoEvent.types.latest";
import { baseApi } from "./baseApi";

export const eventsApiLatest = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Get all events with optional filters (UPDATED for latest backend)
    getAllEvents: builder.query<FrontendEvent[], EventFilters | void>({
      query: (filters) => {
        const params = new URLSearchParams();

        if (filters && filters.community)
          params.append("community", filters.community);
        if (filters && filters.eventType)
          params.append("eventType", filters.eventType);
        if (filters && filters.accessMode)
          params.append("accessMode", filters.accessMode);
        if (filters && filters.country)
          params.append("country", filters.country);
        if (filters && filters.state) {
          const states = Array.isArray(filters.state)
            ? filters.state
            : [filters.state];
          states.forEach((state: string) => params.append("state", state));
        }
        if (filters && filters.region) {
          const regions = Array.isArray(filters.region)
            ? filters.region
            : [filters.region];
          regions.forEach((region: string) => params.append("region", region));
        }

        return {
          url: `/events/event${
            params.toString() ? `?${params.toString()}` : ""
          }`,
          method: "GET",
        };
      },
      transformResponse: (response: EventsApiResponse): FrontendEvent[] => {
        try {
          if (!response || !response.data || !Array.isArray(response.data)) {
            // Return empty array for invalid response structure
            return [];
          }
          return response.data.map(convertMongoEventToFrontend);
        } catch (error) {
          // Return empty array on transformation error
          return [];
        }
      },
      providesTags: ["Event"],
    }),

    // Get event by ID (UPDATED for latest backend response)
    getEventById: builder.query<FrontendEvent, string>({
      query: (id) => ({
        url: `/events/event/${id}`,
        method: "GET",
      }),
      transformResponse: (response: EventApiResponse): FrontendEvent => {
        try {
          if (!response || !response.data) {
            throw new Error("Invalid response structure");
          }
          return convertMongoEventToFrontend(response.data);
        } catch (error) {
          throw new Error("Failed to transform event");
        }
      },
      providesTags: (result, error, id) => [{ type: "Event", id }],
    }),

    // Get user's events (upcoming and past) - UPDATED structure
    getUserEvents: builder.query<
      { upcomingEvents: FrontendEvent[]; pastEvents: FrontendEvent[] },
      void
    >({
      query: () => ({
        url: "/user-events",
        method: "GET",
      }),
      transformResponse: (response: {
        statusCode: number;
        data: {
          upcomingEvents: PopulatedMongoEvent[];
          pastEvents: PopulatedMongoEvent[];
        };
        message: string;
        success: boolean;
      }) => {
        return {
          upcomingEvents: response.data.upcomingEvents.map(
            convertMongoEventToFrontend
          ),
          pastEvents: response.data.pastEvents.map(convertMongoEventToFrontend),
        };
      },
      providesTags: ["Event", "User"],
    }),

    // Get past events
    getPastEvents: builder.query<FrontendEvent[], void>({
      query: () => ({
        url: "/pass-events",
        method: "GET",
      }),
      transformResponse: (response: EventsApiResponse): FrontendEvent[] => {
        return response.data.map(convertMongoEventToFrontend);
      },
      providesTags: ["Event"],
    }),

    // Get events by type for user's community
    getUserCommunityEvents: builder.query<
      FrontendEvent[],
      "OneDay" | "Online" | "Trip"
    >({
      query: (eventType) => ({
        url: `/events/event-show/${eventType}`,
        method: "GET",
      }),
      transformResponse: (response: {
        statusCode: number;
        data: { events: PopulatedMongoEvent[] };
        message: string;
        success: boolean;
      }): FrontendEvent[] => {
        return response.data.events.map(convertMongoEventToFrontend);
      },
      providesTags: ["Event", "User"],
    }),

    // Join event (add participant) - UPDATED for new backend logic
    joinEvent: builder.mutation<{ message: string }, string>({
      query: (eventId) => ({
        url: "/add-participant",
        method: "POST",
        body: { eventId },
      }),
      invalidatesTags: ["Event", "User"],
    }),

    // Leave event (remove participant)
    leaveEvent: builder.mutation<{ message: string }, string>({
      query: (eventId) => ({
        url: "/remove-participant",
        method: "POST",
        body: { eventId },
      }),
      invalidatesTags: ["Event", "User"],
    }),

    // NEW: Get event with full details including participants and pending users
    getEventWithDetails: builder.query<PopulatedMongoEvent, string>({
      query: (id) => ({
        url: `/events/event/${id}`,
        method: "GET",
      }),
      transformResponse: (response: EventApiResponse): PopulatedMongoEvent => {
        return response.data;
      },
      providesTags: (result, error, id) => [{ type: "Event", id }],
    }),

    // Admin endpoints (require admin role) - UPDATED for new fields
    createEvent: builder.mutation<FrontendEvent, FormData>({
      query: (formData) => ({
        url: "/events/event/create",
        method: "POST",
        body: formData,
      }),
      transformResponse: (response: EventApiResponse): FrontendEvent => {
        return convertMongoEventToFrontend(response.data);
      },
      invalidatesTags: ["Event"],
    }),

    updateEvent: builder.mutation<
      FrontendEvent,
      { id: string; formData: FormData }
    >({
      query: ({ id, formData }) => ({
        url: `/events/event/edit/${id}`,
        method: "PUT",
        body: formData,
      }),
      transformResponse: (response: EventApiResponse): FrontendEvent => {
        return convertMongoEventToFrontend(response.data);
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Event", id },
        "Event",
      ],
    }),

    deleteEvent: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/events/event/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Event", id }, "Event"],
    }),

    // NEW: Filter events by access mode
    getEventsByAccessMode: builder.query<
      FrontendEvent[],
      "free" | "paid" | "freepaid"
    >({
      query: (accessMode) => ({
        url: `/events/event?accessMode=${accessMode}`,
        method: "GET",
      }),
      transformResponse: (response: EventsApiResponse): FrontendEvent[] => {
        return response.data.map(convertMongoEventToFrontend);
      },
      providesTags: ["Event"],
    }),

    // NEW: Get events by country
    getEventsByCountry: builder.query<FrontendEvent[], string>({
      query: (country) => ({
        url: `/events/event?country=${country}`,
        method: "GET",
      }),
      transformResponse: (response: EventsApiResponse): FrontendEvent[] => {
        return response.data.map(convertMongoEventToFrontend);
      },
      providesTags: ["Event"],
    }),

    // DEBUG: Get raw events data for debugging
    getRawEvents: builder.query<any, void>({
      query: () => ({
        url: "/events/event",
        method: "GET",
      }),
      // No transform, return raw response
      providesTags: ["Event"],
    }),
  }),
});

// Export hooks for usage in functional components (UPDATED)
export const {
  useGetAllEventsQuery,
  useGetEventByIdQuery,
  useGetUserEventsQuery,
  useGetPastEventsQuery,
  useGetUserCommunityEventsQuery,
  useJoinEventMutation,
  useLeaveEventMutation,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useGetEventWithDetailsQuery,
  useGetEventsByAccessModeQuery,
  useGetEventsByCountryQuery,
  useGetRawEventsQuery, // DEBUG hook
} = eventsApiLatest;

// Export the API reducer
export default eventsApiLatest;
