"use client";

import React, { useState } from "react";
import { notFound, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Globe,
  CreditCard,
  UserCheck,
  Building2,
  ChevronRight,
  Home,
} from "lucide-react";
import { getAbsoluteImageUrl } from "@/utils/imageUtils";
import { useGetEventWithDetailsQuery } from "../../../../../../store/api/eventsApi.latest";
import FullscreenGallery from "@/components/FullscreenGallery";
import DOMPurify from "dompurify";

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const router = useRouter();
  const { data: event, error, isLoading } = useGetEventWithDetailsQuery(id);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) return notFound();

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "Not specified";
    return timeString;
  };

  const getEventTypeDisplay = (eventType: string) => {
    switch (eventType) {
      case "onedayevent":
        return "One Day Event";
      case "onlineevent":
        return "Online Event";
      case "tripevent":
        return "Trip Event";
      default:
        return eventType;
    }
  };

  const getAccessModeDisplay = () => {
    if (event.accessMode === "free")
      return { text: "Free", color: "text-green-600 bg-green-100" };
    if (event.accessMode === "paid")
      return {
        text: `₹${event.amount || 0}`,
        color: "text-orange-600 bg-orange-100",
      };
    if (event.accessMode === "freepaid")
      return { text: "Mixed Pricing", color: "text-blue-600 bg-blue-100" };
    return {
      text: event.isPaid ? `₹${event.amount || 0}` : "Free",
      color: event.isPaid
        ? "text-orange-600 bg-orange-100"
        : "text-green-600 bg-green-100",
    };
  };

  const accessMode = getAccessModeDisplay();

  // Helper function to trim event title for breadcrumb
  const trimTitle = (title: string, maxLength: number = 30) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + "...";
  };

  return (
    <div className="min-h-screen">
      {/* Breadcrumb - Outside white container */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-4">
        <nav className="flex items-center text-xs sm:text-sm text-gray-500 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
          <Link
            href="/feeds"
            className="flex items-center hover:text-blue-600 transition-colors"
          >
            <Home className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span>Home</span>
          </Link>
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 mx-1 sm:mx-2" />
          <Link
            href="/feeds/events"
            className="hover:text-blue-600 transition-colors"
          >
            Events
          </Link>
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 mx-1 sm:mx-2" />
          <span className="text-gray-900 font-medium truncate">
            {trimTitle(event.eventName, 30)}
          </span>
        </nav>
      </div>

      {/* Header - White container with title */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {event.eventName}
              </h1>
              {event.subtitle && (
                <p className="text-lg text-gray-600">{event.subtitle}</p>
              )}
            </div>

            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${accessMode.color}`}
              >
                {accessMode.text}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {getEventTypeDisplay(event.eventType)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Image */}
            {event.img && (
              <div
                className="relative w-full aspect-[16/9] rounded-xl overflow-hidden shadow-lg bg-gray-100 cursor-pointer group"
                onClick={() => setIsGalleryOpen(true)}
              >
                <Image
                  src={getAbsoluteImageUrl(event.img)}
                  alt={event.eventName}
                  fill
                  className="object-contain transition-opacity group-hover:opacity-90"
                  priority
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 px-4 py-2 rounded-lg">
                    <p className="text-gray-900 font-medium text-sm">Click to view fullscreen</p>
                  </div>
                </div>
              </div>
            )}

            {/* Event Overview */}
            {event.eventOverview && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                  Event Overview
                </h2>
                <div
                  className="text-gray-700 leading-relaxed prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(event.eventOverview),
                  }}
                />
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                Description
              </h2>
              <div
                className="text-gray-700 leading-relaxed prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(event.description),
                }}
              />
            </div>

            {/* Why Attend */}
            {event.whyAttend && event.whyAttend.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                  Why Attend?
                </h2>
                <ul className="space-y-3">
                  {event.whyAttend.map((reason, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                      <span className="text-gray-700">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Online Link */}
            {event.onlineLink && event.eventType === "onlineevent" && (
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h2 className="text-xl font-semibold mb-3 text-blue-900 flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Online Event Link
                </h2>
                <a
                  href={event.onlineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline break-all"
                >
                  {event.onlineLink}
                </a>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Details Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">
                Event Details
              </h3>
              <div className="space-y-4">
                {/* Date */}
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="text-gray-900 font-medium">
                      {event.eventType === "tripevent"
                        ? `${formatDate(event.startDate || "")} - ${formatDate(
                            event.endDate || ""
                          )}`
                        : formatDate(event.date || "")}
                    </p>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="text-gray-900 font-medium">
                      {formatTime(event.startTime)} -{" "}
                      {formatTime(event.endTime)}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-gray-900 font-medium">
                      {event.eventType === "onlineevent"
                        ? "Online Event"
                        : event.location || "TBD"}
                    </p>
                  </div>
                </div>

                {/* Participants */}
                <div className="flex items-start">
                  <Users className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Participants</p>
                    <p className="text-gray-900 font-medium">
                      {event.totalParticipants ||
                        event.participants?.length ||
                        0}{" "}
                      registered
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-start">
                  <CreditCard className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="text-gray-900 font-medium">
                      {accessMode.text}
                    </p>
                  </div>
                </div>

                {/* Country/Region */}
                {(event.country ||
                  event.region?.length ||
                  event.state?.length) && (
                  <div className="flex items-start">
                    <Building2 className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Region</p>
                      <div className="text-gray-900 font-medium">
                        {event.country && <p>{event.country}</p>}
                        {event.region && event.region.length > 0 && (
                          <p className="text-sm text-gray-600">
                            {event.region.join(", ")}
                          </p>
                        )}
                        {event.state && event.state.length > 0 && (
                          <p className="text-sm text-gray-600">
                            {event.state.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Membership Access */}
            {event.membershipAccessType &&
              event.membershipAccessType.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">
                    Membership Access
                  </h3>
                  <div className="space-y-3">
                    {event.membershipAccessType.map((access, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="text-gray-700 font-medium">
                          {access.membership}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            access.type === "free"
                              ? "bg-green-100 text-green-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {access.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Communities */}
            {event.communities && event.communities.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  Communities
                </h3>
                <div className="space-y-2">
                  {event.communities.map((community, index) => (
                    <div
                      key={index}
                      className="flex items-center p-2 bg-blue-50 rounded-lg"
                    >
                      <Building2 className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-blue-900 font-medium">
                        {typeof community === "string"
                          ? community
                          : community.name || community._id}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Participants Section */}
        <div className="mt-12">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 flex items-center">
              <Users className="h-6 w-6 mr-3" />
              Participants (
              {event.totalParticipants || event.participants?.length || 0})
            </h2>

            {event.participants && event.participants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {event.participants.map((participant) => (
                  <div
                    key={participant._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-gray-900">
                        {participant.fname} {participant.lname}
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          participant.paymentStatus === "free"
                            ? "bg-green-100 text-green-800"
                            : participant.paymentStatus === "paid"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {participant.paymentStatus}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{participant.email}</p>
                      <p>{participant.mobile}</p>
                      {participant.amountPaid > 0 && (
                        <p className="font-medium text-green-600">
                          ₹{participant.amountPaid}
                        </p>
                      )}
                      {participant.tableNo && (
                        <p className="text-blue-600">
                          Table: {participant.tableNo}
                        </p>
                      )}
                      <div className="flex items-center mt-2">
                        <UserCheck
                          className={`h-4 w-4 mr-1 ${
                            participant.attendance
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        />
                        <span
                          className={`text-xs ${
                            participant.attendance
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          {participant.attendance ? "Attended" : "Not attended"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  No participants registered yet
                </p>
                <p className="text-gray-400 text-sm">
                  Be the first to join this event!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Pending Participants */}
        {event.pendingParticipants && event.pendingParticipants.length > 0 && (
          <div className="mt-8">
            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
              <h2 className="text-xl font-semibold mb-4 text-yellow-900 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Pending Participants ({event.pendingParticipants.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {event.pendingParticipants.map((participant) => (
                  <div
                    key={participant._id}
                    className="bg-white border border-yellow-200 rounded-lg p-4"
                  >
                    <div className="font-medium text-gray-900 mb-2">
                      {participant.fname} {participant.lname}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{participant.email}</p>
                      <p>{participant.mobile}</p>
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {participant.paymentStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Gallery */}
      {event.img && (
        <FullscreenGallery
          images={[getAbsoluteImageUrl(event.img)]}
          initialIndex={0}
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          alt={event.eventName}
        />
      )}
    </div>
  );
}
