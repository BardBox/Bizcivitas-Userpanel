"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  DollarSign,
  Loader2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import {
  useGetAllEventsQuery,
  useGetRawEventsQuery,
} from "../../../../store/api/eventsApi.latest";
import { FrontendEvent } from "../../../../types/mongoEvent.types.latest";
import EventCard from "@/components/Events/EventCard";

type FilterType = "upcoming" | "past";
type PriceFilter = "all" | "free" | "paid" | "freepaid";

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("upcoming");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch events from API
  const {
    data: events = [],
    isLoading,
    isError,
    error,
  } = useGetAllEventsQuery();

  // DEBUG: Fetch raw events to see backend structure
  const {
    data: rawEvents,
    isLoading: isRawLoading,
    isError: isRawError,
    error: rawError,
  } = useGetRawEventsQuery();

  // Filter events based on search and filters
  const filteredEvents = useMemo(() => {
    let filtered: FrontendEvent[] = events;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (event: FrontendEvent) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.venue.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Time-based filter
    const now = new Date();
    filtered = filtered.filter((event: FrontendEvent) => {
      const eventDate = new Date(event.eventDate);
      if (activeFilter === "upcoming") {
        return eventDate > now;
      } else if (activeFilter === "past") {
        return eventDate < now;
      }
      return true;
    });

    // Price filter
    if (priceFilter !== "all") {
      filtered = filtered.filter((event: FrontendEvent) => {
        if (priceFilter === "free") {
          return event.isFree || event.accessMode === "free";
        } else if (priceFilter === "paid") {
          return !event.isFree || event.accessMode === "paid";
        } else if (priceFilter === "freepaid") {
          return event.accessMode === "freepaid";
        }
        return true;
      });
    }

    // Sort events by date (create a new array to avoid mutation)
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.eventDate).getTime();
      const dateB = new Date(b.eventDate).getTime();

      // If showing past events, show most recent first (descending)
      if (activeFilter === "past") {
        return dateB - dateA;
      }

      // For "all" and "upcoming", show nearest events first (ascending)
      return dateA - dateB;
    });

    return sorted;
  }, [events, searchQuery, activeFilter, priceFilter]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Unable to load events
          </h3>
          <p className="text-gray-600 mb-4">
            {error && "data" in error
              ? `Error: ${error.status} - ${JSON.stringify(error.data)}`
              : error && "message" in error
              ? `Error: ${error.message}`
              : "Something went wrong while fetching events. Please try again later."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors mr-2"
          >
            Try Again
          </button>
          <button
            onClick={() => {}}
            className="bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed opacity-50"
          >
            Debug Info
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Events</h1>

          {/* Search Bar */}
          <div className="relative max-w-md mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <span className="text-gray-400 hover:text-gray-600 text-2xl">×</span>
              </button>
            )}
          </div>

          {/* Filter Section - Mobile App Style */}
          <div className="flex items-center justify-between gap-3">
            {/* Time-based Toggle Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveFilter("upcoming")}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeFilter === "upcoming"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Upcoming Events
              </button>
              <button
                onClick={() => setActiveFilter("past")}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeFilter === "past"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Past Events
              </button>
            </div>

            {/* Filter Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className="p-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                aria-label="Filter events"
              >
                <Filter className="h-5 w-5 text-gray-600" />
              </button>

              {/* Dropdown Menu */}
              {isFilterDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  <button
                    onClick={() => {
                      setPriceFilter("all");
                      setIsFilterDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      priceFilter === "all"
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    All Events
                  </button>
                  <button
                    onClick={() => {
                      setPriceFilter("free");
                      setIsFilterDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      priceFilter === "free"
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Free Events
                  </button>
                  <button
                    onClick={() => {
                      setPriceFilter("paid");
                      setIsFilterDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      priceFilter === "paid"
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Paid Events
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Active Filters Summary */}
          {(searchQuery || priceFilter !== "all") && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-3">
              <Filter className="h-4 w-4" />
              <span>
                Showing {filteredEvents.length} events
                {searchQuery && ` matching "${searchQuery}"`}
                {priceFilter !== "all" && ` • ${priceFilter} events`}
              </span>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setPriceFilter("all");
                }}
                className="text-blue-600 hover:text-blue-800 font-medium ml-auto"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event: FrontendEvent) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeFilter} events found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || priceFilter !== "all"
                ? "Try adjusting your search or filters"
                : `Check back later for new ${activeFilter} events`}
            </p>
            {(searchQuery || priceFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setPriceFilter("all");
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
