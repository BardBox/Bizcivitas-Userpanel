"use client";

import { useState, useEffect } from "react";
import { X, Download, IndianRupee } from "lucide-react";
import DateRangePicker from "../DateRangePicker";

interface UserDetails {
  _id?: string;
  id?: string;
  fname?: string;
  lname?: string;
  name?: string;
  avatar?: string | null;
  business?: string;
  businessSubcategory?: string;
  companyName?: string;
  email?: string;
  membershipType?: string;
}

interface BizWinRecord {
  id: string;
  _id?: string;
  amount: number;
  comments?: string;
  createdAt?: string;
  date?: string;
  fromUser?: UserDetails | string;
  toUser?: UserDetails | string;
  fromUserDetails?: UserDetails;
  toUserDetails?: UserDetails;
  from?: UserDetails;
  to?: UserDetails;
}

interface BizWinDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "given" | "received";
  initialDateRange?: "15days" | "3months" | "6months" | "tilldate" | "custom";
}

export default function BizWinDetailModal({
  isOpen,
  onClose,
  initialTab = "given",
  initialDateRange = "15days",
}: BizWinDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"given" | "received">(initialTab);
  const [dateRange, setDateRange] = useState(initialDateRange);
  const [givenData, setGivenData] = useState<BizWinRecord[]>([]);
  const [receivedData, setReceivedData] = useState<BizWinRecord[]>([]);
  const [totalGivenAmount, setTotalGivenAmount] = useState(0);
  const [totalReceivedAmount, setTotalReceivedAmount] = useState(0);
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


      const backendUrl = (process as any).env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

      const response = await fetch(
        `${backendUrl}/record/detailed-by-date`,
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

        setGivenData(data.data.tyfcbGiven || []);
        setReceivedData(data.data.tyfcbReceived || []);
        setTotalGivenAmount(data.data.totalGivenAmount || 0);
        setTotalReceivedAmount(data.data.totalReceivedAmount || 0);

      } else {
        console.error("BizWin API error:", data);
      }
    } catch (error) {
      console.error("Error fetching BizWin details:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(2)} K`;
    } else {
      return `₹${amount.toFixed(2)}`;
    }
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

  const handleDownloadPDF = () => {
    alert("PDF download functionality will be implemented");
  };

  if (!isOpen) return null;

  const currentData = activeTab === "given" ? givenData : receivedData;
  const totalAmount = activeTab === "given" ? totalGivenAmount : totalReceivedAmount;
  const totalCount = currentData.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-green-600 to-emerald-600">
          <h2 className="text-base md:text-lg lg:text-xl font-bold text-white">BizWin Data (TYFCB)</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("given")}
            className={`flex-1 py-3 md:py-4 px-4 md:px-6 text-sm md:text-base font-semibold transition-colors ${
              activeTab === "given"
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Given ({givenData.length})
          </button>
          <button
            onClick={() => setActiveTab("received")}
            className={`flex-1 py-3 md:py-4 px-4 md:px-6 text-sm md:text-base font-semibold transition-colors ${
              activeTab === "received"
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Received ({receivedData.length})
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
                onClick={() => {
                  setDateRange(option.value as any);
                  // Reset custom dates when switching to preset ranges
                  if (option.value !== "custom") {
                    setCustomStartDate("");
                    setCustomEndDate("");
                  }
                }}
                className={`px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm rounded-lg font-semibold transition-all ${
                  dateRange === option.value
                    ? "bg-green-600 text-white shadow-lg"
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
            className="w-full py-2.5 md:py-3 bg-green-600 text-white text-sm md:text-base font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <Download className="w-4 h-4 md:w-5 md:h-5" />
            Download PDF Report
          </button>

          {/* Date Range Display - Clickable to open date picker */}
          <div className="flex gap-2 md:gap-4 justify-center">
            <button
              onClick={() => setIsDatePickerOpen(true)}
              className="px-3 md:px-4 py-1.5 md:py-2 bg-green-100 hover:bg-green-200 rounded-lg text-xs md:text-sm transition-colors cursor-pointer group"
              title="Click to select custom date range"
            >
              <span className="text-gray-600">Start: </span>
              <span className="font-semibold text-green-900 group-hover:text-green-700">
                {startDate}
              </span>
            </button>
            <button
              onClick={() => setIsDatePickerOpen(true)}
              className="px-3 md:px-4 py-1.5 md:py-2 bg-green-100 hover:bg-green-200 rounded-lg text-xs md:text-sm transition-colors cursor-pointer group"
              title="Click to select custom date range"
            >
              <span className="text-gray-600">End: </span>
              <span className="font-semibold text-green-900 group-hover:text-green-700">
                {endDate}
              </span>
            </button>
          </div>

          {/* Total Amount & Count */}
          <div className="flex gap-2 md:gap-4 justify-center">
            <div className="px-3 md:px-4 py-1.5 md:py-2 bg-emerald-100 rounded-lg text-xs md:text-sm">
              <span className="text-gray-600">Total Amount: </span>
              <span className="font-bold text-emerald-900">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="px-3 md:px-4 py-1.5 md:py-2 bg-emerald-100 rounded-lg text-xs md:text-sm">
              <span className="text-gray-600">Total Records: </span>
              <span className="font-bold text-emerald-900">{totalCount}</span>
            </div>
          </div>
        </div>

        {/* Records List */}
        <div className="overflow-y-auto max-h-[50vh] p-6 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : currentData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-base md:text-lg font-medium">No records found</p>
              <p className="text-xs md:text-sm">Try selecting a different date range</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentData
                .filter((record) => {
                  const user = activeTab === "given" ? record.toUser : record.fromUser;
                  return user !== null && user !== undefined;
                })
                .map((record) => {
                  // API returns toUser and fromUser as objects with user details
                  const user = activeTab === "given" ? record.toUser : record.fromUser;
                  const displayUser = typeof user === 'object' ? user : null;

                  let userName = "Unknown User";
                  let userBusiness = "";
                  let userAvatar = null;

                  if (displayUser) {
                    userName = displayUser.name || "Unknown User";
                    userBusiness = displayUser.business || displayUser.companyName || "";
                    userAvatar = displayUser.avatar;
                  } else if (typeof user === 'string') {
                    userName = user;
                  }

                  let userInitials = "UU";
                  if (userName && userName !== "Unknown User") {
                    const nameParts = userName.split(" ");
                    if (nameParts.length >= 2) {
                      userInitials = `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`;
                    } else if (nameParts.length === 1) {
                      userInitials = nameParts[0].substring(0, 2).toUpperCase();
                    }
                  }

                  return (
                    <div
                      key={record.id || record._id}
                      className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex gap-3 flex-1">
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                              {(() => {
                                const avatarUrl = displayUser?.avatar
                                  ? displayUser.avatar.startsWith('http')
                                    ? displayUser.avatar
                                    : `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/${displayUser.avatar}`
                                  : null;

                                return avatarUrl ? (
                                  <img
                                    key={`avatar-img-${record.id || record._id}`}
                                    src={avatarUrl}
                                    alt={userName}
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
                                    key={`avatar-initials-${record.id || record._id}`}
                                    className="w-full h-full flex items-center justify-center bg-green-600 text-white font-bold text-sm"
                                  >
                                    {userInitials}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-sm mb-1 break-words">
                              {userName}
                            </h3>
                            {displayUser?.business && (
                              <p className="text-xs text-gray-600 mb-1 break-words">
                                {displayUser.business}
                              </p>
                            )}

                            <div className="space-y-1 mt-2">
                              <div className="flex items-center gap-1.5">
                                <IndianRupee className="w-3 h-3 text-green-600 flex-shrink-0" />
                                <span className="text-sm font-bold text-green-700">
                                  {formatCurrency(record.amount)}
                                </span>
                              </div>
                              <p className="text-xs text-green-600">
                                Status: <span className="font-medium">Got the business</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Comments and Date */}
                        <div className="sm:w-2/5 flex-shrink-0">
                          <div className="p-2 bg-green-50 rounded-lg border border-green-100">
                            {record.comments && (
                              <>
                                <p className="text-xs text-green-800 font-semibold mb-1">Comments:</p>
                                <p className="text-xs text-gray-700 line-clamp-2 italic mb-2">
                                  "{record.comments}"
                                </p>
                              </>
                            )}
                            <p className="text-xs text-gray-600">
                              Date: <span className="font-semibold text-green-900">{formatDate(record.createdAt || record.date || "")}</span>
                            </p>
                          </div>
                        </div>
                      </div>
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
    </div>
  );
}
