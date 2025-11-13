"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, User as UserIcon, Building2, MapPin, X, ChevronDown } from "lucide-react";
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
  const [searchCategory, setSearchCategory] = useState<SearchCategory>("members");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchUsers, { data: searchResults, isLoading: isSearching }] = useLazySearchUsersQuery();
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
    let text = html.replace(/<[^>]*>/g, '');
    // Decode common HTML entities
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");
    // Remove extra whitespace
    text = text.replace(/\s+/g, ' ').trim();
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
                name: `${post.userId?.fname || ""} ${post.userId?.lname || ""}`.trim() || "Unknown",
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
            const authorName = post.user?.name ||
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
          // Search by keyword - backend should search across name, company, etc.
          searchUsers({ keyword: searchQuery.trim() });
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
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
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
        // Search by keyword (name) and companyName
        searchUsers({
          keyword: searchQuery.trim(),
          companyName: searchQuery.trim()
        });
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
    router.push(`/feeds/connections/${userId}`);
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

  const selectedCategory = categories.find((cat) => cat.value === searchCategory);
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

  return (
    <header className="sticky top-0 z-20 bg-blue-500 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
          <div className="flex gap-2">
            {/* Category Dropdown */}
            <div className="relative" ref={categoryRef}>
              <button
                type="button"
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <CategoryIcon className="w-4 h-4 text-gray-600" />
                <span className="text-gray-900 font-medium">{selectedCategory?.label}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {/* Category Dropdown Menu */}
              {isCategoryDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsCategoryDropdownOpen(false)} />
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border z-40 py-1">
                    {categories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <button
                          key={category.value}
                          type="button"
                          onClick={() => handleCategoryChange(category.value)}
                          className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors ${
                            searchCategory === category.value ? "bg-blue-50 text-blue-600" : "text-gray-900"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="font-medium">{category.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Search Input */}
            <div className="relative flex-1" ref={searchRef}>
              <input
                type="text"
                placeholder={`Search ${selectedCategory?.label.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-20 py-2 rounded-lg text-gray-900 placeholder-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 border border-gray-200"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                )}
                <button
                  type="submit"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Search size={20} />
                </button>
              </div>

              {/* Search Results Dropdown */}
              {isSearchOpen && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-30" onClick={() => setIsSearchOpen(false)} />

                  {/* Results */}
                  <div className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border z-40 max-h-96 overflow-y-auto">
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
                            Found {postResults.length} post{postResults.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        {postResults.map((post) => (
                          <button
                            key={post.id}
                            onClick={() => handlePostClick(post.id, post.postSource)}
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
                                 post.author.avatar.startsWith('http') &&
                                 (post.author.avatar.includes('backend.bizcivitas.com') ||
                                  post.author.avatar.includes('images.unsplash.com')) ? (
                                // BizHub - show author avatar
                                <Image
                                  src={post.author.avatar}
                                  alt={post.author.name}
                                  width={40}
                                  height={40}
                                  className="rounded-full object-cover flex-shrink-0"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
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
                                  <span className="text-xs text-gray-500">{post.author.name}</span>
                                  <span className="text-xs text-gray-400">•</span>
                                  <span className="text-xs text-gray-500">{post.timeAgo}</span>
                                </div>
                              </div>

                              {/* Source Badge */}
                              <span className={`px-2 py-1 text-xs font-medium rounded flex-shrink-0 ${
                                post.postSource === "bizpulse"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-green-100 text-green-700"
                              }`}>
                                {post.postSource === "bizpulse" ? "BizPulse" : "BizHub"}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : searchCategory === "posts" && searchQuery.trim().length >= 2 ? (
                      <div className="p-8 text-center text-gray-500">
                        <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="font-medium">No posts found</p>
                        <p className="text-sm mt-1">Try searching with different keywords</p>
                      </div>
                    ) :

                    /* MEMBERS SEARCH RESULTS */
                    searchCategory === "members" && isSearching ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto" />
                        <p className="mt-2">Searching members...</p>
                      </div>
                    ) : searchCategory === "members" && searchResults && searchResults.length > 0 ? (
                      <div>
                        <div className="px-4 py-2 bg-gray-50 border-b">
                          <p className="text-sm font-semibold text-gray-700">
                            Found {searchResults.length} member{searchResults.length !== 1 ? 's' : ''}
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
                               user.avatar.startsWith('http') &&
                               (user.avatar.includes('backend.bizcivitas.com') ||
                                user.avatar.includes('images.unsplash.com')) ? (
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
                                    <span className="truncate">{user.business}</span>
                                  </div>
                                )}
                                {user.companyName && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Building2 className="w-3 h-3" />
                                    <span className="truncate">{user.companyName}</span>
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
                    ) : searchCategory === "members" && searchQuery.trim().length >= 2 ? (
                      <div className="p-8 text-center text-gray-500">
                        <UserIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="font-medium">No members found</p>
                        <p className="text-sm mt-1">Try searching with different keywords</p>
                      </div>
                    ) :

                    /* EVENTS SEARCH - COMING SOON */
                    searchCategory === "events" && searchQuery.trim().length >= 2 ? (
                      <div className="p-8 text-center text-gray-500">
                        <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="font-medium">Coming Soon!</p>
                        <p className="text-sm mt-1">Event search will be available soon</p>
                      </div>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          </div>
        </form>
        <div className="flex items-center ml-4">
          {/* Notification Dropdown - Updated with new icon */}
          {showNotificationIcon && <NotificationDropdown iconPath="/notification.svg" />}

          {/* User Profile Dropdown - Settings & Logout */}
          {showNotificationIcon && <UserProfileDropdown className="ml-2" />}
        </div>
      </div>
    </header>
  );
}
