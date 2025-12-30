// MongoDB Event types - matches LATEST backend Event.model.js structure (GitHub latest)

export interface MongoEvent {
  _id: string;
  eventName: string;
  date?: string; // ISO date for onedayevent/onlineevent
  startTime: string;
  endTime: string;
  location?: string; // for onedayevent/tripevent
  description: string;
  img: string; // relative path to image
  participants: string[]; // array of user IDs
  pending: string[]; // NEW: array of pending user IDs
  pendingPayment: string[]; // NEW: array of pending payment user IDs
  eventType: "onedayevent" | "onlineevent" | "tripevent";

  // NEW: Access mode replaces isPaid logic
  accessMode: "free" | "paid" | "freepaid";

  // NEW: Country/Region/State filtering
  country: string;
  region: string[];
  state: string[];

  // NEW: Targets for Communities/CoreGroups
  targets: {
    targetId: string;
    targetType: "Community" | "CoreGroup";
  }[];

  membershipAccessType: {
    membership:
      | "Core Membership"
      | "Flagship Membership"
      | "Industria Membership"
      | "Digital Membership";
    type: "free" | "paid";
  }[];
  communities: string[]; // array of community IDs or populated Community objects
  eventOverview: string;
  subtitle: string;
  whyAttend: string[];

  // Legacy field (kept for backward compatibility)
  isPaid: boolean;
  membershipType: (
    | "Core Membership"
    | "Flagship Membership"
    | "Industria Membership"
    | "Digital Membership"
  )[];

  amount?: number; // required if accessMode is "paid" or "freepaid"
  onlineLink?: string; // required for onlineevent
  startDate?: string; // ISO date for tripevent
  endDate?: string; // ISO date for tripevent
  postEventImages: string[];
  createdAt: string;
  updatedAt: string;

  // NEW: Virtual field
  flags?: {
    label: string;
    type: "free" | "paid";
  }[];
}

// Enhanced populated version with latest backend response structure
export interface PopulatedMongoEvent
  extends Omit<MongoEvent, "communities" | "participants" | "targets"> {
  communities: {
    _id: string;
    name: string;
  }[];

  // Updated participant structure from latest backend
  totalParticipants: number;
  participants: {
    _id: string;
    fname: string;
    lname: string;
    email: string;
    mobile: string;
    paymentStatus: string;
    amountPaid: number;
    tableNo?: number;
    attendance: boolean;
    createdAt: string;
    updatedAt: string;
    userId?: string;
  }[];

  // NEW: Pending participants (from Guest model)
  pendingParticipants?: {
    _id: string;
    fname: string;
    lname: string;
    email: string;
    mobile: string;
    paymentStatus: string;
    amountPaid: number;
    attendance: boolean;
    createdAt: string;
    updatedAt: string;
    userId?: string;
  }[];
  totalPending?: number;

  // NEW: Enhanced targets with names and member counts
  targets?: {
    targetId: string;
    targetType: "Community" | "CoreGroup";
    name: string;
    totalMembers: number;
    countries: string[];
    states: string[];
    cities: string[];
  }[];

  // NEW: Aggregated location data
  countries?: string[];
  states?: string[];
  cities?: string[];
}

// Frontend Event interface - normalized for display (UPDATED)
export interface FrontendEvent {
  _id: string;
  title: string; // maps to eventName
  description: string;
  eventDate: string; // computed from date/startDate
  venue: string; // maps to location or "Online"
  image?: string; // computed absolute URL from img
  isOnline: boolean; // computed from eventType
  isFree: boolean; // computed from accessMode
  price?: number; // maps to amount
  registeredCount?: number; // computed from participants.length
  maxCapacity?: number; // not in backend model, optional
  status: "upcoming" | "ongoing" | "completed"; // computed from dates
  eventType: "onedayevent" | "onlineevent" | "tripevent";
  startTime: string;
  endTime: string;
  communities: string[];
  subtitle?: string;
  eventOverview?: string;
  whyAttend?: string[];
  onlineLink?: string;

  // NEW: Enhanced fields from latest backend
  accessMode: "free" | "paid" | "freepaid";
  country?: string;
  region?: string[];
  state?: string[];
  flags?: {
    label: string;
    type: "free" | "paid";
  }[];
  targets?: {
    name: string;
    type: "Community" | "CoreGroup";
    totalMembers: number;
  }[];
  pendingCount?: number; // computed from pendingParticipants.length

  // Membership-based pricing
  membershipAccessType?: {
    membership: "Core Membership" | "Flagship Membership" | "Industria Membership" | "Digital Membership";
    type: "free" | "paid";
  }[];
}

// API Response types (UPDATED)
export interface EventsApiResponse {
  statusCode: number;
  data: PopulatedMongoEvent[];
  message: string;
  success: boolean;
}

export interface EventApiResponse {
  statusCode: number;
  data: PopulatedMongoEvent;
  message: string;
  success: boolean;
}

// Event filters (UPDATED)
export interface EventFilters {
  community?: string;
  state?: string | string[];
  region?: string | string[];
  country?: string;
  city?: string | string[];
  eventType?: "onedayevent" | "onlineevent" | "tripevent";
  accessMode?: "free" | "paid" | "freepaid";
}

// Helper function to convert MongoDB event to frontend event (UPDATED)
export function convertMongoEventToFrontend(
  mongoEvent: PopulatedMongoEvent
): FrontendEvent {
  try {
    // Compute event date with fallback
    const eventDate =
      mongoEvent.eventType === "tripevent"
        ? mongoEvent.startDate || mongoEvent.date || new Date().toISOString()
        : mongoEvent.date || new Date().toISOString();

    // Compute venue with fallback
    const venue =
      mongoEvent.eventType === "onlineevent"
        ? "Online"
        : mongoEvent.location || "TBD";

    // Compute online status
    const isOnline = mongoEvent.eventType === "onlineevent";

    // Compute free status with fallback to legacy isPaid field
    const isFree = mongoEvent.accessMode
      ? mongoEvent.accessMode === "free"
      : !mongoEvent.isPaid;

    // Compute event status with error handling
    const now = new Date();
    const eventDateTime = new Date(eventDate);
    let status: "upcoming" | "ongoing" | "completed" = "upcoming";

    if (!isNaN(eventDateTime.getTime())) {
      if (mongoEvent.eventType === "tripevent" && mongoEvent.endDate) {
        const endDateTime = new Date(mongoEvent.endDate);
        if (!isNaN(endDateTime.getTime())) {
          if (now > endDateTime) {
            status = "completed";
          } else if (now >= eventDateTime && now <= endDateTime) {
            status = "ongoing";
          }
        }
      } else if (mongoEvent.endTime) {
        // For onedayevent and onlineevent, use date + endTime
        const eventEndTime = new Date(eventDate);
        // Parse time string (format: "HH:MM" or "HH:MM AM/PM")
        const timeStr = mongoEvent.endTime;

        try {
          if (timeStr.includes("AM") || timeStr.includes("PM")) {
            // 12-hour format
            const [time, period] = timeStr.split(" ");
            let [hours, minutes] = time.split(":").map(Number);
            if (period === "PM" && hours !== 12) hours += 12;
            if (period === "AM" && hours === 12) hours = 0;
            eventEndTime.setHours(hours, minutes);
          } else {
            // 24-hour format
            const [hours, minutes] = timeStr.split(":").map(Number);
            eventEndTime.setHours(hours, minutes);
          }

          if (now > eventEndTime) {
            status = "completed";
          } else if (now >= eventDateTime) {
            status = "ongoing";
          }
        } catch (timeParseError) {
          console.warn("Error parsing event time:", timeParseError);
          // Keep default "upcoming" status
        }
      }
    }

    return {
      _id: mongoEvent._id || "",
      title: mongoEvent.eventName || "Untitled Event",
      description: mongoEvent.description || "",
      eventDate,
      venue,
      image: mongoEvent.img,
      isOnline,
      isFree,
      price: mongoEvent.amount,
      registeredCount:
        mongoEvent.totalParticipants || mongoEvent.participants?.length || 0,
      status,
      eventType: mongoEvent.eventType || "onedayevent",
      startTime: mongoEvent.startTime || "",
      endTime: mongoEvent.endTime || "",
      communities: mongoEvent.communities
        ? mongoEvent.communities.map((c) =>
            typeof c === "string" ? c : c.name || c._id
          )
        : [],
      subtitle: mongoEvent.subtitle,
      eventOverview: mongoEvent.eventOverview,
      whyAttend: mongoEvent.whyAttend || [],
      onlineLink: mongoEvent.onlineLink,

      // NEW: Enhanced fields with fallbacks
      accessMode:
        mongoEvent.accessMode || (mongoEvent.isPaid ? "paid" : "free"),
      country: mongoEvent.country,
      region: mongoEvent.region || [],
      state: mongoEvent.state || [],
      flags: mongoEvent.flags,
      targets: mongoEvent.targets?.map((t) => ({
        name: t.name || "Unknown",
        type: t.targetType || "Community",
        totalMembers: t.totalMembers || 0,
      })),
      pendingCount:
        mongoEvent.totalPending || mongoEvent.pendingParticipants?.length || 0,

      // Membership-based pricing
      membershipAccessType: mongoEvent.membershipAccessType,
    };
  } catch (error) {
    console.error("Error converting mongo event to frontend:", error);
    console.error("Problematic event data:", mongoEvent);

    // Return a safe fallback event
    return {
      _id: mongoEvent._id || "unknown",
      title: mongoEvent.eventName || "Error Loading Event",
      description: mongoEvent.description || "Unable to load event details",
      eventDate: mongoEvent.date || new Date().toISOString(),
      venue: "Unknown",
      image: mongoEvent.img,
      isOnline: false,
      isFree: true,
      price: 0,
      registeredCount: 0,
      status: "upcoming",
      eventType: "onedayevent",
      startTime: "",
      endTime: "",
      communities: [],
      accessMode: "free",
      pendingCount: 0,
    };
  }
}
