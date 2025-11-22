"use client";

import React, { useState } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Globe,
  UserCheck,
  Building2,
  ChevronRight,
  Home,
  ChevronLeft,
  Mail,
  Phone,
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
  const { data: event, error, isLoading } = useGetEventWithDetailsQuery(id);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [expandedParticipant, setExpandedParticipant] = useState<string | null>(null);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);

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
    <div className="min-h-screen mt-0 bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center text-sm text-gray-500">
            <Link
              href="/feeds"
              className="flex items-center hover:text-blue-600 transition-colors"
            >
              <Home className="h-4 w-4 mr-1" />
              <span>Home</span>
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link
              href="/feeds/events"
              className="hover:text-blue-600 transition-colors"
            >
              Events
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-gray-900 font-medium truncate">
              {trimTitle(event.eventName, 40)}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Event Header */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          {/* Event Image */}
          {event.img && (
            <div
              className="relative w-full h-64 md:h-80 lg:h-96 bg-gray-100 cursor-pointer"
              onClick={() => setIsGalleryOpen(true)}
            >
              <Image
                src={getAbsoluteImageUrl(event.img)}
                alt={event.eventName}
                fill
                className="object-contain"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 lg:p-6 text-white pointer-events-none">
                <div className="flex flex-wrap gap-1.5 md:gap-2 mb-2">
                  <span
                    className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-semibold ${accessMode.color}`}
                  >
                    {accessMode.text}
                  </span>
                  <span className="px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-semibold bg-blue-600 text-white">
                    {getEventTypeDisplay(event.eventType)}
                  </span>
                </div>
                <h1 className="text-lg md:text-2xl lg:text-3xl font-bold mb-1 md:mb-2 drop-shadow-lg">
                  {event.eventName}
                </h1>
                {event.subtitle && (
                  <p className="text-sm md:text-base lg:text-lg text-white/90 drop-shadow-md">{event.subtitle}</p>
                )}
              </div>
            </div>
          )}

          {/* Quick Info Bar */}
          <div className="px-4 py-3 md:px-6 md:py-4 bg-gray-50 border-t grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
            <div className="flex items-center text-sm">
              <Calendar className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-gray-500 text-xs">Date</p>
                <p className="text-gray-900 font-medium">
                  {formatDate(event.date || event.startDate || "")}
                </p>
              </div>
            </div>
            <div className="flex items-center text-sm">
              <Clock className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-gray-500 text-xs">Time</p>
                <p className="text-gray-900 font-medium">
                  {formatTime(event.startTime)}
                </p>
              </div>
            </div>
            <div className="flex items-center text-sm">
              <MapPin className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-gray-500 text-xs">Location</p>
                <p className="text-gray-900 font-medium">
                  {event.eventType === "onlineevent"
                    ? "Online"
                    : event.location || "Taj Vivanta, Vadodara"}
                </p>
              </div>
            </div>
            <div className="flex items-center text-sm">
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-gray-500 text-xs">Participants</p>
                <p className="text-gray-900 font-medium">
                  {event.totalParticipants || event.participants?.length || 1} registered
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                Description
              </h2>
              <div
                className="text-gray-700 leading-relaxed prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(event.description),
                }}
              />
            </div>

            {/* Event Overview */}
            {event.eventOverview && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-3 text-gray-900">
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

            {/* Why Attend */}
            {event.whyAttend && event.whyAttend.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-3 text-gray-900">
                  Why Attend?
                </h2>
                <ul className="space-y-2">
                  {event.whyAttend.map((reason, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3"></div>
                      <span className="text-gray-700">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Online Link */}
            {event.onlineLink && event.eventType === "onlineevent" && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-base font-semibold mb-2 text-blue-900 flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  Online Event Link
                </h3>
                <a
                  href={event.onlineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline break-all text-sm"
                >
                  {event.onlineLink}
                </a>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Region Info - Only show if present */}
            {(event.country || event.region?.length || event.state?.length) && (
              <div className="bg-white rounded-lg p-5 shadow-sm">
                <h3 className="text-lg font-bold mb-3 text-gray-900 flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-blue-600" />
                  Region
                </h3>
                <div className="space-y-2 text-sm">
                  {event.country && (
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-blue-600"></div>
                      <span className="text-gray-700 font-medium">
                        {event.country === "All Countries (Worldwide Access)" ? "🌐 " : ""}
                        {event.country}
                      </span>
                    </div>
                  )}
                  {event.region && event.region.length > 0 && (
                    <div className="pl-3 text-gray-600">
                      {event.region.join(", ")}
                    </div>
                  )}
                  {event.state && event.state.length > 0 && (
                    <div className="pl-3 text-gray-600">
                      {event.state.join(", ")}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Membership Access */}
            {event.membershipAccessType &&
              event.membershipAccessType.length > 0 && (
                <div className="bg-white rounded-lg p-5 shadow-sm">
                  <h3 className="text-lg font-bold mb-3 text-gray-900">
                    Membership Access
                  </h3>
                  <div className="space-y-2">
                    {event.membershipAccessType.map((access, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2.5 bg-gray-50 rounded-md text-sm"
                      >
                        <span className="text-gray-700 font-medium">
                          {access.membership}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            access.type === "free"
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
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
              <div className="bg-white rounded-lg p-5 shadow-sm">
                <h3 className="text-lg font-bold mb-3 text-gray-900">
                  Communities
                </h3>
                <div className="space-y-1.5">
                  {event.communities.map((community, index) => (
                    <div
                      key={index}
                      className="flex items-center p-2 bg-blue-50 rounded-md"
                    >
                      <Building2 className="h-3.5 w-3.5 text-blue-600 mr-2" />
                      <span className="text-blue-900 font-medium text-sm">
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
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            {/* Accordion Header */}
            <button
              onClick={() => setIsParticipantsOpen(!isParticipantsOpen)}
              className="w-full px-6 py-5 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Participants
                  </h2>
                  <p className="text-sm text-gray-600 font-medium">
                    {event.totalParticipants || event.participants?.length || 0} registered
                  </p>
                </div>
              </div>
              <ChevronRight
                className={`h-6 w-6 text-gray-600 transition-transform duration-200 ${
                  isParticipantsOpen ? "rotate-90" : ""
                }`}
              />
            </button>

            {/* Accordion Content */}
            {isParticipantsOpen && (
              <div className="px-6 pb-6 border-t">
                {event.participants && event.participants.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {event.participants.map((participant) => (
                  <div
                    key={participant._id}
                    className="border border-gray-200 rounded-lg overflow-hidden transition-shadow hover:shadow-md"
                  >
                    {/* Card Header - Clickable */}
                    <button
                      onClick={() =>
                        setExpandedParticipant(
                          expandedParticipant === participant._id ? null : participant._id
                        )
                      }
                      className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-gray-900">
                          {participant.fname} {participant.lname}
                        </div>
                        <ChevronRight
                          className={`h-4 w-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                            expandedParticipant === participant._id ? "rotate-90" : ""
                          }`}
                        />
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          participant.paymentStatus === "free"
                            ? "bg-green-100 text-green-800"
                            : participant.paymentStatus === "paid"
                            ? "bg-blue-100 text-blue-800"
                            : participant.paymentStatus === "approved"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {participant.paymentStatus}
                      </span>
                    </button>

                    {/* Expanded Details */}
                    {expandedParticipant === participant._id && (
                      <div className="px-4 pb-4 bg-gray-50 border-t">
                        <div className="text-sm text-gray-600 space-y-2 pt-3">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <p className="break-all">{participant.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <p>{participant.mobile}</p>
                          </div>
                          {participant.amountPaid > 0 && (
                            <p className="font-medium text-green-600">
                              ₹{participant.amountPaid.toLocaleString()}
                            </p>
                          )}
                          {participant.tableNo && (
                            <p className="text-blue-600">Table: {participant.tableNo}</p>
                          )}
                          <div className="flex items-center mt-2 pt-2 border-t">
                            <UserCheck
                              className={`h-4 w-4 mr-1 ${
                                participant.attendance ? "text-green-600" : "text-gray-400"
                              }`}
                            />
                            <span
                              className={`text-xs ${
                                participant.attendance ? "text-green-600" : "text-gray-500"
                              }`}
                            >
                              {participant.attendance ? "Attended" : "Not attended"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No participants registered yet</p>
                    <p className="text-gray-400 text-sm">Be the first to join this event!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Pending Participants */}
        {event.pendingParticipants && event.pendingParticipants.length > 0 && (
          <div className="mt-8">
            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
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
                      <p className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {participant.email}
                      </p>
                      <p className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        {participant.mobile}
                      </p>
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-2">
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
