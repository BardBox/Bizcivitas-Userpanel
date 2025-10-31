"use client";

import { useState, useEffect } from "react";
import { X, Download, IndianRupee } from "lucide-react";

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
  initialDateRange?: "15days" | "3months" | "6months" | "tilldate";
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
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const calculateDateRange = (range: string) => {
    const now = new Date();
    const start = new Date();

    switch (range) {
      case "15days":
        start.setDate(now.getDate() - 14);
        break;
      case "3months":
        start.setMonth(now.getMonth() - 3);
        break;
      case "6months":
        start.setMonth(now.getMonth() - 6);
        break;
      case "tilldate":
        start.setFullYear(2000);
        break;
    }

    return {
      startDate: start.toISOString().split("T")[0],
      endDate: now.toISOString().split("T")[0],
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/record/detailed-by-date`,
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

      console.log("BizWin API Response:", data);
      console.log("BizWin Response OK:", response.ok);
      console.log("BizWin Success:", data.success);

      if (response.ok && data.success) {
        console.log("BizWin data received:", data.data);
        console.log("Records Given:", data.data.tyfcbGiven);
        console.log("Records Received:", data.data.tyfcbReceived);

        setGivenData(data.data.tyfcbGiven || []);
        setReceivedData(data.data.tyfcbReceived || []);

        console.log("Given data set to:", data.data.tyfcbGiven?.length || 0, "records");
        console.log("Received data set to:", data.data.tyfcbReceived?.length || 0, "records");
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
    console.log("Downloading BizWin PDF report...");
    alert("PDF download functionality will be implemented");
  };

  if (!isOpen) return null;

  const currentData = activeTab === "given" ? givenData : receivedData;
  const totalAmount = currentData.reduce((sum, record) => sum + (record.amount || 0), 0);
  const totalCount = currentData.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-600 to-emerald-600">
          <h2 className="text-2xl font-bold text-white">BizWin Data (TYFCB)</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("given")}
            className={`flex-1 py-4 px-6 font-semibold transition-colors ${
              activeTab === "given"
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Given ({givenData.length})
          </button>
          <button
            onClick={() => setActiveTab("received")}
            className={`flex-1 py-4 px-6 font-semibold transition-colors ${
              activeTab === "received"
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Received ({receivedData.length})
          </button>
        </div>

        {/* Date Range Filters */}
        <div className="p-6 border-b border-gray-200 space-y-4">
          <div className="flex gap-2 flex-wrap">
            {[
              { value: "15days", label: "15 Days" },
              { value: "3months", label: "3 Months" },
              { value: "6months", label: "6 Months" },
              { value: "tilldate", label: "Till Date" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setDateRange(option.value as any)}
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
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
            className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <Download className="w-5 h-5" />
            Download PDF Report
          </button>

          {/* Date Range Display */}
          <div className="flex gap-4 justify-center">
            <div className="px-4 py-2 bg-green-100 rounded-lg text-sm">
              <span className="text-gray-600">Start: </span>
              <span className="font-semibold text-green-900">{startDate}</span>
            </div>
            <div className="px-4 py-2 bg-green-100 rounded-lg text-sm">
              <span className="text-gray-600">End: </span>
              <span className="font-semibold text-green-900">{endDate}</span>
            </div>
          </div>

          {/* Total Amount & Count */}
          <div className="flex gap-4 justify-center">
            <div className="px-4 py-2 bg-emerald-100 rounded-lg text-sm">
              <span className="text-gray-600">Total Amount: </span>
              <span className="font-bold text-emerald-900">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="px-4 py-2 bg-emerald-100 rounded-lg text-sm">
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
              <p className="text-lg font-medium">No records found</p>
              <p className="text-sm">Try selecting a different date range</p>
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
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                            {displayUser?.avatar && displayUser.avatar.startsWith('http') ? (
                              <img
                                src={displayUser.avatar}
                                alt={userName}
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
                              className="w-full h-full flex items-center justify-center bg-green-600 text-white font-bold text-lg"
                              style={{ display: displayUser?.avatar && displayUser.avatar.startsWith('http') ? 'none' : 'flex' }}
                            >
                              {userInitials}
                            </div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {userName}
                          </h3>
                          {displayUser?.business && (
                            <p className="text-sm text-gray-600 mt-0.5">
                              {displayUser.business}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <IndianRupee className="w-5 h-5 text-green-600" />
                            <span className="text-xl font-bold text-green-700">
                              {formatCurrency(record.amount)}
                            </span>
                          </div>
                          {record.comments && (
                            <p className="text-sm text-gray-600 mt-2 italic">
                              "{record.comments}"
                            </p>
                          )}
                          <p className="text-sm text-green-600 mt-1">
                            Status: <span className="font-medium">Got the business</span>
                          </p>
                        </div>

                        {/* Date */}
                        <div className="text-right text-sm text-gray-500">
                          {formatDate(record.createdAt || record.date || "")}
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
