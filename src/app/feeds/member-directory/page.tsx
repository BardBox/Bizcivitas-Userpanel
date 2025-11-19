"use client";

import React, { useState, useMemo, ChangeEvent } from "react";
import { Users, Filter, X, Search, ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import UserCard from "@/components/Dashboard/UserCard";
import {
  useGetSuggestionsAllQuery,
  useLazySearchUsersQuery,
  UserSearchParams,
} from "@/store/api";
import { usePagination } from "@/components/Dashboard/Pagination/usePagination";
import Pagination from "@/components/Dashboard/Pagination/Pagination";
import type { User } from "../../../../types/user.types";

// -------------------- Types --------------------
interface CardMember {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar?: string;
  isOnline: boolean;
  connectionStatus?: "connected" | "pending" | "not-connected";
}

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface EmptyStateProps {
  hasFilters: boolean;
  searchQuery: string;
  clearFilters: () => void;
}

// -------------------- Main Component --------------------
export default function MemberDirectoryPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<UserSearchParams>({
    keyword: "",
    fname: "",
    lname: "",
    companyName: "",
    city: "",
    Country: "",
  });
  const [activeFilters, setActiveFilters] = useState<UserSearchParams>({});

  // Fetch all users initially
  const {
    data: allUsers,
    isLoading: isLoadingAll,
    error: errorAll,
  } = useGetSuggestionsAllQuery();

  // Lazy query for search
  const [
    triggerSearch,
    { data: searchResults, isLoading: isSearching, error: searchError },
  ] = useLazySearchUsersQuery();

  const hasActiveFilters = Object.values(activeFilters).some(
    (v) => v && v.trim() !== ""
  );

  const displayedUsers = hasActiveFilters ? searchResults : allUsers;
  const isLoading = hasActiveFilters ? isSearching : isLoadingAll;
  const error = hasActiveFilters ? searchError : errorAll;

  // -------------------- Helpers --------------------
  const getAvatarUrl = (avatarPath?: string): string | undefined => {
    if (!avatarPath) return undefined;
    if (avatarPath.startsWith("http")) return avatarPath;
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    return `${baseUrl}/image/${avatarPath}`;
  };

  // -------------------- Data Mapping --------------------
  const membersData: CardMember[] = useMemo(() => {
    if (!displayedUsers) return [];

    return displayedUsers.map((user: any) => {
      const fullName = `${user.fname || ""} ${user.lname || ""}`.trim();
      const title =
        user.classification &&
        user.classification.length <= 50 &&
        !user.classification.includes("@")
          ? user.classification
          : "Business Professional";

      const company =
        user.companyName ||
        user.profile?.professionalDetails?.companyName ||
        "BizCivitas Member";

      return {
        id: user._id || user.id || "",
        name: fullName || "-",
        title: title || "-",
        company: company || "-",
        avatar: getAvatarUrl(user.avatar),
        isOnline: false,
        connectionStatus: user.connectionStatus || "not-connected",
      };
    });
  }, [displayedUsers]);

  // -------------------- Quick Search --------------------
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return membersData;
    const query = searchQuery.toLowerCase();
    return membersData.filter(
      (member) =>
        member.name.toLowerCase().includes(query) ||
        member.title.toLowerCase().includes(query) ||
        member.company.toLowerCase().includes(query)
    );
  }, [membersData, searchQuery]);

  // -------------------- Pagination --------------------
  const {
    state: paginationState,
    actions: paginationActions,
    paginatedData,
  } = usePagination(filteredMembers, {
    initialItemsPerPage: 12,
    itemsPerPageOptions: [12, 24, 36, 48],
  });

  const currentMembers: CardMember[] = paginatedData(filteredMembers);

  // -------------------- Filter Handlers --------------------
  const handleApplyFilters = (): void => {
    const cleanedFilters: UserSearchParams = {};

    if (filters.keyword?.trim())
      cleanedFilters.keyword = filters.keyword.trim();
    if (filters.fname?.trim()) cleanedFilters.fname = filters.fname.trim();
    if (filters.lname?.trim()) cleanedFilters.lname = filters.lname.trim();
    if (filters.companyName?.trim())
      cleanedFilters.companyName = filters.companyName.trim();
    if (filters.city?.trim()) cleanedFilters.city = filters.city.trim();
    if (filters.Country?.trim())
      cleanedFilters.Country = filters.Country.trim();

    setActiveFilters(cleanedFilters);
    if (Object.keys(cleanedFilters).length > 0) triggerSearch(cleanedFilters);
    setShowFilters(false);
  };

  const handleClearFilters = (): void => {
    setFilters({
      keyword: "",
      fname: "",
      lname: "",
      companyName: "",
      city: "",
      Country: "",
    });
    setActiveFilters({});
    setSearchQuery("");
  };

  const activeFilterCount = Object.values(activeFilters).filter(
    (v) => v && v.trim() !== ""
  ).length;

  // -------------------- Render --------------------
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pt-6 sm:pt-8 md:mt-12">
        {/* Breadcrumb */}
        <nav className="flex items-center text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
          <Link
            href="/feeds"
            className="flex items-center hover:text-blue-600 transition-colors"
          >
            <Home className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span>Home</span>
          </Link>
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 mx-1 sm:mx-2" />
          <span className="text-gray-900 font-medium">Member Directory</span>
        </nav>

        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Member Directory
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {hasActiveFilters ? "Search results" : "Browse all members"}
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="relative flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
            >
              <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Advanced Search</span>
              <span className="sm:hidden">Filters</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5"
            />
            <input
              type="text"
              placeholder="Quick search by name, title, or company..."
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <div className="mt-3 sm:mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm text-gray-600">Active filters:</span>
              {Object.entries(activeFilters).map(([key, value]) =>
                value ? (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm"
                  >
                    <strong>{key}:</strong> {value}
                  </span>
                ) : null
              )}
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-200 text-gray-700 rounded-full text-xs sm:text-sm hover:bg-gray-300 transition-colors"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">
                Advanced Search
              </h2>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <InputField
                label="Keyword"
                value={filters.keyword || ""}
                onChange={(v) => setFilters({ ...filters, keyword: v })}
                placeholder="General search..."
              />
              <InputField
                label="First Name"
                value={filters.fname || ""}
                onChange={(v) => setFilters({ ...filters, fname: v })}
                placeholder="John"
              />
              <InputField
                label="Last Name"
                value={filters.lname || ""}
                onChange={(v) => setFilters({ ...filters, lname: v })}
                placeholder="Doe"
              />
              <InputField
                label="Company Name"
                value={filters.companyName || ""}
                onChange={(v) => setFilters({ ...filters, companyName: v })}
                placeholder="Company..."
              />
              <InputField
                label="City"
                value={filters.city || ""}
                onChange={(v) => setFilters({ ...filters, city: v })}
                placeholder="Mumbai"
              />
              <InputField
                label="Country Code"
                value={filters.Country || ""}
                onChange={(v) => setFilters({ ...filters, Country: v })}
                placeholder="IN"
              />
            </div>

            <div className="flex items-center gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button
                onClick={handleApplyFilters}
                className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
              >
                Apply Filters
              </button>
              <button
                onClick={handleClearFilters}
                className="px-4 sm:px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-xs sm:text-sm"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* States */}
        {isLoading && <LoadingState />}
        {error && !isLoading && <ErrorState />}
        {!isLoading && !error && filteredMembers.length === 0 && (
          <EmptyState
            hasFilters={hasActiveFilters}
            searchQuery={searchQuery}
            clearFilters={handleClearFilters}
          />
        )}

        {/* Members Grid */}
        {!isLoading && !error && filteredMembers.length > 0 && (
          <>
            <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600">
              Showing {paginationState.startIndex + 1}-
              {Math.min(paginationState.endIndex, filteredMembers.length)} of{" "}
              {filteredMembers.length} members
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {currentMembers.map((member) => (
                <UserCard
                  key={member.id}
                  {...member}
                  referrerTab="member-directory"
                />
              ))}
            </div>

            {paginationState.totalPages > 1 && (
              <div className="mt-6 sm:mt-8">
                <Pagination
                  state={paginationState}
                  actions={paginationActions}
                  itemName="members"
                  searchTerm={searchQuery}
                  layout="inline"
                  showInfo={false}
                  showItemsPerPage={false}
                  showFirstLastButtons={false}
                  maxVisiblePages={3}
                  size="sm"
                  className="flex justify-center"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// -------------------- Sub Components --------------------
function InputField({ label, value, onChange, placeholder }: InputFieldProps) {
  return (
    <div>
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
        <p className="text-xs sm:text-sm text-gray-600">Loading members...</p>
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center px-4">
        <Users className="h-10 w-10 sm:h-12 sm:w-12 text-red-400 mx-auto mb-3 sm:mb-4" />
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
          Failed to load members
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
          There was an error loading members. Please try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

function EmptyState({
  hasFilters,
  searchQuery,
  clearFilters,
}: EmptyStateProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center px-4">
        <Users className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
          No members found
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
          {hasFilters || searchQuery
            ? "Try adjusting your search criteria"
            : "No members available at the moment"}
        </p>
        {(hasFilters || searchQuery) && (
          <button
            onClick={clearFilters}
            className="text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm"
          >
            Clear filters and search
          </button>
        )}
      </div>
    </div>
  );
}
