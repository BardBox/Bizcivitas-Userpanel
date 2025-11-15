"use client";

import { useState, useEffect } from "react";
import { X, Download, Calendar, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import { useUpdateReferralSlipMutation, useDeleteReferralSlipMutation } from "../../../../store/api/dashboardApi";
import EditReferralModal from "./EditReferralModal";

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

interface InviteDetail {
  id: string;
  _id?: string;
  referralName?: string; // Backend field name (maps to invited person's name)
  referral?: string; // Backend field name (alternative)
  telephone?: string;
  email?: string;
  address?: string;
  comments?: string;
  contactRelation?: string;
  status?: string;
  createdAt?: string;
  date?: string;
  fromUser?: string;
  toUser?: string;
  fromUserDetails?: UserDetails;
  toUserDetails?: UserDetails;
  from?: UserDetails;
  to?: UserDetails;
  communityName?: string;
}

interface BizConnectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "given" | "received";
  initialDateRange?: "15days" | "3months" | "6months" | "tilldate";
}

export default function BizConnectDetailModal({
  isOpen,
  onClose,
  initialTab = "given",
  initialDateRange = "15days",
}: BizConnectDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"given" | "received">(initialTab);
  const [dateRange, setDateRange] = useState(initialDateRange);
  const [givenData, setGivenData] = useState<InviteDetail[]>([]);
  const [receivedData, setReceivedData] = useState<InviteDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<InviteDetail | null>(null);

  // Mutations
  const [updateReferralSlip] = useUpdateReferralSlipMutation();
  const [deleteReferralSlip] = useDeleteReferralSlipMutation();

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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/referrals/detailed-by-date`,
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
        setGivenData(data.data.referralsGiven || []);
        setReceivedData(data.data.referralsReceived || []);
      } else {
        console.error("API error:", data);
      }
    } catch (error) {
      console.error("Error fetching invite details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF generation
    alert("PDF download functionality will be implemented");
  };

  const handleDelete = async (referralId: string) => {
    if (!confirm("Are you sure you want to delete this referral?")) {
      return;
    }

    try {
      await deleteReferralSlip(referralId).unwrap();
      alert("Referral deleted successfully");
      // Refresh data
      fetchData();
    } catch (error: any) {
      console.error("Delete error:", error);
      alert(error?.data?.message || "Failed to delete referral");
    }
  };

  const handleEdit = (record: InviteDetail) => {
    setSelectedReferral(record);
    setEditModalOpen(true);
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

  const currentData = activeTab === "given" ? givenData : receivedData;
  const totalCount = currentData.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <h2 className="text-base md:text-lg lg:text-xl font-bold text-white">BizConnect Data</h2>
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
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Given ({givenData.length})
          </button>
          <button
            onClick={() => setActiveTab("received")}
            className={`flex-1 py-3 md:py-4 px-4 md:px-6 text-sm md:text-base font-semibold transition-colors ${
              activeTab === "received"
                ? "bg-blue-500 text-white"
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
                onClick={() => setDateRange(option.value as any)}
                className={`px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm rounded-lg font-semibold transition-all ${
                  dateRange === option.value
                    ? "bg-blue-600 text-white shadow-lg"
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
            className="w-full py-2.5 md:py-3 bg-blue-600 text-white text-sm md:text-base font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <Download className="w-4 h-4 md:w-5 md:h-5" />
            Download PDF Report
          </button>

          {/* Date Range Display */}
          <div className="flex gap-2 md:gap-4 justify-center">
            <div className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-100 rounded-lg text-xs md:text-sm">
              <span className="text-gray-600">Start: </span>
              <span className="font-semibold text-blue-900">{startDate}</span>
            </div>
            <div className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-100 rounded-lg text-xs md:text-sm">
              <span className="text-gray-600">End: </span>
              <span className="font-semibold text-blue-900">{endDate}</span>
            </div>
          </div>

          {/* Total Count */}
          <div className="text-center text-sm md:text-base text-gray-700 font-medium">
            Total BizConnect {activeTab === "given" ? "Given" : "Received"}: {totalCount}
          </div>
        </div>

        {/* Records List */}
        <div className="overflow-y-auto max-h-[55vh] p-6 bg-gray-50 pb-8">
          <div className="mb-4 p-3 bg-blue-100 rounded text-sm">
            <strong>Debug:</strong> Loading: {loading.toString()}, Given: {givenData.length}, Received: {receivedData.length}, Current: {currentData.length}
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : currentData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-base md:text-lg font-medium">No records found</p>
              <p className="text-xs md:text-sm">Try selecting a different date range</p>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {currentData
                .filter((record) => {
                  // Filter out records with missing user data
                  const displayUser = activeTab === "given"
                    ? (record.toUserDetails || record.to)
                    : (record.fromUserDetails || record.from);
                  return displayUser !== null && displayUser !== undefined;
                })
                .map((record) => {
                  // Use the correct field names based on actual API response
                  const displayUser = activeTab === "given"
                    ? (record.toUserDetails || record.to)
                    : (record.fromUserDetails || record.from);


                  // Get user name from various possible sources
                  let userName = "Unknown User";
                  if (displayUser!.fname && displayUser!.lname) {
                    userName = `${displayUser!.fname} ${displayUser!.lname}`.trim();
                  } else if (displayUser!.name) {
                    userName = displayUser!.name;
                  } else if (activeTab === "given" && record.toUser) {
                    userName = record.toUser;
                  } else if (activeTab === "received" && record.fromUser) {
                    userName = record.fromUser;
                  }

                  // Get initials
                  let userInitials = "UU";
                  if (displayUser!.fname && displayUser!.lname) {
                    userInitials = `${displayUser!.fname.charAt(0)}${displayUser!.lname.charAt(0)}`;
                  } else if (userName && userName !== "Unknown User") {
                    const nameParts = userName.split(" ");
                    if (nameParts.length >= 2) {
                      userInitials = `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`;
                    } else if (nameParts.length === 1) {
                      userInitials = nameParts[0].substring(0, 2).toUpperCase();
                    }
                  }

                  const invitedName = record.referralName || record.referral || "N/A";

                  // Get avatar URL
                  const avatarUrl = displayUser?.avatar
                    ? displayUser.avatar.startsWith('http')
                      ? displayUser.avatar
                      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/${displayUser.avatar}`
                    : null;

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
                            {avatarUrl ? (
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
                                className="w-full h-full flex items-center justify-center bg-blue-600 text-white font-bold text-sm"
                              >
                                {userInitials}
                              </div>
                            )}
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
                            {record.contactRelation && (
                              <p className="text-xs text-blue-600">
                                Contact Relation: <span className="font-medium">{record.contactRelation}</span>
                              </p>
                            )}
                            {invitedName && invitedName !== "N/A" && (
                              <p className="text-xs text-gray-700">
                                Invited: <span className="font-medium">{invitedName}</span>
                              </p>
                            )}
                            {record.status && (
                              <p className={`text-xs ${
                                record.status === "got the business" ? "text-green-600" :
                                record.status === "contacted" ? "text-blue-600" :
                                record.status === "not contacted yet" ? "text-yellow-600" :
                                record.status === "no response" ? "text-red-600" :
                                "text-gray-600"
                              }`}>
                                Status: <span className="font-medium capitalize">{record.status}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Date and Actions */}
                      <div className="sm:w-2/5 flex-shrink-0">
                        <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                          <p className="text-xs text-gray-600 mb-1">
                            Date: <span className="font-semibold text-blue-900">{formatDate(record.createdAt || record.date || "")}</span>
                          </p>

                          {/* Edit and Delete buttons (only for Given tab) */}
                          {activeTab === "given" && (
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleEdit(record)}
                                className="flex-1 px-3 py-1.5 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors flex items-center justify-center gap-1"
                                title="Edit referral"
                              >
                                <Edit className="w-3 h-3" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(record._id || record.id)}
                                className="flex-1 px-3 py-1.5 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors flex items-center justify-center gap-1"
                                title="Delete referral"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </button>
                            </div>
                          )}
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

      {/* Edit Referral Modal */}
      <EditReferralModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        referral={selectedReferral}
        onSuccess={() => {
          fetchData();
          setEditModalOpen(false);
        }}
      />
    </div>
  );
}
