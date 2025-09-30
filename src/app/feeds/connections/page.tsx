"use client";

import React, { useState, useMemo } from "react";
import { Search, Users, X, ChevronLeft, ChevronRight } from "lucide-react";
import UserCard from "../../../components/Dashboard/UserCard";
import { useGetConnectionsQuery } from "../../../../store/api/userApi";

export default function ConnectionsPage() {
  const {
    data: connections,
    isLoading: connectionsLoading,
    error,
  } = useGetConnectionsQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8); // Show 8 items per page

  // Get connections count from API data
  const connectionsCount = Array.isArray(connections) ? connections.length : 0;

  // Ensure connections is an array before mapping
  const connectionsArray = Array.isArray(connections) ? connections : [];

  // Helper function to get full avatar URL
  const getAvatarUrl = (avatarPath?: string) => {
    if (!avatarPath) return undefined;

    // If it's already a full URL (starts with http), return as is
    if (avatarPath.startsWith("http")) {
      return avatarPath;
    }

    // Otherwise, construct full URL with backend base URL
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    return `${baseUrl}/image/${avatarPath}`;
  };

  // Transform API connections data to match UserCard props
  const connectionData = connectionsArray.map((connection) => {
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

    // Get company with fallback
    const company = connection.companyName || "BizCivitas Member";

    return {
      id: connection.id, // API returns 'id' not '_id'
      name: fullName || "-",
      title: title || "-",
      company: company || "-",
      avatar: getAvatarUrl(connection.avatar), // Add avatar URL
      isOnline: Math.random() > 0.5, // This would come from real-time status in production
    };
  });

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return connectionData;

    return connectionData.filter(
      (connection) =>
        connection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        connection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        connection.company.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, connectionData]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  // Loading state
  if (connectionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your connections...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  My Connections
                </h1>
                <p className="text-sm text-gray-600">
                  {connectionsCount} connections
                </p>
              </div>

              {/* Search Bar */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
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
            </div>

            <div className="flex items-center space-x-4 md:flex">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                My Network
              </button>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                Connect Members
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4 md:hidden">
          <button className="bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            My Network
          </button>
          <button className="border border-gray-300 text-gray-700 px-4 py-1 rounded-lg hover:bg-gray-50 transition-colors font-medium">
            Connect Members
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6"></div>

        {/* Results Summary */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-gray-600">
              Showing {startIndex + 1}-
              {Math.min(endIndex, filteredUsers.length)} of{" "}
              {filteredUsers.length} members
              {searchQuery && (
                <span className="ml-2 text-blue-600 font-medium">
                  for &quot;{searchQuery}&quot;
                </span>
              )}
            </p>
          </div>

          {/* Items per page selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
              Show:
            </label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value={8}>8 per page</option>
              <option value={12}>12 per page</option>
            </select>
          </div>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentUsers.map((user) => (
            <UserCard
              key={user.id}
              id={user.id || ""}
              name={user.name}
              title={user.title}
              company={user.company}
              avatar={user.avatar}
              isOnline={user.isOnline}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Pagination Info */}
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    // Show first page, last page, current page, and pages around current
                    const showPage =
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1;

                    if (!showPage && page === 2 && currentPage > 4) {
                      return (
                        <span key={page} className="px-2 text-gray-400">
                          ...
                        </span>
                      );
                    }

                    if (
                      !showPage &&
                      page === totalPages - 1 &&
                      currentPage < totalPages - 3
                    ) {
                      return (
                        <span key={page} className="px-2 text-gray-400">
                          ...
                        </span>
                      );
                    }

                    if (!showPage) return null;

                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                )}
              </div>

              {/* Next Button */}
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* No Results */}
        {currentUsers.length === 0 &&
          filteredUsers.length === 0 &&
          searchQuery && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No connections found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or clear the search to see all
                connections.
              </p>
              <button
                onClick={clearSearch}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Search
              </button>
            </div>
          )}

        {/* No Connections */}
        {connectionsCount === 0 && !connectionsLoading && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No connections yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start connecting with other members to build your network.
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Find Members
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
