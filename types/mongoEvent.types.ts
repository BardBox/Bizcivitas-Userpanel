// MongoDB Event types - matches backend Event.model.js structure

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
  eventType: "onedayevent" | "onlineevent" | "tripevent";
  membershipAccessType: {
    membership:
      | "Core Membership"
      | "Flagship Membership"
      | "Industria Membership"
      | "Digital Membership";
    type: "free" | "paid";
  }[];
  communities: string[]; // array of community IDs or populated Community objects
  region: string[];
  eventOverview: string;
  subtitle: string;
  whyAttend: string[];
  isPaid: boolean;
  membershipType: (
    | "Core Membership"
    | "Flagship Membership"
    | "Industria Membership"
    | "Digital Membership"
  )[];
  state: string[];
  amount?: number; // required if isPaid is true
  onlineLink?: string; // required for onlineevent
  startDate?: string; // ISO date for tripevent
  endDate?: string; // ISO date for tripevent
  postEventImages: string[];
  createdAt: string;
  updatedAt: string;
}

// Populated version with community details
export interface PopulatedMongoEvent extends Omit<MongoEvent, "communities"> {
  communities: {
    _id: string;
    name: string;
  }[];
  totalParticipants?: number;
}

// Frontend Event interface - normalized for display
export interface FrontendEvent {
  _id: string;
  title: string; // maps to eventName
  description: string;
  eventDate: string; // computed from date/startDate
  venue: string; // maps to location or "Online"
  image?: string; // computed absolute URL from img
  isOnline: boolean; // computed from eventType
  isFree: boolean; // computed from isPaid
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
}

// API Response types
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

// Event filters
export interface EventFilters {
  community?: string;
  state?: string | string[];
  region?: string | string[];
  eventType?: "onedayevent" | "onlineevent" | "tripevent";
}

// Helper function to convert MongoDB event to frontend event
export function convertMongoEventToFrontend(
  mongoEvent: PopulatedMongoEvent
): FrontendEvent {
  // Compute event date
  const eventDate =
    mongoEvent.eventType === "tripevent"
      ? mongoEvent.startDate!
      : mongoEvent.date!;

  // Compute venue
  const venue =
    mongoEvent.eventType === "onlineevent"
      ? "Online"
      : mongoEvent.location || "TBD";

  // Compute online status
  const isOnline = mongoEvent.eventType === "onlineevent";

  // Compute event status
  const now = new Date();
  const eventDateTime = new Date(eventDate);
  let status: "upcoming" | "ongoing" | "completed" = "upcoming";

  if (mongoEvent.eventType === "tripevent") {
    const endDateTime = new Date(mongoEvent.endDate!);
    if (now > endDateTime) {
      status = "completed";
    } else if (now >= eventDateTime && now <= endDateTime) {
      status = "ongoing";
    }
  } else {
    // For onedayevent and onlineevent, use date + endTime
    const eventEndTime = new Date(eventDate);
    // Parse time string (format: "HH:MM" or "HH:MM AM/PM")
    const timeStr = mongoEvent.endTime;

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
  }

  return {
    _id: mongoEvent._id,
    title: mongoEvent.eventName,
    description: mongoEvent.description,
    eventDate,
    venue,
    image: mongoEvent.img,
    isOnline,
    isFree: !mongoEvent.isPaid,
    price: mongoEvent.amount,
    registeredCount: mongoEvent.participants?.length || 0,
    status,
    eventType: mongoEvent.eventType,
    startTime: mongoEvent.startTime,
    endTime: mongoEvent.endTime,
    communities: mongoEvent.communities.map((c) =>
      typeof c === "string" ? c : c.name
    ),
    subtitle: mongoEvent.subtitle,
    eventOverview: mongoEvent.eventOverview,
    whyAttend: mongoEvent.whyAttend,
    onlineLink: mongoEvent.onlineLink,
  };
}
