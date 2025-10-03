"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Search } from "lucide-react";
import ConnectionCard from "@/components/Dashboard/Connections/ConnectionCard";
import {
  usePagination,
  Pagination,
  PaginationInfo,
  PaginationControls,
} from "@/components/Dashboard/Pagination";
import StatsCard from "@/components/Dashboard/StatsCard";
import LoadingSkeleton from "@/components/Dashboard/Connections/LoadingSkeleton";
import {
  useGetConnectionProfileQuery,
  useGetCurrentUserQuery,
} from "../../../../../../store/api/userApi";

interface ConnectionsViewPageProps {
  slug: string;
}

interface Connection {
  _id: string;
  sender?: string;
  receiver?: string;
  isAccepted: boolean;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

const ConnectionsViewPage: React.FC<ConnectionsViewPageProps> = ({ slug }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [requestStates, setRequestStates] = useState<
    Record<string, "idle" | "sending" | "sent">
  >({});

  const {
    data: connectionProfile,
    isLoading,
    error,
  } = useGetConnectionProfileQuery(slug);

  // Get current user's profile to check existing connections
  const { data: currentUserProfile, isLoading: isCurrentUserLoading } =
    useGetCurrentUserQuery();

  // Prepare data for hooks (must be called before any conditional returns)
  const connections: Connection[] = connectionProfile?.connections || [];
  const acceptedConnections = connections.filter(
    (conn: Connection) => conn.isAccepted
  );

  // Filter connections based on search term - will be enhanced when user names are available
  const filteredConnections = useMemo(() => {
    if (!searchTerm.trim()) return acceptedConnections;
    // TODO: Implement search when user names are available from ConnectionCard
    return acceptedConnections;
  }, [searchTerm, acceptedConnections]);

  // Initialize pagination
  const pagination = usePagination<Connection>(filteredConnections, {
    initialItemsPerPage: 8,
    itemsPerPageOptions: [8, 12, 16, 20],
    resetPageOnDataChange: true,
  });

  // Get current page data
  const currentConnections = pagination.paginatedData(filteredConnections);

  // Get current user's connections to check existing relationships
  const currentUserConnections = currentUserProfile?.connections || [];
  const currentUserConnectionIds = useMemo(
    () =>
      new Set(
        currentUserConnections
          .filter((conn: Connection) => conn.isAccepted)
          .map((conn: Connection) => {
            if (conn.user?._id) {
              return conn.user._id;
            } else if (conn.sender && conn.receiver) {
              return conn.sender === currentUserProfile?._id
                ? conn.receiver
                : conn.sender;
            }
            return null;
          })
          .filter((id): id is string => id !== null)
      ),
    [currentUserConnections, currentUserProfile?._id]
  );

  // Helper function to determine connection status
  const getConnectionStatus = (userId: string) => {
    const isCurrentUser = userId === currentUserProfile?._id;
    const isAlreadyConnected = currentUserConnectionIds.has(userId);

    if (isCurrentUser) return "self";
    if (isAlreadyConnected) return "connected";
    return "not_connected";
  };

  const clearSearch = () => {
    setSearchTerm("");
    pagination.actions.goToFirstPage();
  };

  // Helper functions for stats calculations
  const getRequestsSentCount = () =>
    Object.values(requestStates).filter((state) => state === "sent").length;

  const getAvailableToConnectCount = () =>
    acceptedConnections.length - getRequestsSentCount();

  const handleSendRequest = async (userId: string, userName: string) => {
    setRequestStates((prev) => ({ ...prev, [userId]: "sending" }));

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock delay

      setRequestStates((prev) => ({ ...prev, [userId]: "sent" }));

      // Show success message
      setTimeout(() => {
        alert(`Connection request sent to ${userName}!`);
      }, 100);
    } catch (error) {
      setRequestStates((prev) => ({ ...prev, [userId]: "idle" }));
      alert("Failed to send connection request. Please try again.");
    }
  };

  if (isLoading || isCurrentUserLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading connections...</p>
        </div>
      </div>
    );
  }

  if (error || !connectionProfile) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Profile Not Found
          </h1>
          <p className="text-red-600 mb-4">
            Unable to load profile connections.
          </p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const userName = `${connectionProfile?.fname || ""} ${
    connectionProfile?.lname || ""
  }`.trim();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
              </button>
              <div className="flex items-center space-x-3">
                <Users className="h-6 w-6 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {userName}&apos;s Connections
                  </h1>
                  <p className="text-sm text-gray-600">
                    {acceptedConnections.length} connections
                  </p>
                </div>
              </div>
            </div>

            {/* Search Bar, Items Per Page, and Pagination Info */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search connections..."
                  className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Items Per Page Selector */}
              {filteredConnections.length > 0 && (
                <div className="flex items-center space-x-2 text-sm">
                  <label className="text-gray-600">Show:</label>
                  <select
                    value={pagination.state.itemsPerPage}
                    onChange={(e) => {
                      pagination.actions.setItemsPerPage(
                        Number(e.target.value)
                      );
                      pagination.actions.goToFirstPage();
                    }}
                    className="border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {[8, 12, 16, 20].map((option) => (
                      <option key={option} value={option}>
                        {option} per page
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Pagination Info */}
              {filteredConnections.length > 0 && (
                <PaginationInfo
                  state={pagination.state}
                  itemName="members"
                  searchTerm={searchTerm}
                  showItemsPerPage={false}
                  className="text-sm"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredConnections.length === 0 && !isLoading ? (
          <div className="text-center py-16">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No matching connections" : "No connections yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? `No connections found matching "${searchTerm}"`
                : `${userName} hasn't connected with anyone yet.`}
            </p>
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Stats Bar */}
            <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                  value={acceptedConnections.length}
                  label="Total Connections"
                  color="blue"
                />
                <StatsCard
                  value={getRequestsSentCount()}
                  label="Requests Sent"
                  color="green"
                />
                <StatsCard
                  value={getAvailableToConnectCount()}
                  label="Available to Connect"
                  color="purple"
                />
              </div>
            </div>

            {/* Connections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentConnections.map((connection) => {
                const otherUserId =
                  connection.sender === connectionProfile?._id
                    ? connection.receiver
                    : connection.sender;

                if (!otherUserId) return null;

                const requestState = requestStates[otherUserId] || "idle";
                const connectionStatus = getConnectionStatus(otherUserId);

                return (
                  <ConnectionCard
                    key={connection._id}
                    userId={otherUserId}
                    connectionDate={connection.createdAt || ""}
                    requestState={requestState}
                    connectionStatus={connectionStatus}
                    onSendRequest={handleSendRequest}
                  />
                );
              })}
            </div>

            {/* Pagination Controls */}
            <div className="mt-8">
              <PaginationControls
                state={pagination.state}
                actions={pagination.actions}
                showFirstLastButtons={true}
                showPageNumbers={true}
                maxVisiblePages={5}
                size="md"
                className="flex justify-center"
                onPageChange={() =>
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConnectionsViewPage;
