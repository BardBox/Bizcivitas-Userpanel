"use client";

import React, {
  useState,
  useMemo,
  Suspense,
  useCallback,
  useEffect,
} from "react";
import {
  Search,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Filter,
  Send,
  XCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import UserCard from "../../../components/Dashboard/UserCard";
import {
  useGetConnectionsQuery,
  useGetConnectionRequestsQuery,
  useAcceptConnectionRequestMutation,
  useDeleteConnectionMutation,
} from "@/store/api";
import { useGridLayout } from "@/hooks/useGridLayout";
import { useAppDispatch } from "../../../../store/hooks";
import { addToast } from "../../../../store/toastSlice";
import ConnectionRequestCard from "@/components/Dashboard/Connections/SendAcceptRequest/ConnectionRequestCard";

function ConnectionsPageContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  // Default states
  const [activeTab, setActiveTab] = useState<"my-network" | "requests">("my-network");
  const [requestsSubTab, setRequestsSubTab] = useState<"sent" | "received">("received");

  // Update tabs based on URL parameters
  useEffect(() => {
    const tab = searchParams.get('tab');
    const subtab = searchParams.get('subtab');

    if (tab === 'requests') {
      setActiveTab('requests');
    }

    if (subtab === 'received' || subtab === 'sent') {
      setRequestsSubTab(subtab);
    }
  }, [searchParams]);

  const {
    data: connections,
    isLoading: connectionsLoading,
    error,
  } = useGetConnectionsQuery();

  // Fetch requests data
  const {
    data: activeRequestsData,
    isLoading: requestsLoading,
    error: requestsError,
    refetch: refetchRequests,
  } = useGetConnectionRequestsQuery(requestsSubTab);

  // Fetch both tabs for badge counts
  const { data: sentRequestsData } = useGetConnectionRequestsQuery("sent");
  const { data: receivedRequestsData } = useGetConnectionRequestsQuery("received");

  // Mutations for requests
  const [acceptConnection] = useAcceptConnectionRequestMutation();
  const [deleteConnection] = useDeleteConnectionMutation();

  // Extract requests
  const requests = activeRequestsData?.data?.connections || [];
  const sentCount = sentRequestsData?.data?.connections?.length || 0;
  const receivedCount = receivedRequestsData?.data?.connections?.length || 0;

  // Track processing state for requests
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<
    "default" | "recent" | "name" | "company"
  >("default");

  // Dynamic items per page based on screen resolution
  const dynamicItemsPerPage = useGridLayout();
  const [itemsPerPage, setItemsPerPage] = useState(dynamicItemsPerPage);

  // Update itemsPerPage when screen size changes
  React.useEffect(() => {
    setItemsPerPage(dynamicItemsPerPage);
    setCurrentPage(1); // Reset to first page when layout changes
  }, [dynamicItemsPerPage]);

  // Get connections count from API data
  const connectionsCount = Array.isArray(connections) ? connections.length : 0;

  // Ensure connections is an array before mapping
  const connectionsArray = Array.isArray(connections) ? connections : [];

  // Helper function to get full avatar URL - memoized to prevent recreation
  const getAvatarUrl = useCallback((avatarPath?: string) => {
    if (!avatarPath) return undefined;

    // If it's already a full URL (starts with http), return as is
    if (avatarPath.startsWith("http")) {
      return avatarPath;
    }

    // Otherwise, construct full URL with backend base URL
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    return `${baseUrl}/image/${avatarPath}`;
  }, []);

  // Transform API connections data to match UserCard props - memoized properly
  const connectionData = useMemo(() => {
    return connectionsArray.map((connection) => {
      // Get proper name with fallback
      const fullName = `${connection.fname || ""} ${
        connection.lname || ""
      }`.trim();

      // Get title with proper fallbacks - avoid long classifications and emails
      let title = "";
      if (
        connection.classification &&
        connection.classification.length <= 50 &&
        !connection.classification.includes("@") && // Exclude email addresses
        !connection.classification.includes(".com") && // Exclude URLs/domains
        !connection.classification.includes(".in") && // Exclude Indian domains
        !connection.classification.includes(".org") // Exclude org domains
      ) {
        title = connection.classification;
      } else {
        title = "Business Professional";
      }

      // Get company with proper fallbacks
      const company =
        connection.companyName ||
        connection.profile?.professionalDetails?.companyName ||
        "BizCivitas Member";

      return {
        id: connection._id || connection.id || "",
        name: fullName || "-",
        title: title || "-",
        company: company || "-",
        avatar: getAvatarUrl(connection.avatar),
        isOnline: false,
        connectionStatus: "connected" as const,
      };
    });
  }, [connectionsArray, getAvatarUrl]);

  // Filter connections based on search query
  const filteredConnections = useMemo(() => {
    if (!searchQuery.trim()) {
      return connectionData;
    }

    const query = searchQuery.toLowerCase();
    return connectionData.filter(
      (connection) =>
        connection.name.toLowerCase().includes(query) ||
        connection.title.toLowerCase().includes(query) ||
        connection.company.toLowerCase().includes(query)
    );
  }, [connectionData, searchQuery]);

  // Sort the filtered connections
  const sortedConnections = useMemo(() => {
    const sorted = [...filteredConnections];

    switch (sortBy) {
      case "recent":
        // Most recent first (reverse order assuming data comes ordered by oldest first)
        return sorted.reverse();
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "company":
        return sorted.sort((a, b) => a.company.localeCompare(b.company));
      default:
        return sorted;
    }
  }, [filteredConnections, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(sortedConnections.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentConnections = sortedConnections.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, itemsPerPage]);

  // Handle Accept Request
  const handleAccept = async (connectionId: string) => {
    setProcessingIds((prev) => new Set(prev).add(connectionId));
    try {
      await acceptConnection({ connectionId }).unwrap();

      // Small delay to allow cache invalidation to complete
      setTimeout(() => {
        dispatch(
          addToast({
            type: "success",
            message: "Connection request accepted! Check your connections.",
            duration: 3000,
          })
        );
      }, 500);

      refetchRequests();
    } catch (error: any) {
      dispatch(
        addToast({
          type: "error",
          message: error?.data?.message || "Failed to accept request",
          duration: 3000,
        })
      );
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(connectionId);
        return next;
      });
    }
  };

  // Handle Reject Request
  const handleReject = async (connectionId: string) => {
    setProcessingIds((prev) => new Set(prev).add(connectionId));
    try {
      await deleteConnection({ connectionId }).unwrap();
      dispatch(
        addToast({
          type: "success",
          message: "Connection request rejected",
          duration: 3000,
        })
      );
      refetchRequests();
    } catch (error: any) {
      dispatch(
        addToast({
          type: "error",
          message: error?.data?.message || "Failed to reject request",
          duration: 3000,
        })
      );
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(connectionId);
        return next;
      });
    }
  };

  // Handle Withdraw Request
  const handleWithdraw = async (connectionId: string) => {
    setProcessingIds((prev) => new Set(prev).add(connectionId));
    try {
      await deleteConnection({ connectionId }).unwrap();
      dispatch(
        addToast({
          type: "success",
          message: "Connection request cancelled",
          duration: 3000,
        })
      );
      refetchRequests();
    } catch (error: any) {
      dispatch(
        addToast({
          type: "error",
          message: error?.data?.message || "Failed to cancel request",
          duration: 3000,
        })
      );
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(connectionId);
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Row - Title and Buttons */}
          <div className="py-4 lg:flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                My Connections
              </h1>
              <p className="text-sm text-gray-600">
                {connectionsCount} connections
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-2 lg:mt-0">
              {/* My Network Button */}
              <button
                onClick={() => setActiveTab("my-network")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "my-network"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Users className="h-5 w-5" />
<p className="text-[14px]">                My Network
</p>              </button>

              {/* Requests Button */}
              <button
                onClick={() => setActiveTab("requests")}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "requests"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50"
                }`}
              >
                <Inbox className="h-5 w-5" />
             <p className="text-[14px]">             
   Requests</p>
                {receivedCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                    {receivedCount > 99 ? "99+" : receivedCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* My Network Tab Content */}
      {activeTab === "my-network" && (
        <>
          {/* Loading State */}
          {connectionsLoading ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Loading connections...</p>
              </div>
            </div>
          ) : error ? (
            /* Error State */
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="text-center">
                <Users className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Failed to load connections
                </h3>
                <p className="text-gray-600 mb-4">
                  There was an error loading your connections. Please try again.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            /* Search and Filter Section */
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {/* Search Bar and Filter */}
              <div className="md:flex md:flex-row items-center gap-4 flex-1 max-w-2xl mb-6">
              {/* Search Bar */}
              <div className="md:flex-1 max-w-md relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search connections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

              {/* Filter Dropdown */}
              {connectionsCount > 0 && (
                <div className="flex items-center gap-2 mt-4">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(
                        e.target.value as
                          | "default"
                          | "recent"
                          | "name"
                          | "company"
                      );
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="default">Sort by: Default</option>
                    <option value="recent">Sort by: Recent</option>
                    <option value="name">Sort by: Name</option>
                    <option value="company">Sort by: Company</option>
                  </select>
                </div>
              )}
            </div>

            {/* Search query and sort results indicator */}
            {connectionsCount > 0 &&
              (searchQuery || sortBy !== "default") && (
                <div className="mb-6">
                  <p className="text-gray-600">
                    {searchQuery && (
                      <span className="text-blue-600 font-medium">
                        Search results for &quot;{searchQuery}&quot;
                      </span>
                    )}
                    {searchQuery && sortBy !== "default" && " • "}
                    {sortBy !== "default" && (
                      <span className="text-green-600 font-medium">
                        Sorted by:{" "}
                        {sortBy === "recent"
                          ? "Recent"
                          : sortBy === "name"
                          ? "Name"
                          : "Company"}
                      </span>
                    )}
                  </p>
                </div>
              )}

            {/* My Network Content */}
            {connectionsCount === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No connections yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Start connecting with other members to build your network.
                </p>
                <button
                  onClick={() => router.push("/feeds/member-directory")}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Members
                </button>
              </div>
            ) : sortedConnections.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No connections found
                </h3>
                <p className="text-gray-600 mb-4">
                  No connections match your search criteria.
                </p>
                <button
                  onClick={clearSearch}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <>
                {/* Pagination Info */}
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {startIndex + 1}-
                    {Math.min(endIndex, sortedConnections.length)} of{" "}
                    {sortedConnections.length} connections
                  </p>
                </div>

                {/* Connections Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {currentConnections.map((connection) => (
                    <UserCard
                      key={connection.id}
                      id={connection.id}
                      name={connection.name}
                      title={connection.title}
                      company={connection.company}
                      avatar={connection.avatar}
                      isOnline={connection.isOnline}
                      referrerTab="my-network"
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-4">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => {
                          // Show first page, last page, current page, and pages around current
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                                  page === currentPage
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                {page}
                              </button>
                            );
                          } else if (
                            page === currentPage - 2 ||
                            page === currentPage + 2
                          ) {
                            return (
                              <span key={page} className="px-2 text-gray-500">
                                ...
                              </span>
                            );
                          }
                          return null;
                        }
                      )}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
            </div>
          )}
        </>
      )}

      {/* Requests Tab Content */}
      {activeTab === "requests" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Sent/Received Sub-Tabs */}
          <div className="flex gap-2 border-b border-gray-200 mb-6">
            {/* Received Sub-Tab */}
            <button
              onClick={() => setRequestsSubTab("received")}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                requestsSubTab === "received"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Inbox className="h-5 w-5" />
              Received
              {receivedCount > 0 && (
                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-semibold">
                  {receivedCount}
                </span>
              )}
            </button>

            {/* Sent Sub-Tab */}
            <button
              onClick={() => setRequestsSubTab("sent")}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                requestsSubTab === "sent"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Send className="h-5 w-5" />
              Sent
              {sentCount > 0 && (
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-semibold">
                  {sentCount}
                </span>
              )}
            </button>
          </div>

          {/* Loading State */}
          {requestsLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"></div>
                <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-blue-400 animate-ping opacity-20"></div>
              </div>
              <p className="text-gray-600 mt-6 text-lg font-medium">
                Loading {requestsSubTab} requests...
              </p>
            </div>
          )}

          {/* Error State */}
          {requestsError && (
            <div className="bg-white rounded-2xl border border-red-200 shadow-lg p-8 text-center">
              <div className="bg-red-50 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <XCircle className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Oops! Something went wrong
              </h3>
              <p className="text-gray-600 mb-6">
                We couldn't load your connection requests. Please try again.
              </p>
              <button
                onClick={() => refetchRequests()}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg hover:scale-105"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!requestsLoading && !requestsError && requests.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-12 text-center">
              {requestsSubTab === "received" ? (
                <>
                  <div className="bg-blue-50 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <Inbox className="h-12 w-12 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    No Received Requests
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    You don't have any pending connection requests at the moment.
                    Check back later or start exploring members!
                  </p>
                </>
              ) : (
                <>
                  <div className="bg-gray-50 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <Send className="h-12 w-12 text-gray-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    No Sent Requests
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    You haven't sent any connection requests yet. Start building
                    your network today!
                  </p>
                </>
              )}
              <button
                onClick={() => router.push("/feeds/member-directory")}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg hover:scale-105"
              >
                Browse Members
              </button>
            </div>
          )}

          {/* Requests List */}
          {!requestsLoading && !requestsError && requests.length > 0 && (
            <div className="space-y-3">
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  {requests.length}{" "}
                  {requests.length === 1 ? "request" : "requests"} found
                </p>
              </div>
              {requests.map((request) => (
                <ConnectionRequestCard
                  key={request.connectionId}
                  request={request}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  onWithdraw={handleWithdraw}
                  isProcessing={processingIds.has(request.connectionId)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ConnectionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <ConnectionsPageContent />
    </Suspense>
  );
}
