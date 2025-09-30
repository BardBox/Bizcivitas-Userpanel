"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { getAbsoluteImageUrl } from "@/utils/imageUtils";
import DOMPurify from "dompurify";
import { FrontendEvent } from "../../../types/mongoEvent.types.latest";

interface EventCardProps {
  event: FrontendEvent;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }),
      year: date.getFullYear(),
    };
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const { day, month, year } = formatDate(event.eventDate);
  const time = formatTime(event.eventDate);

  const getStatusColor = () => {
    switch (event.status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "ongoing":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Event Image */}
      <div className="relative h-48 w-full">
        <Image
          src={
            event.image
              ? getAbsoluteImageUrl(event.image)
              : "/images/default-event.jpg"
          }
          alt={event.title}
          fill
          className="object-cover"
        />

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}
          >
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </span>
        </div>

        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          {event.accessMode === "free" || event.isFree ? (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Free
            </span>
          ) : event.accessMode === "paid" ? (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              ₹{event.price}
            </span>
          ) : event.accessMode === "freepaid" ? (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Mixed
            </span>
          ) : (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              ₹{event.price}
            </span>
          )}
        </div>

        {/* Online/Offline Badge */}
        <div className="absolute bottom-3 left-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              event.isOnline
                ? "bg-purple-100 text-purple-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {event.isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      {/* Event Content */}
      <div className="p-4">
        {/* Event Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {event.title}
        </h3>

        {/* Event Description */}
        <p
          className="text-gray-600 text-sm mb-3 line-clamp-2"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(event.description),
          }}
        />

        {/* Event Details */}
        <div className="space-y-2">
          {/* Date and Time */}
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            <span>
              {day} {month}, {year} at {time}
            </span>
          </div>

          {/* Venue */}
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
            <span className="truncate">{event.venue}</span>
          </div>

          {/* Participants */}
          {event.registeredCount !== undefined && (
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-2 text-gray-400" />
              <span>
                {event.registeredCount} registered
                {event.maxCapacity && ` / ${event.maxCapacity} max`}
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <Link
            href={`/feeds/events/event/${event._id}`}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 inline-block text-center"
          >
            {event.status === "upcoming" ? "Register Now" : "View Details"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
