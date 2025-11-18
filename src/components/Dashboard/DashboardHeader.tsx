"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  User as UserIcon,
  Building2,
  MapPin,
  X,
  ChevronDown,
} from "lucide-react";
import NotificationDropdown from "@/components/NotificationDropdown";
import UserProfileDropdown from "@/components/UserProfileDropdown";
import { useLogoutMutation } from "@/store/api";
import { useLazySearchUsersQuery } from "@/store/api/connectionsApi";
import { bizpulseApi } from "../../services/bizpulseApi";
import { bizhubApi } from "../../services/bizhubApi";
import { useGetAllEventsQuery } from "../../../store/api/eventsApi.latest";

type SearchCategory = "members" | "posts" | "events";

interface SearchPost {
  id: string;
  title: string;
  content?: string;
  author: {
    name: string;
    avatar?: string;
  };
  timeAgo: string;
  postSource: "bizpulse" | "bizhub";
  category?: string;
}

interface SearchEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  venue: string;
  isFree: boolean;
  accessMode: string;
}

export default function DashboardHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] =
    useState<SearchCategory>("members");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchUsers, { data: searchResults, isLoading: isSearching }] =
    useLazySearchUsersQuery();
  const [postResults, setPostResults] = useState<SearchPost[]>([]);
  const [isSearchingPosts, setIsSearchingPosts] = useState(false);
  const [eventResults, setEventResults] = useState<SearchEvent[]>([]);
  const { data: allEvents = [] } = useGetAllEventsQuery();
  const searchRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const showNotificationIcon = true; // Enable notifications icon
  const [logout, { isLoading: logoutLoading }] = useLogoutMutation();
  const router = useRouter();

  const categories = [
    { value: "members" as SearchCategory, label: "Members", icon: UserIcon },
    { value: "posts" as SearchCategory, label: "Posts", icon: Building2 },
    { value: "events" as SearchCategory, label: "Events", icon: MapPin },
  ];

  // Helper function to strip HTML tags and decode entities
  const stripHtml = (html: string): string => {
    // Remove HTML tags
    let text = html.replace(/<[^>]*>/g, "");
    // Decode common HTML entities
    text = text.replace(/&nbsp;/g, " ");
    text = text.replace(/&amp;/g, "&");
    text = text.replace(/&lt;/g, "<");
    text = text.replace(/&gt;/g, ">");
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");
    // Remove extra whitespace
    text = text.replace(/\s+/g, " ").trim();
    return text;
  };

  // Search posts function
  const searchPosts = async (query: string) => {
    setIsSearchingPosts(true);
    try {
      // Fetch both BizPulse and BizHub posts
      const [bizpulsePosts, bizhubPosts] = await Promise.all([
        bizpulseApi.fetchWallFeeds({ limit: 100 }),
        bizhubApi.fetchPosts(),
      ]);

      const allPosts: SearchPost[] = [];

      // Search in BizPulse posts
      if (bizpulsePosts?.data?.wallFeeds) {
        bizpulsePosts.data.wallFeeds.forEach((post: any) => {
          const rawTitle = String(post.title || post.poll?.question || "");
          const rawDescription = String(post.description || "");

          // Strip HTML tags
          const title = stripHtml(rawTitle);
          const description = stripHtml(rawDescription);

          if (
            title.toLowerCase().includes(query.toLowerCase()) ||
            description.toLowerCase().includes(query.toLowerCase())
          ) {
            allPosts.push({
              id: post._id,
              title: title || "Untitled Post",
              content: description.substring(0, 100),
              author: {
                name:
                  `${post.userId?.fname || ""} ${
                    post.userId?.lname || ""
                  }`.trim() || "Unknown",
                avatar: post.userId?.avatar,
              },
              timeAgo: new Date(post.createdAt).toLocaleDateString(),
              postSource: "bizpulse",
              category: post.type,
            });
          }
        });
      }

      // Search in BizHub posts
      if (bizhubPosts && Array.isArray(bizhubPosts)) {
        bizhubPosts.forEach((post: any) => {
          const rawTitle = String(post.title || "");
          const rawDescription = String(post.description || "");

          // Strip HTML tags
          const title = stripHtml(rawTitle);
          const description = stripHtml(rawDescription);

          if (
            title.toLowerCase().includes(query.toLowerCase()) ||
            description.toLowerCase().includes(query.toLowerCase())
          ) {
            // BizHub uses post.user, not post.author
            const authorName =
              post.user?.name ||
              `${post.user?.fname || ""} ${post.user?.lname || ""}`.trim() ||
              "BizCivitas Admin";

            // Process avatar URL like bizhubTransformers does
            const getAvatarUrl = (path?: string): string | undefined => {
              if (!path) return undefined;
              const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
              if (!BASE_URL) return undefined;

              // Check if it's already an absolute URL
              if (path.startsWith("http://") || path.startsWith("https://")) {
                return path;
              }
              // Create backend image URL
              return `${BASE_URL}/image/${path}?width=32&height=32&format=webp`;
            };

            allPosts.push({
              id: post._id,
              title: title || "Untitled Post",
              content: description.substring(0, 100),
              author: {
                name: authorName,
                avatar: getAvatarUrl(post.user?.avatar),
              },
              timeAgo: new Date(post.createdAt).toLocaleDateString(),
              postSource: "bizhub",
              category: post.type,
            });
          }
        });
      }

      setPostResults(allPosts);
    } catch (error) {
      console.error("Error searching posts:", error);
      setPostResults([]);
    } finally {
      setIsSearchingPosts(false);
    }
  };

  // Debounced search effect - for members and posts
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const timer = setTimeout(() => {
        if (searchCategory === "members") {
          // Split search query to handle full names (fname + lname)
          const nameParts = searchQuery.trim().split(/\s+/);
          const searchParams: any = { keyword: searchQuery.trim() };

          // If there are 2+ words, also search by fname and lname
          if (nameParts.length >= 2) {
            searchParams.fname = nameParts[0];
            searchParams.lname = nameParts.slice(1).join(" ");
          }

          searchUsers(searchParams);
        } else if (searchCategory === "posts") {
          searchPosts(searchQuery.trim());
        }
        setIsSearchOpen(true);
      }, 300); // 300ms debounce

      return () => clearTimeout(timer);
    } else {
      setIsSearchOpen(false);
      setPostResults([]);
    }
  }, [searchQuery, searchUsers, searchCategory]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      if (searchCategory === "members") {
        // Split search query to handle full names (fname + lname)
        const nameParts = searchQuery.trim().split(/\s+/);
        const searchParams: any = {
          keyword: searchQuery.trim(),
          companyName: searchQuery.trim(),
        };

        // If there are 2+ words, also search by fname and lname
        if (nameParts.length >= 2) {
          searchParams.fname = nameParts[0];
          searchParams.lname = nameParts.slice(1).join(" ");
        }

        searchUsers(searchParams);
      } else if (searchCategory === "posts") {
        searchPosts(searchQuery.trim());
      }
      setIsSearchOpen(true);
    }
  };

  const handleUserClick = (userId: string | undefined) => {
    if (!userId) return;
    setIsSearchOpen(false);
    setSearchQuery("");
    router.push(`/feeds/connections/${userId}?from=search`);
  };

  const handlePostClick = (postId: string, postSource: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    if (postSource === "bizpulse") {
      router.push(`/feeds/biz-pulse/${postId}`);
    } else {
      router.push(`/feeds/biz-hub/${postId}`);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearchOpen(false);
    setPostResults([]);
  };

  const handleCategoryChange = (category: SearchCategory) => {
    setSearchCategory(category);
    setIsCategoryDropdownOpen(false);
    setSearchQuery("");
    setIsSearchOpen(false);
    setPostResults([]);
  };

  const selectedCategory = categories.find(
    (cat) => cat.value === searchCategory
  );
  const CategoryIcon = selectedCategory?.icon || UserIcon;

  const handleLogout = async () => {
    // Get FCM token from localStorage
    // Use placeholder if not found (backend requires fcmToken field)
    const fcmToken = localStorage.getItem("fcmToken") || "no-fcm-token";

    // Call logout API in background (fire and forget)
    logout({ fcmToken }).catch((err) => {
      // Silently fail - user is already logged out on frontend
      console.error("Logout API error (already logged out):", err);
    });

    // Clear all storage IMMEDIATELY
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
    }

    // Force immediate hard redirect to home page using window.location
    // This is more reliable than router.replace for logout
    window.location.href = "/";
  };

  const [showSearchBar, setShowSearchBar] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Listen for mobile menu state changes
  useEffect(() => {
    const handleMobileMenuState = (event: Event) => {
      const customEvent = event as CustomEvent<{ isOpen: boolean }>;
      setIsMobileMenuOpen(customEvent.detail.isOpen);
    };

    window.addEventListener("mobileMenuStateChanged", handleMobileMenuState);
    return () =>
      window.removeEventListener(
        "mobileMenuStateChanged",
        handleMobileMenuState
      );
  }, []);

  // Auto-hide header on scroll (desktop only)
  useEffect(() => {
    const handleScroll = (event: Event) => {
      const customEvent = event as CustomEvent<{
        scrollY: number;
        lastScrollY: number;
      }>;
      const { scrollY: currentScrollY, lastScrollY } = customEvent.detail;

      // Only hide on desktop (width >= 768px)
      const isMobile = window.innerWidth < 768;

      if (isMobile) {
        // Always show header on mobile
        setIsHeaderVisible(true);
        return;
      }

      // Desktop behavior: Show header when scrolling up or near top
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsHeaderVisible(true);
      }
      // Hide header when scrolling down past threshold (desktop only)
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHeaderVisible(false);
        setShowSearchBar(false); // Close search bar when hiding header
      }
    };

    window.addEventListener("mainScroll", handleScroll);
    return () => window.removeEventListener("mainScroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-10 bg-blue-500 shadow-sm transition-transform duration-300 ${
          isHeaderVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-3">
      
          <button
            onClick={() => {
           
              window.dispatchEvent(new CustomEvent("toggleMobileMenu"));
            }}
            className="md:hidden flex items-center  justify-center hover:bg-gray-200 rounded-lg p-2 transition-colors w-10 h-10"
          >
            <div className="w-6 h-5 relative  flex flex-col  justify-center items-center">
              <span
                className={`w-full h-0.5 bg-current rounded-full bg-white transition-all duration-300 ease-in-out absolute ${
                  isMobileMenuOpen
                    ? "rotate-45 top-1/2 -translate-y-1/2"
                    : "top-0 "
                }`}
              />
              <span
                className={`w-full h-0.5 bg-white bg-current rounded-full transition-all duration-300 ease-in-out absolute top-1/2 -translate-y-1/2 ${
                  isMobileMenuOpen
                    ? "opacity-0 scale-0"
                    : "opacity-100 scale-100"
                }`}
              />
              <span
                className={`w-full bg-white h-0.5 bg-current rounded-full transition-all duration-300 ease-in-out absolute ${
                  isMobileMenuOpen
                    ? "-rotate-45 top-1/2 -translate-y-1/2"
                    : "bottom-0"
                }`}
              />
            </div>
          </button>

         
          <div className="md:hidden flex-1"></div>

        
          <div className="hidden md:flex flex-1 justify-center">
            <form
              onSubmit={handleSearch}
              className={`relative w-full max-w-xl transition-opacity duration-300 ${
                showSearchBar ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
            
              <div
                className="relative flex items-center bg-white rounded-full border border-gray-300 shadow-sm hover:shadow-md transition-shadow"
                ref={searchRef}
              >
                {/* Category Dropdown Inside Pill */}
                <div className="relative" ref={categoryRef}>
                  <button
                    type="button"
                    onClick={() =>
                      setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                    }
                    className="flex items-center gap-2 px-5 py-2.5 hover:bg-gray-50 rounded-l-full transition-colors border-r border-gray-300"
                  >
                    {selectedCategory?.icon && (
                      <selectedCategory.icon
                        className={`w-4 h-4 ${
                          searchCategory === "members"
                            ? "text-blue-600"
                            : searchCategory === "posts"
                            ? "text-green-600"
                            : searchCategory === "events"
                            ? "text-purple-600"
                            : "text-gray-900"
                        }`}
                      />
                    )}
                    <span
                      className={`font-medium text-sm ${
                        searchCategory === "members"
                          ? "text-blue-600"
                          : searchCategory === "posts"
                          ? "text-green-600"
                          : searchCategory === "events"
                          ? "text-purple-600"
                          : "text-gray-900"
                      }`}
                    >
                      {selectedCategory?.label}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </button>

                  {/* Category Dropdown Menu */}
                  {isCategoryDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-[100]"
                        onClick={() => setIsCategoryDropdownOpen(false)}
                      />
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-[110] py-1">
                        {categories.map((category) => {
                          const Icon = category.icon;
                          return (
                            <button
                              key={category.value}
                              type="button"
                              onClick={() =>
                                handleCategoryChange(category.value)
                              }
                              className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors ${
                                searchCategory === category.value
                                  ? "bg-blue-50 text-blue-600"
                                  : "text-gray-900"
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              <span className="font-medium">
                                {category.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Search Icon */}

                {/* Search Input */}
                <input
                  type="text"
                  placeholder={`Search for ${selectedCategory?.label.toLowerCase()}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2.5 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none text-sm"
                />

                {/* Clear Button */}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="pr-4 text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown - Outside the pill */}
              {isSearchOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsSearchOpen(false)}
                  />

                  {/* Results */}
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-lg border z-40 max-h-96 overflow-y-auto">
                    {/* POSTS SEARCH RESULTS */}
                    {searchCategory === "posts" && isSearchingPosts ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto" />
                        <p className="mt-2">Searching posts...</p>
                      </div>
                    ) : searchCategory === "posts" && postResults.length > 0 ? (
                      <div>
                        <div className="px-4 py-2 bg-gray-50 border-b">
                          <p className="text-sm font-semibold text-gray-700">
                            Found {postResults.length} post
                            {postResults.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        {postResults.map((post) => (
                          <button
                            key={post.id}
                            onClick={() =>
                              handlePostClick(post.id, post.postSource)
                            }
                            className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b last:border-b-0"
                          >
                            <div className="flex items-center gap-3">
                              {/* Post Icon/Avatar */}
                              {post.postSource === "bizpulse" ? (
                                // BizPulse - show favicon
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 border border-blue-200">
                                  <Image
                                    src="/favicon.ico"
                                    alt="BizCivitas"
                                    width={24}
                                    height={24}
                                    className="object-contain"
                                    unoptimized
                                  />
                                </div>
                              ) : post.author.avatar &&
                                post.author.avatar.startsWith("http") &&
                                (post.author.avatar.includes(
                                  "backend.bizcivitas.com"
                                ) ||
                                  post.author.avatar.includes(
                                    "images.unsplash.com"
                                  )) ? (
                                // BizHub - show author avatar
                                <Image
                                  src={post.author.avatar}
                                  alt={post.author.name}
                                  width={40}
                                  height={40}
                                  className="rounded-full object-cover flex-shrink-0"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                // BizHub fallback - user icon
                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                  <UserIcon className="w-5 h-5 text-orange-600" />
                                </div>
                              )}

                              {/* Post Info */}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 line-clamp-1">
                                  {post.title}
                                </p>
                                {post.content && (
                                  <p className="text-sm text-gray-600 line-clamp-1">
                                    {post.content}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-500">
                                    {post.author.name}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    •
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {post.timeAgo}
                                  </span>
                                </div>
                              </div>

                              {/* Source Badge */}
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded flex-shrink-0 ${
                                  post.postSource === "bizpulse"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {post.postSource === "bizpulse"
                                  ? "BizPulse"
                                  : "BizHub"}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : searchCategory === "posts" &&
                      searchQuery.trim().length >= 2 ? (
                      <div className="p-8 text-center text-gray-500">
                        <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="font-medium">No posts found</p>
                        <p className="text-sm mt-1">
                          Try searching with different keywords
                        </p>
                      </div>
                    ) : /* MEMBERS SEARCH RESULTS */
                    searchCategory === "members" && isSearching ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto" />
                        <p className="mt-2">Searching members...</p>
                      </div>
                    ) : searchCategory === "members" &&
                      searchResults &&
                      searchResults.length > 0 ? (
                      <div>
                        <div className="px-4 py-2 bg-gray-50 border-b">
                          <p className="text-sm font-semibold text-gray-700">
                            Found {searchResults.length} member
                            {searchResults.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        {searchResults.map((user) => (
                          <button
                            key={user._id}
                            onClick={() => handleUserClick(user._id)}
                            className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b last:border-b-0"
                          >
                            <div className="flex items-center gap-3">
                              {/* Avatar */}
                              {user.avatar &&
                              user.avatar.startsWith("http") &&
                              (user.avatar.includes("backend.bizcivitas.com") ||
                                user.avatar.includes("images.unsplash.com")) ? (
                                <Image
                                  src={user.avatar}
                                  alt={`${user.fname} ${user.lname}`}
                                  width={40}
                                  height={40}
                                  className="rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <UserIcon className="w-5 h-5 text-blue-600" />
                                </div>
                              )}

                              {/* User Info */}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900">
                                  {user.fname} {user.lname}
                                </p>
                                {user.business && (
                                  <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <Building2 className="w-3 h-3" />
                                    <span className="truncate">
                                      {user.business}
                                    </span>
                                  </div>
                                )}
                                {user.companyName && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Building2 className="w-3 h-3" />
                                    <span className="truncate">
                                      {user.companyName}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Membership Badge */}
                              {user.membershipType && (
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                                  {user.membershipType}
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : searchCategory === "members" &&
                      searchQuery.trim().length >= 2 ? (
                      <div className="p-8 text-center text-gray-500">
                        <UserIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="font-medium">No members found</p>
                        <p className="text-sm mt-1">
                          Try searching with different keywords
                        </p>
                      </div>
                    ) : /* EVENTS SEARCH - COMING SOON */
                    searchCategory === "events" &&
                      searchQuery.trim().length >= 2 ? (
                      <div className="p-8 text-center text-gray-500">
                        <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="font-medium">Coming Soon!</p>
                        <p className="text-sm mt-1">
                          Event search will be available soon
                        </p>
                      </div>
                    ) : null}
                  </div>
                </>
              )}
            </form>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-6 mr-8">
            {/* Search Icon Button */}
            <button
              type="button"
              onClick={() => setShowSearchBar(!showSearchBar)}
            >
              <img
                src="/search.svg"
                alt="Search"
                className="!w-[32px] !h-[32px] transition-all hover:drop-shadow-lg"
              />
            </button>

            {/* Notification Dropdown - Desktop Only */}
            {showNotificationIcon && (
              <div className="hidden md:block">
                <NotificationDropdown iconPath="/notification.svg" />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Search Dropdown - Appears below header */}
      {showSearchBar && (
        <div className="md:hidden fixed top-16 left-0 right-0 z-[9] bg-white shadow-lg border-t border-gray-200 animate-slideDown">
          <div className="p-4">
            <form onSubmit={handleSearch} className="relative">
              {/* Combined Search Bar with Pill Design */}
              <div
                className="relative flex items-center bg-white rounded-full border border-gray-300 shadow-sm"
                ref={searchRef}
              >
                {/* Category Dropdown Inside Pill */}
                <div className="relative" ref={categoryRef}>
                  <button
                    type="button"
                    onClick={() =>
                      setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                    }
                    className="flex items-center gap-1 px-3 py-2.5 hover:bg-gray-50 rounded-l-full transition-colors border-r border-gray-300"
                  >
                    <CategoryIcon
                      className={`w-5 h-5 ${
                        searchCategory === "members"
                          ? "text-blue-600"
                          : searchCategory === "posts"
                          ? "text-green-600"
                          : searchCategory === "events"
                          ? "text-purple-600"
                          : "text-gray-900"
                      }`}
                    />
                    <ChevronDown className="w-3 h-3 text-gray-600" />
                  </button>

                  {/* Category Dropdown Menu */}
                  {isCategoryDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-[100]"
                        onClick={() => setIsCategoryDropdownOpen(false)}
                      />
                      <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-lg shadow-lg border z-[110] py-1">
                        {categories.map((category) => {
                          const Icon = category.icon;
                          return (
                            <button
                              key={category.value}
                              type="button"
                              onClick={() =>
                                handleCategoryChange(category.value)
                              }
                              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                                searchCategory === category.value
                                  ? "bg-blue-50 text-blue-600"
                                  : "text-gray-900"
                              }`}
                            >
                              <Icon
                                className={`w-5 h-5 ${
                                  searchCategory === category.value
                                    ? "text-blue-600"
                                    : category.value === "posts"
                                    ? "text-green-600"
                                    : category.value === "events"
                                    ? "text-purple-600"
                                    : "text-blue-600"
                                }`}
                              />
                              <span className="font-medium text-sm">
                                {category.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Search Input */}
                <input
                  type="text"
                  placeholder={`Search for ${selectedCategory?.label.toLowerCase()}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2.5 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none text-sm"
                  autoFocus
                />

                {/* Clear Button */}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="pr-4 text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown - Mobile */}
              {isSearchOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsSearchOpen(false)}
                  />

                  {/* Results */}
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-lg border z-40 max-h-96 overflow-y-auto">
                    {/* POSTS SEARCH RESULTS */}
                    {searchCategory === "posts" && isSearchingPosts ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto" />
                        <p className="mt-2">Searching posts...</p>
                      </div>
                    ) : searchCategory === "posts" && postResults.length > 0 ? (
                      <div>
                        <div className="px-4 py-2 bg-gray-50 border-b">
                          <p className="text-sm font-semibold text-gray-700">
                            Found {postResults.length} post
                            {postResults.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        {postResults.map((post) => (
                          <button
                            key={post.id}
                            onClick={() =>
                              handlePostClick(post.id, post.postSource)
                            }
                            className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b last:border-b-0"
                          >
                            <div className="flex items-center gap-3">
                              {/* Post Info */}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 line-clamp-1">
                                  {post.title}
                                </p>
                                {post.content && (
                                  <p className="text-sm text-gray-600 line-clamp-1">
                                    {post.content}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-500">
                                    {post.author.name}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    •
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {post.timeAgo}
                                  </span>
                                </div>
                              </div>

                              {/* Source Badge */}
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded flex-shrink-0 ${
                                  post.postSource === "bizpulse"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {post.postSource === "bizpulse"
                                  ? "BizPulse"
                                  : "BizHub"}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : searchCategory === "posts" &&
                      searchQuery.trim().length >= 2 ? (
                      <div className="p-8 text-center text-gray-500">
                        <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="font-medium">No posts found</p>
                        <p className="text-sm mt-1">
                          Try searching with different keywords
                        </p>
                      </div>
                    ) : /* MEMBERS SEARCH RESULTS */
                    searchCategory === "members" && isSearching ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto" />
                        <p className="mt-2">Searching members...</p>
                      </div>
                    ) : searchCategory === "members" &&
                      searchResults &&
                      searchResults.length > 0 ? (
                      <div>
                        <div className="px-4 py-2 bg-gray-50 border-b">
                          <p className="text-sm font-semibold text-gray-700">
                            Found {searchResults.length} member
                            {searchResults.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        {searchResults.map((user) => (
                          <button
                            key={user._id}
                            onClick={() => handleUserClick(user._id)}
                            className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b last:border-b-0"
                          >
                            <div className="flex items-center gap-3">
                              {/* Avatar */}
                              {user.avatar &&
                              user.avatar.startsWith("http") &&
                              (user.avatar.includes("backend.bizcivitas.com") ||
                                user.avatar.includes("images.unsplash.com")) ? (
                                <Image
                                  src={user.avatar}
                                  alt={`${user.fname} ${user.lname}`}
                                  width={40}
                                  height={40}
                                  className="rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <UserIcon className="w-5 h-5 text-blue-600" />
                                </div>
                              )}

                              {/* User Info */}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900">
                                  {user.fname} {user.lname}
                                </p>
                                {user.business && (
                                  <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <Building2 className="w-3 h-3" />
                                    <span className="truncate">
                                      {user.business}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Membership Badge */}
                              {user.membershipType && (
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                                  {user.membershipType}
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : searchCategory === "members" &&
                      searchQuery.trim().length >= 2 ? (
                      <div className="p-8 text-center text-gray-500">
                        <UserIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="font-medium">No members found</p>
                        <p className="text-sm mt-1">
                          Try searching with different keywords
                        </p>
                      </div>
                    ) : /* EVENTS SEARCH - COMING SOON */
                    searchCategory === "events" &&
                      searchQuery.trim().length >= 2 ? (
                      <div className="p-8 text-center text-gray-500">
                        <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="font-medium">Coming Soon!</p>
                        <p className="text-sm mt-1">
                          Event search will be available soon
                        </p>
                      </div>
                    ) : null}
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
