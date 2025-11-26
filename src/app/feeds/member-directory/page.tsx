'use client';

import { useState, useMemo, ChangeEvent, useEffect } from 'react';
import { useGetSuggestionsAllQuery, useLazySearchUsersQuery, UserSearchParams } from '@/store/api';
import { Users, Building2, MapPin, Loader2, AlertCircle, Search, Filter, X, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Country, State, City, ICountry, IState, ICity } from 'country-state-city';
import { useSidebar } from '@/contexts/SidebarContext';

// Member interface matching the API response
interface Member {
  _id: string;
  fname: string;
  lname: string;
  avatar?: string;
  classification?: string;
  companyName?: string;
  city?: string;
  Country?: string;
  connectionStatus?: string;
  profile?: {
    professionalDetails?: {
      companyName?: string;
    };
  };
}

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
}

const ITEMS_PER_PAGE = 12;

export default function MemberDirectory() {
  const router = useRouter();
  const { isCollapsed } = useSidebar();
  const [isMounted, setIsMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
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

  // Location dropdowns state
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");

  // Location options
  const [countries, setCountries] = useState<{ label: string; value: string }[]>([]);
  const [states, setStates] = useState<{ label: string; value: string }[]>([]);
  const [cities, setCities] = useState<{ label: string; value: string }[]>([]);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  // Load countries on mount
  useEffect(() => {
    const countryList = Country.getAllCountries().map((country: ICountry) => ({
      label: country.name,
      value: country.isoCode,
    }));
    setCountries(countryList);
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (selectedCountry) {
      const stateList = State.getStatesOfCountry(selectedCountry).map((state: IState) => ({
        label: state.name,
        value: state.isoCode,
      }));
      setStates(stateList);
      setSelectedState(""); // Reset state selection
      setCities([]); // Reset cities
      setSelectedCity(""); // Reset city selection
    } else {
      setStates([]);
      setCities([]);
      setSelectedState("");
      setSelectedCity("");
    }
  }, [selectedCountry]);

  // Load cities when state changes
  useEffect(() => {
    if (selectedCountry && selectedState) {
      const cityList = City.getCitiesOfState(selectedCountry, selectedState).map((city: ICity) => ({
        label: city.name,
        value: city.name,
      }));
      setCities(cityList);
      setSelectedCity(""); // Reset city selection
    } else {
      setCities([]);
      setSelectedCity("");
    }
  }, [selectedCountry, selectedState]);

  // Helper function to get avatar URL
  const getAvatarUrl = (avatarPath?: string): string => {
    if (!avatarPath) return '/default-avatar.png';
    if (avatarPath.startsWith('http')) return avatarPath;
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    return `${baseUrl}/image/${avatarPath}`;
  };

  // Transform API data to our format
  const members: Member[] = useMemo(() => {
    if (!displayedUsers) return [];
    if (displayedUsers.length > 0) {
      console.log('Member Directory User Data:', displayedUsers[0]);
    }
    return displayedUsers.map((user: any) => ({
      _id: user._id || user.id || '',
      fname: user.fname || '',
      lname: user.lname || '',
      avatar: user.avatar,
      classification: user.classification || 'Business Professional',
      companyName: user.companyName || user.profile?.professionalDetails?.companyName || 'Company',
      city: user.city || '',
      Country: user.Country || '',
      connectionStatus: user.connectionStatus || 'not-connected',
    }));
  }, [displayedUsers]);

  // Quick Search & Filtering
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const query = searchQuery.toLowerCase();
    return members.filter((member) => {
      const fullName = `${member.fname} ${member.lname}`.toLowerCase();
      return (
        fullName.includes(query) ||
        (member.classification && member.classification.toLowerCase().includes(query)) ||
        (member.companyName && member.companyName.toLowerCase().includes(query))
      );
    });
  }, [members, searchQuery]);

  // Calculate pagination values
  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentMembers = filteredMembers.slice(startIndex, endIndex);

  // Fix page boundary when items change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (startPage > 2) {
        pages.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  // Scroll to top of grid on page change
  useEffect(() => {
    const gridElement = document.getElementById('member-grid-top');
    if (gridElement) {
      gridElement.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentPage]);

  // Handlers
  const handleApplyFilters = (): void => {
    const cleanedFilters: UserSearchParams = {};
    if (filters.keyword?.trim()) cleanedFilters.keyword = filters.keyword.trim();
    if (filters.fname?.trim()) cleanedFilters.fname = filters.fname.trim();
    if (filters.lname?.trim()) cleanedFilters.lname = filters.lname.trim();
    if (filters.companyName?.trim()) cleanedFilters.companyName = filters.companyName.trim();

    // Use selected city from dropdown or manual input
    const cityValue = selectedCity || filters.city?.trim();
    if (cityValue) cleanedFilters.city = cityValue;

    // Use selected country from dropdown (send country name, not ISO code)
    if (selectedCountry) {
      const countryData = countries.find(c => c.value === selectedCountry);
      cleanedFilters.Country = countryData ? countryData.label : selectedCountry;
    }

    // Debug: Log what we're searching for
    console.log('🔍 Search Filters:', cleanedFilters);
    console.log('📍 Selected Location:', {
      country: selectedCountry,
      state: selectedState,
      city: selectedCity
    });

    setActiveFilters(cleanedFilters);
    if (Object.keys(cleanedFilters).length > 0) triggerSearch(cleanedFilters);
    setShowFilters(false);
    setCurrentPage(1);
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
    setSelectedCountry("");
    setSelectedState("");
    setSelectedCity("");
    setCurrentPage(1);
  };

  const activeFilterCount = Object.values(activeFilters).filter(
    (v) => v && v.trim() !== ""
  ).length;

  // Navigate to member profile
  const handleCardClick = (memberId: string) => {
    router.push(`/feeds/connections/${memberId}?from=member-directory`);
  };

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Members</h2>
          <p className="text-gray-600 mb-4">There was an error fetching member data.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6" id="member-grid-top">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Member Directory
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {hasActiveFilters ? "Search results" : "Browse all members"}
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="relative flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Filter className="h-5 w-5" />
              <span>Advanced Search</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Quick search by name, title, or company..."
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Active filters:</span>
              {Object.entries(activeFilters).map(([key, value]) => {
                if (!value) return null;

                // Display friendly country name instead of ISO code
                let displayValue = value;
                if (key === 'Country') {
                  const country = countries.find(c => c.value === value);
                  displayValue = country ? country.label : value;
                }

                return (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    <strong>{key}:</strong> {displayValue}
                  </span>
                );
              })}
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300 transition-colors"
              >
                <X className="h-4 w-4" />
                Clear all
              </button>
            </div>
          )}

          {/* Results Count */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-600">
              {isLoading
                ? "Loading members..."
                : `Showing ${filteredMembers.length > 0 ? startIndex + 1 : 0}-${Math.min(endIndex, filteredMembers.length)} of ${filteredMembers.length} members`
              }
            </span>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Advanced Search</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

              {/* Country Dropdown */}
              <SelectField
                label="Country"
                value={selectedCountry}
                onChange={setSelectedCountry}
                options={countries}
                placeholder="Select Country"
              />

              {/* State Dropdown (enabled only when country is selected) */}
              <SelectField
                label="State"
                value={selectedState}
                onChange={setSelectedState}
                options={states}
                placeholder={selectedCountry ? "Select State" : "Select Country First"}
              />

              {/* City Dropdown (enabled only when state is selected) */}
              <SelectField
                label="City"
                value={selectedCity}
                onChange={setSelectedCity}
                options={cities}
                placeholder={selectedState ? "Select City" : "Select State First"}
              />
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleApplyFilters}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Apply Filters
              </button>
              <button
                onClick={handleClearFilters}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Loading State (Skeleton Grid) */}
        {isLoading && (
          <div className={`grid grid-cols-1 ${isCollapsed ? 'md:grid-cols-2' : 'md:grid-cols-1'} lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8`}>
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
              <MemberCardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredMembers.length === 0 && (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
              <p className="text-sm text-gray-600 mb-4">
                {hasActiveFilters || searchQuery
                  ? "Try adjusting your search criteria"
                  : "No members available at the moment"}
              </p>
              {(hasActiveFilters || searchQuery) && (
                <button
                  onClick={handleClearFilters}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Clear filters and search
                </button>
              )}
            </div>
          </div>
        )}

        {/* Members Grid */}
        {!isLoading && filteredMembers.length > 0 && (
          <>
            <div className={`grid grid-cols-1 ${isCollapsed ? 'md:grid-cols-2' : 'md:grid-cols-1'} lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-4`}>
              {currentMembers.map((member) => {
                const fullName = `${member.fname} ${member.lname}`.trim() || 'Unknown Member';
                const title = member.classification && member.classification.length <= 50
                  ? member.classification
                  : 'Business Professional';
                const company = member.companyName || 'Company';
                const location = [member.city, member.Country].filter(Boolean).join(', ') || 'Location not specified';

                return (
                  <div
                    key={member._id}
                    onClick={() => handleCardClick(member._id)}
                    className="group relative bg-white rounded-2xl border-2 border-gray-100 p-6 transition-all duration-300 ease-out hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 hover:border-transparent overflow-hidden flex flex-col items-center cursor-pointer"
                  >
                    {/* Animated gradient border on hover using brand colors */}
                    <div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                      style={{
                        padding: '2px',
                        background: 'linear-gradient(135deg, var(--color-brand-orange), var(--color-brand-blue), var(--color-brand-green-dark))'
                      }}
                    >
                      <div className="absolute inset-[2px] bg-white rounded-2xl"></div>
                    </div>

                    {/* Glow effect on hover using brand colors */}
                    <div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 -z-20"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 157, 0, 0.2), rgba(51, 89, 255, 0.2), rgba(29, 178, 18, 0.2))'
                      }}
                    ></div>

                    {/* Avatar */}
                    <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-green-500 mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg">
                      {member.avatar ? (
                        <Image
                          src={getAvatarUrl(member.avatar)}
                          alt={fullName}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                          {member.fname?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                    </div>

                    {/* Name */}
                    <h3 className="text-xl font-bold text-blue-600 mb-2 text-center transition-all duration-300 group-hover:text-blue-700 group-hover:scale-105">
                      {fullName}
                    </h3>

                    {/* Title */}
                    <p className="text-sm text-gray-700 text-center mb-1 font-medium transition-colors duration-300 group-hover:text-gray-700">
                      {title}
                    </p>

                    {/* Company */}
                    <p className="text-sm text-gray-600 text-center transition-colors duration-300 group-hover:text-gray-700">
                      {company}
                    </p>
                  </div>
                );
              })}

              {/* Placeholders to maintain grid layout */}
              {Array.from({ length: Math.max(0, ITEMS_PER_PAGE - currentMembers.length) }).map((_, index) => (
                <div
                  key={`placeholder-${index}`}
                  className="hidden lg:flex invisible bg-white rounded-2xl border-2 border-gray-100 p-6 flex-col items-center"
                  aria-hidden="true"
                >
                  <div className="w-20 h-20 mb-4" />
                  <h3 className="text-xl font-bold mb-2 text-center">Placeholder</h3>
                  <p className="text-sm mb-1 font-medium text-center">Title</p>
                  <p className="text-sm text-center">Company</p>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="bg-white rounded-xl shadow-md p-3 sm:p-6">
                {/* Page Numbers - Centered */}
                <div className="flex items-center justify-center gap-1 sm:gap-2 mb-3">
                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === 'number' && goToPage(page)}
                      disabled={page === '...'}
                      className={`min-w-[32px] sm:min-w-[40px] h-8 sm:h-10 rounded-lg font-medium text-sm transition-all duration-200 ${page === currentPage
                        ? 'bg-indigo-600 text-white shadow-lg scale-105 sm:scale-110'
                        : page === '...'
                          ? 'bg-transparent text-gray-400 cursor-default'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                {/* Previous and Next Buttons Row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  {/* Previous Button */}
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${currentPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                  >
                    ← Previous
                  </button>

                  {/* Next Button */}
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${currentPage === totalPages
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                  >
                    Next →
                  </button>
                </div>

                {/* Page Info */}
                <div className="text-center text-xs sm:text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}

// -------------------- Sub Components --------------------

function MemberCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 flex flex-col items-center animate-pulse">
      <div className="w-20 h-20 rounded-full bg-gray-200 mb-4"></div>
      <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 w-1/2 bg-gray-200 rounded mb-1"></div>
      <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder }: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder }: SelectFieldProps) {
  const disabled = options.length === 0;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-10 ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white cursor-pointer'
            }`}
        >
          <option value="">{placeholder || 'Select...'}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none ${disabled ? 'text-gray-400' : 'text-gray-600'
          }`} />
      </div>
    </div>
  );
}

