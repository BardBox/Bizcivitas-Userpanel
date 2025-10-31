"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, X, MapPin, Filter } from "lucide-react";

interface User {
  userId: string;
  name: string;
  city: string | null;
  state: string | null;
  region: string;
  companyName: string | null;
}

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: User) => void;
}

export default function UserSearchModal({
  isOpen,
  onClose,
  onSelectUser,
}: UserSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [cityFilter, setCityFilter] = useState<string>("");

  // Fetch all users when modal opens
  useEffect(() => {
    if (isOpen && users.length === 0) {
      fetchAllUsers();
    }
  }, [isOpen]);

  const fetchAllUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/getallusers`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        const transformedUsers: User[] = data.data.users.map((item: any) => ({
          userId: item.user.userId,
          name: item.user.name,
          city: item.user.city,
          state: item.user.state,
          region: item.user.region,
          companyName: item.user.companyName,
        }));
        setUsers(transformedUsers);
      } else {
        console.error("Failed to fetch users:", data.message);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Get unique cities for filtering
  const availableCities = useMemo(() => {
    const cities = users
      .map((user) => user.city)
      .filter((city): city is string => city !== null && city !== "");
    return Array.from(new Set(cities)).sort();
  }, [users]);

  // Filter users based on search query and city filter
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = user.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCity = cityFilter === "" || user.city === cityFilter;
      return matchesSearch && matchesCity;
    });
  }, [users, searchQuery, cityFilter]);

  const handleClose = () => {
    setSearchQuery("");
    setCityFilter("");
    onClose();
  };

  const handleSelectUser = (user: User) => {
    setSearchQuery("");
    setCityFilter("");
    onSelectUser(user);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border-2 border-indigo-300">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-indigo-100 bg-gradient-to-r from-indigo-600 to-purple-600">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Search className="w-5 h-5" /> Select Member
          </h3>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 transition-colors p-2 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search and Filter */}
        <div className="p-6 border-b border-gray-200 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* City Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white"
            >
              <option value="">All Cities</option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            Showing {filteredUsers.length} of {users.length} members
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loadingUsers ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <p className="text-gray-600">Loading members...</p>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No members found</p>
              {(searchQuery || cityFilter) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setCityFilter("");
                  }}
                  className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <button
                  key={user.userId}
                  onClick={() => handleSelectUser(user)}
                  className="w-full flex items-center justify-between gap-3 p-4 rounded-xl hover:bg-blue-50 transition-all border-2 border-transparent hover:border-blue-200 text-left group"
                >
                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">
                      {user.name}
                    </div>
                    {user.companyName && (
                      <div className="text-sm text-gray-600 truncate mt-0.5">
                        {user.companyName}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {user.city || "City not specified"}
                        {user.state && `, ${user.state}`}
                      </span>
                    </div>
                  </div>

                  {/* Select Indicator */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export type { User };
