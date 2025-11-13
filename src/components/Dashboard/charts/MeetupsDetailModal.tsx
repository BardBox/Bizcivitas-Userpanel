"use client";

import { useState, useEffect } from "react";
import { X, Download, Calendar, MapPin, Users } from "lucide-react";

interface UserDetails {
  _id?: string;
  id?: string;
  fname?: string;
  lname?: string;
  name?: string;
  avatar?: string;
  business?: string;
  businessSubcategory?: string;
  email?: string;
}

interface MeetupRecord {
  _id: string;
  title: string;
  date: string;
  time: string;
  meetingPlace: string;
  agenda?: string;
  attendees: any[]; // Array of user IDs or user objects
  createdBy?: UserDetails | string;
  creatorDetails?: UserDetails;
  createdAt?: string;
}

interface MeetupsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDateRange?: "15days" | "3months" | "6months" | "tilldate";
}

export default function MeetupsDetailModal({
  isOpen,
  onClose,
  initialDateRange = "15days",
}: MeetupsDetailModalProps) {
  const [dateRange, setDateRange] = useState(initialDateRange);
  const [meetupsData, setMeetupsData] = useState<MeetupRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Calculate date range based on selected filter (matching backend logic)
  const calculateDateRange = (range: string) => {
    const currentDate = new Date();
    currentDate.setUTCHours(23, 59, 59, 999);

    const startDate = new Date(currentDate);

    switch (range) {
      case "15days":
        startDate.setDate(currentDate.getDate() - 14); // 15 days = today + last 14 days
        startDate.setUTCHours(0, 0, 0, 0);
        break;
      case "3months":
        const FORTNIGHT_DAYS = 15;
        const TOTAL_FORTNIGHTS = 6;
        startDate.setDate(startDate.getDate() - FORTNIGHT_DAYS * TOTAL_FORTNIGHTS);
        startDate.setUTCHours(0, 0, 0, 0);
        break;
      case "6months":
        startDate.setMonth(startDate.getMonth() - 5);
        startDate.setDate(1);
        startDate.setUTCHours(0, 0, 0, 0);
        break;
      case "tilldate":
        startDate.setFullYear(2000);
        startDate.setMonth(0);
        startDate.setDate(1);
        startDate.setUTCHours(0, 0, 0, 0);
        break;
    }

    // Add IST offset (5.5 hours) to compensate for backend's subtraction
    startDate.setHours(startDate.getHours() + 5);
    startDate.setMinutes(startDate.getMinutes() + 30);
    currentDate.setHours(currentDate.getHours() + 5);
    currentDate.setMinutes(currentDate.getMinutes() + 30);

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: currentDate.toISOString().split("T")[0],
    };
  };

  // Fetch data when modal opens or filters change
  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { startDate: start, endDate: end } = calculateDateRange(dateRange);
      setStartDate(start);
      setEndDate(end);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/meetup/detailed-by-date`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          credentials: "include",
          body: JSON.stringify({
            startDate: start,
            endDate: end,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setMeetupsData(data.data.meetups || []);
      } else {
        console.error("API error:", data);
      }
    } catch (error) {
      console.error("Error fetching meetup details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    alert("PDF download functionality will be implemented");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (!isOpen) return null;

  const totalCount = meetupsData.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-indigo-600">
          <h2 className="text-2xl font-bold text-white">Meetups Data</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Date Range Filters */}
        <div className="p-6 border-b border-gray-200 space-y-4">
          <div className="flex gap-2 flex-wrap">
            {([
              { value: "15days", label: "15 Days" },
              { value: "3months", label: "3 Months" },
              { value: "6months", label: "6 Months" },
              { value: "tilldate", label: "Till Date" },
            ] as const).map((option) => (
              <button
                key={option.value}
                onClick={() => setDateRange(option.value as any)}
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                  dateRange === option.value
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPDF}
            className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <Download className="w-5 h-5" />
            Download PDF Report
          </button>

          {/* Date Range Display */}
          <div className="flex gap-4 justify-center">
            <div className="px-4 py-2 bg-purple-100 rounded-lg text-sm">
              <span className="text-gray-600">Start: </span>
              <span className="font-semibold text-purple-900">{startDate}</span>
            </div>
            <div className="px-4 py-2 bg-purple-100 rounded-lg text-sm">
              <span className="text-gray-600">End: </span>
              <span className="font-semibold text-purple-900">{endDate}</span>
            </div>
          </div>

          {/* Total Count */}
          <div className="text-center text-gray-700 font-medium">
            Total Meetups: {totalCount}
          </div>
        </div>

        {/* Records List */}
        <div className="overflow-y-auto max-h-[55vh] p-6 bg-gray-50 pb-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : meetupsData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg font-medium">No meetups found</p>
              <p className="text-sm">Try selecting a different date range</p>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {meetupsData.map((meetup) => {
                // Get creator details
                const creator = meetup.creatorDetails ||
                  (typeof meetup.createdBy === 'object' ? meetup.createdBy : null);

                let creatorName = "Unknown Organizer";
                let creatorInitials = "UO";

                if (creator) {
                  if (creator.fname && creator.lname) {
                    creatorName = `${creator.fname} ${creator.lname}`.trim();
                    creatorInitials = `${creator.fname.charAt(0)}${creator.lname.charAt(0)}`;
                  } else if (creator.name) {
                    creatorName = creator.name;
                    const nameParts = creatorName.split(" ");
                    if (nameParts.length >= 2) {
                      creatorInitials = `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`;
                    } else {
                      creatorInitials = creatorName.substring(0, 2).toUpperCase();
                    }
                  }
                }

                // Get avatar URL
                const avatarUrl = creator?.avatar
                  ? creator.avatar.startsWith('http')
                    ? creator.avatar
                    : `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/${creator.avatar}`
                  : null;

                return (
                  <div
                    key={meetup._id}
                    className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200">
                          {avatarUrl ? (
                            <img
                              key={`avatar-img-${meetup._id}`}
                              src={avatarUrl}
                              alt={creatorName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextSibling) {
                                  (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
                                }
                              }}
                            />
                          ) : (
                            <div
                              key={`avatar-initials-${meetup._id}`}
                              className="w-full h-full flex items-center justify-center bg-purple-600 text-white font-bold text-lg"
                            >
                              {creatorInitials}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-xl mb-1">
                          {meetup.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Organized by: <span className="font-medium text-purple-700">{creatorName}</span>
                        </p>
                        {creator?.business && (
                          <p className="text-xs text-gray-500 mb-3">
                            {creator.business}
                          </p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-purple-600" />
                            <span className="text-gray-700">
                              {formatDate(meetup.date)} at {meetup.time}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-purple-600" />
                            <span className="text-gray-700">
                              {meetup.meetingPlace || "Location TBD"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-purple-600" />
                            <span className="text-gray-700">
                              {meetup.attendees?.length || 0} Attendees
                            </span>
                          </div>
                        </div>

                        {meetup.agenda && (
                          <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                            <p className="text-xs text-purple-800 font-semibold mb-1">Agenda:</p>
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {meetup.agenda}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Date Badge */}
                      <div className="text-right text-xs text-gray-500">
                        {formatDate(meetup.createdAt || meetup.date)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
