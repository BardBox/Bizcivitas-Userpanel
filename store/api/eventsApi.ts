import { baseApi } from "./baseApi";
import {
  MongoEvent,
  PopulatedMongoEvent,
  EventsApiResponse,
  EventApiResponse,
  EventFilters,
  FrontendEvent,
  convertMongoEventToFrontend,
} from "../../types/mongoEvent.types";

export const eventsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all events with optional filters
    getAllEvents: builder.query<FrontendEvent[], EventFilters | void>({
      query: (filters) => {
        const params = new URLSearchParams();

        if (filters && filters.community)
          params.append("community", filters.community);
        if (filters && filters.eventType)
          params.append("eventType", filters.eventType);
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
          url: `/event${params.toString() ? `?${params.toString()}` : ""}`,
          method: "GET",
        };
      },
      transformResponse: (response: EventsApiResponse): FrontendEvent[] => {
        return response.data.map(convertMongoEventToFrontend);
      },
      providesTags: ["Event"],
    }),

    // Get event by ID
    getEventById: builder.query<FrontendEvent, string>({
      query: (id) => ({
        url: `/event/${id}`,
        method: "GET",
      }),
      transformResponse: (response: EventApiResponse): FrontendEvent => {
        return convertMongoEventToFrontend(response.data);
      },
      providesTags: (result, error, id) => [{ type: "Event", id }],
    }),

    // Get user's events (upcoming and past)
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
        url: `/event-show/${eventType}`,
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

    // Join event (add participant)
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

    // Admin endpoints (require admin role)
    createEvent: builder.mutation<FrontendEvent, FormData>({
      query: (formData) => ({
        url: "/event/create",
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
        url: `/event/edit/${id}`,
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
        url: `/event/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Event", id }, "Event"],
    }),
  }),
});

// Export hooks for usage in functional components
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
} = eventsApi;

// Export the API reducer
export default eventsApi;
