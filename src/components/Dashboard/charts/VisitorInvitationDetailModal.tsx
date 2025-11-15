"use client";

import { useState, useEffect } from "react";
import { X, Download, Mail, Phone, MapPin, IndianRupee, Calendar } from "lucide-react";

interface VisitorRecord {
  _id: string;
  visitorName: string;
  email: string;
  businessCategory?: string;
  businessSubcategory?: string;
  mobile?: string;
  amount?: number;
  status?: string;
  meeting?: {
    _id: string;
    title: string;
    date: string;
  };
  createdAt: string;
}

interface VisitorInvitationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDateRange?: "15days" | "3months" | "6months" | "tilldate";
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

  const calculateDateRange = (range: string) => {
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/meeting/detailed-by-date`,
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
        setVisitorsData(data.data.visitors || []);
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
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-orange-600 to-red-600">
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
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
            {[
              { value: "15days", label: "15 Days" },
              { value: "3months", label: "3 Months" },
              { value: "6months", label: "6 Months" },
              { value: "tilldate", label: "Till Date" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setDateRange(option.value as any)}
                className={`px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm rounded-lg font-semibold transition-all ${
                  dateRange === option.value
                    ? "bg-orange-600 text-white shadow-lg"
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
            className="w-full py-2.5 md:py-3 bg-orange-600 text-white text-sm md:text-base font-semibold rounded-xl hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <Download className="w-4 h-4 md:w-5 md:h-5" />
            Download PDF Report
          </button>

          {/* Date Range Display */}
          <div className="flex gap-2 md:gap-4 justify-center">
            <div className="px-3 md:px-4 py-1.5 md:py-2 bg-orange-100 rounded-lg text-xs md:text-sm">
              <span className="text-gray-600">Start: </span>
              <span className="font-semibold text-orange-900">{startDate}</span>
            </div>
            <div className="px-3 md:px-4 py-1.5 md:py-2 bg-orange-100 rounded-lg text-xs md:text-sm">
              <span className="text-gray-600">End: </span>
              <span className="font-semibold text-orange-900">{endDate}</span>
            </div>
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
          ) : visitorsData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-base md:text-lg font-medium">No visitors found</p>
              <p className="text-xs md:text-sm">Try selecting a different date range</p>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {visitorsData.map((visitor) => (
                <div
                  key={visitor._id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    {/* Name */}
                    <h3 className="font-bold text-gray-900 text-base break-words">
                      {visitor.visitorName}
                    </h3>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Left Column */}
                      <div className="space-y-2">
                        {visitor.email && (
                          <div className="flex items-start gap-2">
                            <Mail className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-gray-700 break-all">{visitor.email}</span>
                          </div>
                        )}

                        {visitor.businessCategory && (
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
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
                            <Phone className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-gray-700">{visitor.mobile}</span>
                          </div>
                        )}
                      </div>

                      {/* Right Column */}
                      <div className="space-y-2">
                        {visitor.amount !== undefined && visitor.amount !== null && (
                          <div className="flex items-start gap-2">
                            <IndianRupee className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
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

                        {visitor.meeting && (
                          <div className="flex items-start gap-2">
                            <Calendar className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                            <div className="text-xs text-gray-700">
                              <span className="font-medium block">{visitor.meeting.title}</span>
                              <span className="text-gray-600">
                                {formatDate(visitor.meeting.date)}
                              </span>
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
