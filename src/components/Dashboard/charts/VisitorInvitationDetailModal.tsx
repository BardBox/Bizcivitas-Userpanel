"use client";

import { useState, useEffect } from "react";
import { X, Download, Mail, Phone, MapPin, IndianRupee, Calendar } from "lucide-react";
import DateRangePicker from "../DateRangePicker";

interface VisitorRecord {
  _id: string;
  visitorName: string;
  email: string;
  businessCategory?: string;
  businessSubcategory?: string;
  mobile?: string;
  amount?: number;
  status?: string;
  avatar?: string;
  meetingTitle?: string;
  meetingDate?: string;
  createdAt: string;
}

interface VisitorInvitationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDateRange?: "15days" | "3months" | "6months" | "tilldate" | "custom";
}

export default function VisitorInvitationDetailModal({
  isOpen,
  onClose,
  initialDateRange = "15days",
}: VisitorInvitationDetailModalProps) {
  const [dateRange, setDateRange] = useState(initialDateRange);
  const [visitorsData, setVisitorsData] = useState<VisitorRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

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
        startDate.setDate(currentDate.getDate() - 14);
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

    // Add IST offset (5.5 hours)
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
      const apiUrl = `${backendUrl}/meetings/detailed-by-date`;

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

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") === -1) {
        const text = await response.text();
        console.error("Received non-JSON response:", text.substring(0, 200));
        throw new Error("Server returned non-JSON response");
      }

      const data = await response.json();

      if (response.ok && data.success) {
        // Extract the array from the response
        // The API returns { data: { invitedUsers: [...] } }
        const visitorsList = data.data.invitedUsers || data.data.visitors || [];

        if (Array.isArray(visitorsList)) {
          setVisitorsData(visitorsList);
        } else {
          console.error("Unexpected data format:", data);
          setVisitorsData([]);
        }
      } else {
        console.error("API error:", data);
      }
    } catch (error) {
      console.error("Error fetching visitor details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    alert("PDF download functionality will be implemented");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (!isOpen) return null;

  const totalCount = visitorsData.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 bg-[#4A62AD]">
          <h2 className="text-base md:text-lg lg:text-xl font-bold text-white">Visitor Invitation Data</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </button>
        </div>

        {/* Date Range Filters */}
        <div className="p-4 md:p-6 border-b border-gray-200 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              {[
                { value: "15days", label: "15 Days" },
                { value: "3months", label: "3 Months" },
                { value: "6months", label: "6 Months" },
                { value: "tilldate", label: "Till Date" },
              ].map((option) => (
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
              className="w-full md:w-auto px-6 py-2.5 md:py-3 bg-[#4A62AD] text-white text-sm md:text-base font-semibold rounded-xl hover:bg-[#3b4e8a] transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <Download className="w-4 h-4 md:w-5 md:h-5" />
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

          {/* Total Count */}
          <div className="text-center text-sm md:text-base text-gray-700 font-medium">
            Total Visitors: {totalCount}
          </div>
        </div>

        {/* Records List */}
        <div className="overflow-y-auto max-h-[55vh] p-6 bg-gray-50 pb-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A62AD]"></div>
            </div>
          ) : visitorsData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-base md:text-lg font-medium">No visitors found</p>
              <p className="text-xs md:text-sm">Try selecting a different date range</p>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {visitorsData.map((visitor, index) => {
                // Calculate initials
                const name = visitor.visitorName || "Unknown Visitor";
                const nameParts = name.split(" ");
                let initials = name.substring(0, 2).toUpperCase();

                if (nameParts.length >= 2) {
                  initials = `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
                }

                // Get avatar URL
                const avatarUrl = visitor.avatar
                  ? visitor.avatar.startsWith('http')
                    ? visitor.avatar
                    : `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/${visitor.avatar}`
                  : null;

                return (
                  <div
                    key={visitor._id || index}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-100">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextSibling) {
                                  (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-full h-full flex items-center justify-center bg-[#4A62AD] text-white font-bold text-lg ${avatarUrl ? 'hidden' : 'flex'}`}
                          >
                            {initials}
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 space-y-3">
                        {/* Name */}
                        <h3 className="font-bold text-gray-900 text-base break-words pt-1">
                          {visitor.visitorName}
                        </h3>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Left Column */}
                          <div className="space-y-2">
                            {visitor.email && (
                              <div className="flex items-start gap-2">
                                <Mail className="w-4 h-4 text-[#4A62AD] flex-shrink-0 mt-0.5" />
                                <span className="text-xs text-gray-700 break-all">{visitor.email}</span>
                              </div>
                            )}

                            {visitor.businessCategory && (
                              <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-[#4A62AD] flex-shrink-0 mt-0.5" />
                                <div className="text-xs text-gray-700">
                                  <span className="font-medium">Category:</span> {visitor.businessCategory}
                                  {visitor.businessSubcategory && (
                                    <span className="block text-gray-600">
                                      Subcategory: {visitor.businessSubcategory}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {visitor.mobile && (
                              <div className="flex items-start gap-2">
                                <Phone className="w-4 h-4 text-[#4A62AD] flex-shrink-0 mt-0.5" />
                                <span className="text-xs text-gray-700">{visitor.mobile}</span>
                              </div>
                            )}
                          </div>

                          {/* Right Column */}
                          <div className="space-y-2">
                            {visitor.amount !== undefined && visitor.amount !== null && (
                              <div className="flex items-start gap-2">
                                <IndianRupee className="w-4 h-4 text-[#4A62AD] flex-shrink-0 mt-0.5" />
                                <span className="text-xs text-gray-700">
                                  <span className="font-medium">Amount:</span> ₹{visitor.amount}
                                </span>
                              </div>
                            )}

                            {visitor.status && (
                              <div className="flex items-start gap-2">
                                <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(visitor.status)}`}>
                                  Status: {visitor.status}
                                </div>
                              </div>
                            )}

                            {visitor.meetingTitle && visitor.meetingTitle !== "N/A" && (
                              <div className="flex items-start gap-2">
                                <Calendar className="w-4 h-4 text-[#4A62AD] flex-shrink-0 mt-0.5" />
                                <div className="text-xs text-gray-700">
                                  <span className="font-medium block">{visitor.meetingTitle}</span>
                                  {visitor.meetingDate && (
                                    <span className="text-gray-600">
                                      {formatDate(visitor.meetingDate)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="text-xs text-gray-600">
                              <span className="font-medium">Created:</span> {formatDate(visitor.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div >
      </div >

      {/* Date Range Picker Modal */}
      {
        isDatePickerOpen && (
          <DateRangePicker
            startDate={customStartDate || startDate}
            endDate={customEndDate || endDate}
            onDateChange={handleCustomDateChange}
            onClose={() => setIsDatePickerOpen(false)}
          />
        )
      }
    </div >
  );
}
