"use client";

import { useState, useEffect } from "react";
import { X, Download, Calendar, MapPin, Users, ChevronDown, ChevronUp, Edit2, Save, FileText, Clock, Trash2 } from "lucide-react";
import DateRangePicker from "../DateRangePicker";
import DeleteConfirmModal from "../../modals/DeleteConfirmModal";
import { DashboardPDFGenerator } from "@/utils/pdfGenerator";

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
  _id?: string;
  id?: string;
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
  initialDateRange?: "15days" | "3months" | "6months" | "tilldate" | "custom";
}

export default function MeetupsDetailModal({
  isOpen,
  onClose,
  initialDateRange = "15days",
}: MeetupsDetailModalProps) {
  const [dateRange, setDateRange] = useState(initialDateRange);
  const [showFilters, setShowFilters] = useState(true);
  const [meetupsData, setMeetupsData] = useState<MeetupRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [expandedMeetupId, setExpandedMeetupId] = useState<string | null>(null);

  // Edit Mode State
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingMeetupId, setEditingMeetupId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    meetingPlace: "",
    agenda: "",
    date: "",
    time: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [deleteMeetupId, setDeleteMeetupId] = useState<string | null>(null);
  const [isDeletingMeetup, setIsDeletingMeetup] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUserId(user.id || user._id || user.userId);
      } catch (e) {
        console.error("Error parsing user from local storage", e);
      }
    }
  }, []);

  const toggleExpand = (id: string) => {
    if (expandedMeetupId === id) {
      setExpandedMeetupId(null);
    } else {
      setExpandedMeetupId(id);
    }
  };

  const handleEditClick = (meetup: MeetupRecord) => {
    const meetupId = meetup._id || meetup.id;
    if (!meetupId) {
      console.error("Cannot edit meetup without ID");
      return;
    }
    setEditingMeetupId(meetupId);

    // Format date for input (YYYY-MM-DD)
    const formattedDate = new Date(meetup.date).toISOString().split('T')[0];

    setEditFormData({
      meetingPlace: meetup.meetingPlace || "",
      agenda: meetup.agenda || "",
      date: formattedDate,
      time: meetup.time || ""
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancelEdit = () => {
    setEditingMeetupId(null);
    setEditFormData({ meetingPlace: "", agenda: "", date: "", time: "" });
  };

  const handleSaveEdit = async () => {
    if (!editingMeetupId) return;
    setIsSaving(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000/api/v1";
      // Ensure we don't double slash if the env var has a trailing slash
      const baseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;

      console.log(`Updating meetup at: ${baseUrl}/meetup/${editingMeetupId}`);
      console.log("Payload:", editFormData);

      const response = await fetch(`${baseUrl}/meetup/${editingMeetupId}`, {
        method: "PUT", // Assuming PUT for update
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(editFormData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update local state
        setMeetupsData(prev => prev.map(m => {
          const mId = m._id || m.id;
          return mId === editingMeetupId
            ? { ...m, ...editFormData }
            : m;
        }));
        setEditingMeetupId(null);
      } else {
        console.error("Failed to update meetup. Response:", data);
        alert(`Failed to update meetup: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error updating meetup:", error);
      alert("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMeetup = (meetupId: string) => {
    setDeleteMeetupId(meetupId);
  };

  const confirmDelete = async () => {
    if (!deleteMeetupId) return;
    setIsDeletingMeetup(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000/api/v1";
      const baseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;

      const response = await fetch(`${baseUrl}/meetup/${deleteMeetupId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Remove from local state
        setMeetupsData(prev => prev.filter(m => (m._id || m.id) !== deleteMeetupId));
        // If the deleted meetup was expanded, collapse it
        if (expandedMeetupId === deleteMeetupId) {
          setExpandedMeetupId(null);
        }
        setDeleteMeetupId(null);
      } else {
        console.error("Failed to delete meetup. Response:", data);
        alert(`Failed to delete meetup: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error deleting meetup:", error);
      alert("An error occurred while deleting.");
    } finally {
      setIsDeletingMeetup(false);
    }
  };

  // Calculate date range based on selected filter (matching backend logic)
  const calculateDateRange = (range: string) => {
    // For custom range, use the selected custom dates
    if (range === "custom" && customStartDate && customEndDate) {
      return {
        startDate: customStartDate,
        endDate: customEndDate,
      };
    }
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

  // Handler for custom date range selection
  const handleCustomDateChange = (start: string, end: string) => {
    setCustomStartDate(start);
    setCustomEndDate(end);
    setDateRange("custom");
  };

  // Sync dateRange with initialDateRange when it changes
  useEffect(() => {
    setDateRange(initialDateRange);
  }, [initialDateRange]);

  // Fetch data when modal opens or filters change
  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, dateRange, customStartDate, customEndDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { startDate: start, endDate: end } = calculateDateRange(dateRange);
      setStartDate(start);
      setEndDate(end);

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const apiUrl = `${backendUrl}/meetup/detailed-by-date`;

      console.log("Fetching Meetups Data from:", apiUrl);

      const response = await fetch(
        apiUrl,
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

      console.log("Meetups API Response Status:", response.status);

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") === -1) {
        const text = await response.text();
        console.error("Received non-JSON response:", text.substring(0, 200));
        throw new Error("Server returned non-JSON response");
      }

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
    try {
      const pdfGenerator = new DashboardPDFGenerator();

      // Format data for PDF
      const records = meetupsData.map((meetup) => {
        const creatorDetails = meetup.creatorDetails || meetup.createdBy;
        let organizerName = "Unknown";

        if (typeof creatorDetails === 'object' && creatorDetails !== null) {
          if (creatorDetails.fname && creatorDetails.lname) {
            organizerName = `${creatorDetails.fname} ${creatorDetails.lname}`.trim();
          } else if (creatorDetails.name) {
            organizerName = creatorDetails.name;
          }
        }

        return {
          title: meetup.title || "Untitled Meetup",
          organizer: organizerName,
          date: formatDate(meetup.date),
          time: meetup.time || "-",
          place: meetup.meetingPlace || "-",
          attendees: Array.isArray(meetup.attendees) ? meetup.attendees.length : 0,
          agenda: meetup.agenda,
        };
      });

      pdfGenerator.generateMeetupsPDF(
        records,
        { start: startDate, end: endDate },
        meetupsData.length
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
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
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 bg-[#4A62AD]">
          <h2 className="text-base md:text-lg lg:text-xl font-bold text-white">Meetups Data</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </button>
        </div>

        {/* Date Range Filters */}
        <div className="p-4 md:p-6 border-b border-gray-200 space-y-4">
          {showFilters && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                  {([
                    { value: "15days", label: "15 Days" },
                    { value: "3months", label: "3 Months" },
                    { value: "6months", label: "6 Months" },
                    { value: "tilldate", label: "Till Date" },
                  ] as const).map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setDateRange(option.value as any);
                        // Reset custom dates when switching to preset ranges
                        setCustomStartDate("");
                        setCustomEndDate("");
                      }}
                      className={`px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm rounded-lg font-semibold transition-all ${dateRange === option.value
                        ? "bg-[#4A62AD] text-white shadow-lg"
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
                  className="px-4 py-2 bg-[#4A62AD] text-white text-xs md:text-sm font-semibold rounded-lg hover:bg-[#3b4e8a] transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Download PDF Report
                </button>
              </div>

              {/* Date Range Display - Clickable to open date picker */}
              <div className="flex gap-2 md:gap-4 justify-center">
                <button
                  onClick={() => setIsDatePickerOpen(true)}
                  className="px-3 md:px-4 py-1.5 md:py-2 bg-green-100 hover:bg-green-200 rounded-lg text-xs md:text-sm transition-colors cursor-pointer group"
                  title="Click to select custom date range"
                >
                  <span className="text-gray-600">Start: </span>
                  <span className="font-semibold text-[#4A62AD] group-hover:text-[#3b4e8a]">
                    {startDate}
                  </span>
                </button>
                <button
                  onClick={() => setIsDatePickerOpen(true)}
                  className="px-3 md:px-4 py-1.5 md:py-2 bg-green-100 hover:bg-green-200 rounded-lg text-xs md:text-sm transition-colors cursor-pointer group"
                  title="Click to select custom date range"
                >
                  <span className="text-gray-600">End: </span>
                  <span className="font-semibold text-[#4A62AD] group-hover:text-[#3b4e8a]">
                    {endDate}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Total Count & Toggle */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm md:text-base text-gray-700 font-medium">
              Total Meetups: {totalCount}
            </span>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-[#4A62AD]"
              title={showFilters ? "Hide filters" : "Show filters"}
            >
              {showFilters ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Records List */}
        <div className="overflow-y-auto max-h-[55vh] p-6 bg-gray-50 pb-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A62AD]"></div>
            </div>
          ) : meetupsData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-base md:text-lg font-medium">No meetups found</p>
              <p className="text-xs md:text-sm">Try selecting a different date range</p>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {meetupsData.map((meetup, index) => {
                // Get creator details
                const creator = meetup.creatorDetails ||
                  (typeof meetup.createdBy === 'object' ? meetup.createdBy : null);

                let creatorName = "Unknown Organizer";
                let creatorInitials = "UO";
                let creatorId = "";

                if (creator) {
                  creatorId = creator._id || creator.id || "";
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
                } else if (typeof meetup.createdBy === 'string') {
                  creatorId = meetup.createdBy;
                }

                // Check if current user is creator
                const meetupId = meetup._id || meetup.id;
                const isCreator = currentUserId && creatorId && String(currentUserId) === String(creatorId);
                const isEditing = meetupId && editingMeetupId === meetupId;

                // Get avatar URL
                const avatarUrl = creator?.avatar
                  ? creator.avatar.startsWith('http')
                    ? creator.avatar
                    : `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/${creator.avatar}`
                  : undefined;

                // Filter attendees to exclude the creator/host
                const filteredAttendees = meetup.attendees?.filter((attendee: any) => {
                  if (!creatorId) return true;
                  const attendeeId = typeof attendee === 'object' ? (attendee._id || attendee.userId || attendee.id) : attendee;
                  return String(attendeeId) !== String(creatorId);
                }) || [];

                return (
                  <div
                    key={meetupId || index}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative"
                  >
                    {isEditing ? (
                      // EDIT MODE
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                            {avatarUrl ? (
                              <img src={avatarUrl} alt={creatorName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-[#4A62AD] text-white font-bold text-sm">
                                {creatorInitials}
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm">{meetup.title}</h3>
                            <p className="text-xs text-gray-500">Editing details...</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* Meeting Place */}
                          <div className="p-3 border border-gray-200 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin className="w-4 h-4 text-red-500" />
                              <label className="text-xs font-bold text-gray-700">Meeting Place:</label>
                            </div>
                            <input
                              type="text"
                              name="meetingPlace"
                              value={editFormData.meetingPlace}
                              onChange={handleEditChange}
                              placeholder="Not specified"
                              className="w-full text-sm text-gray-600 focus:outline-none border-b border-transparent focus:border-blue-500 py-1"
                            />
                          </div>

                          {/* Meeting Agenda */}
                          <div className="p-3 border border-gray-200 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="w-4 h-4 text-purple-500" />
                              <label className="text-xs font-bold text-gray-700">Meeting Agenda:</label>
                            </div>
                            <textarea
                              name="agenda"
                              value={editFormData.agenda}
                              onChange={handleEditChange}
                              placeholder="Enter meeting agenda"
                              rows={2}
                              className="w-full text-sm text-gray-600 focus:outline-none resize-none"
                            />
                          </div>

                          {/* Meeting Date */}
                          <div className="p-3 border border-gray-200 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-4 h-4 text-orange-500" />
                              <label className="text-xs font-bold text-gray-700">Meeting Date:</label>
                            </div>
                            <input
                              type="date"
                              name="date"
                              value={editFormData.date}
                              onChange={handleEditChange}
                              className="w-full text-sm text-gray-900 focus:outline-none font-semibold"
                            />
                          </div>

                          {/* Meeting Time */}
                          <div className="p-3 border border-gray-200 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-4 h-4 text-blue-500" />
                              <label className="text-xs font-bold text-gray-700">Meeting Time:</label>
                            </div>
                            <input
                              type="time"
                              name="time"
                              value={editFormData.time}
                              onChange={handleEditChange}
                              className="w-full text-sm text-gray-900 focus:outline-none font-semibold"
                            />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={handleCancelEdit}
                            className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveEdit}
                            disabled={isSaving}
                            className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl font-semibold text-sm hover:bg-blue-600 transition-colors disabled:opacity-50"
                          >
                            {isSaving ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      // VIEW MODE
                      <>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="flex gap-3 flex-1">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                                {avatarUrl ? (
                                  <img
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
                                  <div className="w-full h-full flex items-center justify-center bg-[#4A62AD] text-white font-bold text-sm">
                                    {creatorInitials}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 text-sm mb-1 break-words">
                                {meetup.title || meetup.agenda || "No Agenda"}
                              </h3>
                              <p className="text-xs text-gray-600 mb-1 break-words">
                                Organized by: <span className="font-medium text-[#4A62AD]">{creatorName}</span>
                              </p>

                              <div className="space-y-1 mt-2">
                                <div className="flex items-center gap-1.5 text-xs">
                                  <Calendar className="w-3 h-3 text-[#4A62AD] flex-shrink-0" />
                                  <span className="text-gray-700">
                                    {formatDate(meetup.date)} at {meetup.time}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs">
                                  <MapPin className="w-3 h-3 text-[#4A62AD] flex-shrink-0" />
                                  <span className="text-gray-700 break-words">
                                    {meetup.meetingPlace || "Not specified"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs">
                                  <Users className="w-3 h-3 text-[#4A62AD] flex-shrink-0" />
                                  <span className="text-gray-700">
                                    {meetup.attendees?.length || 0} Attendees
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Agenda - Right Side */}
                          {meetup.agenda && (
                            <div className="sm:w-2/5 flex-shrink-0 mb-6 sm:mb-0">
                              <div className="p-2 bg-green-50 rounded-lg border border-green-100 h-full">
                                <p className="text-xs text-green-800 font-semibold mb-1 flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  Agenda:
                                </p>
                                <p className="text-xs text-gray-700 line-clamp-3">
                                  {meetup.agenda}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons (Edit & Expand) */}
                        <div className="absolute bottom-2 right-2 flex gap-2">
                          {isCreator && (
                            <>
                              <button
                                onClick={() => handleEditClick(meetup)}
                                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-[#4A62AD]"
                                title="Edit details"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteMeetup(meetup._id || meetup.id || "")}
                                className="p-1.5 hover:bg-red-50 rounded-full transition-colors text-gray-500 hover:text-red-500"
                                title="Delete meetup"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => toggleExpand(meetup._id || meetup.id || "")}
                            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-[#4A62AD]"
                            title={expandedMeetupId === (meetup._id || meetup.id) ? "Show less" : "Show more details"}
                          >
                            {expandedMeetupId === (meetup._id || meetup.id) ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                        </div>

                        {/* Expanded Details */}
                        {expandedMeetupId === (meetup._id || meetup.id) && (
                          <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                              <Users className="w-4 h-4 text-[#4A62AD]" />
                              Attendees Details
                            </h4>

                            {filteredAttendees.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {filteredAttendees.map((attendee: any, idx: number) => {
                                  // Handle attendee data safely
                                  const isObject = typeof attendee === 'object' && attendee !== null;
                                  const attendeeName = isObject
                                    ? (attendee.name || `${attendee.fname || ''} ${attendee.lname || ''}`.trim() || 'Unknown Name')
                                    : 'Unknown User';

                                  const attendeeAvatar = isObject && attendee.avatar
                                    ? (attendee.avatar.startsWith('http') ? attendee.avatar : `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/${attendee.avatar}`)
                                    : null;

                                  const attendeeInitials = attendeeName
                                    .split(' ')
                                    .map((n: string) => n[0])
                                    .join('')
                                    .substring(0, 2)
                                    .toUpperCase();

                                  return (
                                    <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 border border-gray-100">
                                      <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-gray-200 flex-shrink-0">
                                        {attendeeAvatar ? (
                                          <img
                                            src={attendeeAvatar}
                                            alt={attendeeName}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              e.currentTarget.style.display = 'none';
                                              if (e.currentTarget.nextSibling) {
                                                (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
                                              }
                                            }}
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-xs font-bold">
                                            {attendeeInitials}
                                          </div>
                                        )}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-xs font-semibold text-gray-900 truncate">
                                          {attendeeName}
                                        </p>
                                        {isObject && attendee.companyName && (
                                          <p className="text-[10px] text-gray-500 truncate">
                                            {attendee.companyName}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 italic">No other attendees.</p>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Date Range Picker Modal */}
      {isDatePickerOpen && (
        <DateRangePicker
          startDate={customStartDate || startDate}
          endDate={customEndDate || endDate}
          onDateChange={handleCustomDateChange}
          onClose={() => setIsDatePickerOpen(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteMeetupId}
        onClose={() => setDeleteMeetupId(null)}
        onConfirm={confirmDelete}
        title="Delete Meetup"
        message="Are you sure you want to delete this meetup? This action cannot be undone."
        itemName="meetup"
        buttonText="Delete"
        isDeleting={isDeletingMeetup}
        showNote={false}
      />
    </div>
  );
}
