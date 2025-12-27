import React, { useState } from "react";
import { Calendar, MapPin, Users } from "lucide-react";

interface Event {
  _id: string;
  eventName: string;
  date: Date | string;
  startTime: string;
  endTime: string;
  location: string;
  img?: string;
  participants?: string[];
  eventType?: "onedayevent" | "onlineevent" | "tripevent";
  accessMode?: "free" | "paid" | "freepaid";
}

interface EventsAttendingProps {
  events?: {
    upcoming?: Event[];
    past?: Event[];
    booked?: Event[];
  };
  isEditing?: boolean;
  onEditStateChange?: (isEditing: boolean) => void;
  formRef?: React.RefObject<HTMLFormElement | null>;
}

const EventsAttending: React.FC<EventsAttendingProps> = ({
  events,
  isEditing = false,
  onEditStateChange,
  formRef,
}) => {
  // Show upcoming events by default
  const upcomingEvents = events?.upcoming || events?.booked || [];

  if (!events || upcomingEvents.length === 0) {
    return (
      <div className="bg-white rounded-lg mb-6">
        <div className="space-y-3">
          <p className="text-gray-500 text-center py-8">
            No events registered yet
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getEventTypeLabel = (type?: string) => {
    switch (type) {
      case "onedayevent":
        return "One Day Event";
      case "onlineevent":
        return "Online Event";
      case "tripevent":
        return "Trip Event";
      default:
        return "Event";
    }
  };

  const getAccessModeLabel = (mode?: string) => {
    switch (mode) {
      case "free":
        return "Free";
      case "paid":
        return "Paid";
      case "freepaid":
        return "Free/Paid";
      default:
        return "";
    }
  };

  return (
    <div className="bg-white rounded-lg mb-6">
      <div className="space-y-4">
        {upcomingEvents.map((event) => (
          <div
            key={event._id}
            className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
          >
            <div className="flex gap-4">
              {/* Event Image */}
              {event.img && (
                <div className="flex-shrink-0">
                  <img
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL?.replace('/api/v1', '')}/api/v1/image/${event.img}`}
                    alt={event.eventName}
                    className="w-20 h-20 object-cover rounded-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}

              {/* Event Details */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {event.eventName}
                </h4>

                <div className="space-y-1 text-sm">
                  {/* Date & Time */}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>
                      {formatDate(event.date)}
                      {event.startTime && ` • ${event.startTime}`}
                      {event.endTime && ` - ${event.endTime}`}
                    </span>
                  </div>

                  {/* Location */}
                  {event.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}

                  {/* Participants Count */}
                  {event.participants && event.participants.length > 0 && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span>{event.participants.length} participants</span>
                    </div>
                  )}

                  {/* Event Type & Access Mode */}
                  <div className="flex gap-2 mt-2">
                    {event.eventType && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getEventTypeLabel(event.eventType)}
                      </span>
                    )}
                    {event.accessMode && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {getAccessModeLabel(event.accessMode)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Hook to connect EventsAttending with Accordion (no edit functionality needed)
export const useEventsAttendingWithAccordion = (events?: EventsAttendingProps["events"]) => {
  const [isEditing, setIsEditing] = useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  // Events attending is view-only, no edit functionality
  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleEdit = () => {
    // No edit functionality for events attending
    setIsEditing(false);
  };

  const handleEditStateChange = (editing: boolean) => {
    setIsEditing(false); // Always keep it as view-only
  };

  const handleFormSave = () => {
    // No save functionality needed
  };

  return {
    isEditing: false, // Always false - view only
    isLoading: false,
    handleEdit,
    handleSave: handleFormSave,
    handleCancel,
    handleEditStateChange,
    formRef,
    // Props for EventsAttending component
    eventsAttendingProps: {
      events,
      isEditing: false,
      onEditStateChange: handleEditStateChange,
      formRef,
    },
  };
};

export default EventsAttending;
