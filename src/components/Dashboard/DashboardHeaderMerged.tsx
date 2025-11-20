"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    User as UserIcon,
    Building2,
    MapPin,
    X,
    ChevronDown,
    Calendar,
} from "lucide-react";
import NotificationDropdown from "@/components/NotificationDropdown";
import { useLazySearchUsersQuery } from "@/store/api/connectionsApi";
import { bizpulseApi } from "../../services/bizpulseApi";
import { bizhubApi } from "../../services/bizhubApi";
import { useGetAllEventsQuery } from "@/store/api/eventsApi.latest";

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
    banner?: string;
}

export default function DashboardHeader() {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchCategory, setSearchCategory] = useState<SearchCategory>("members");
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [navigatingToUserId, setNavigatingToUserId] = useState<string | null>(null);
    const [navigatingToPostId, setNavigatingToPostId] = useState<string | null>(null);
    const [navigatingToEventId, setNavigatingToEventId] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const [showSearchBar, setShowSearchBar] = useState(false);

    const [searchUsers, { data: searchResults, isLoading: isSearching }] = useLazySearchUsersQuery();
    const [postResults, setPostResults] = useState<SearchPost[]>([]);
    const [isSearchingPosts, setIsSearchingPosts] = useState(false);

    // Events data
    const { data: allEvents = [] } = useGetAllEventsQuery();
    const [eventResults, setEventResults] = useState<SearchEvent[]>([]);

    const searchRef = useRef<HTMLFormElement>(null);
    const categoryRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const showNotificationIcon = true;

    const categories = [
        { value: "members" as SearchCategory, label: "Members", icon: UserIcon },
        { value: "posts" as SearchCategory, label: "Posts", icon: Building2 },
        { value: "events" as SearchCategory, label: "Events", icon: MapPin },
    ];

    const selectedCategory = categories.find((c) => c.value === searchCategory);
    const CategoryIcon = selectedCategory?.icon || UserIcon;

    // Helper function to strip HTML tags
    const stripHtml = (html: string): string => {
        let text = html.replace(/<[^>]*>/g, "");
        text = text.replace(/&nbsp;/g, " ");
        text = text.replace(/&amp;/g, "&");
        text = text.replace(/&lt;/g, "<");
        text = text.replace(/&gt;/g, ">");
        text = text.replace(/&quot;/g, '"');
        text = text.replace(/&#39;/g, "'");
        text = text.replace(/\s+/g, " ").trim();
        return text;
    };

    // Search posts function
    const searchPosts = async (query: string) => {
        setIsSearchingPosts(true);
        try {
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
                            postSource: "bizhub",
                            category: post.category,
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

    // Search events function
    const searchEvents = (query: string) => {
        if (!allEvents || allEvents.length === 0) {
            setEventResults([]);
            return;
        }

        const filtered = allEvents.filter((event: any) => {
            const title = event.title?.toLowerCase() || "";
            const description = event.description?.toLowerCase() || "";
            const venue = event.venue?.toLowerCase() || "";
            const q = query.toLowerCase();

            return title.includes(q) || description.includes(q) || venue.includes(q);
        });

        const mappedEvents: SearchEvent[] = filtered.map((event: any) => ({
            id: event._id,
            title: event.title,
            description: stripHtml(event.description || ""),
            eventDate: new Date(event.eventDate).toLocaleDateString(),
            venue: event.venue,
            isFree: event.isFree,
            accessMode: event.accessMode,
            banner: event.banner,
        }));

        setEventResults(mappedEvents);
    };

    // Auto search when typing
    useEffect(() => {
        if (searchQuery.trim().length >= 2) {
            const timer = setTimeout(() => {
                if (searchCategory === "members") {
                    const nameParts = searchQuery.trim().split(/\s+/);
                    const searchParams: any = { keyword: searchQuery.trim() };
                    if (nameParts.length >= 2) {
                        searchParams.fname = nameParts[0];
                        searchParams.lname = nameParts.slice(1).join(" ");
                    }
                    searchUsers(searchParams);
                } else if (searchCategory === "posts") {
                    searchPosts(searchQuery.trim());
                } else if (searchCategory === "events") {
                    searchEvents(searchQuery.trim());
                }
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [searchQuery, searchCategory, allEvents]);

    // Handle click outside
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
    }, [searchQuery]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim().length >= 2) {
            if (searchCategory === "members") {
                const nameParts = searchQuery.trim().split(/\s+/);
                const searchParams: any = { keyword: searchQuery.trim() };
                if (nameParts.length >= 2) {
                    searchParams.fname = nameParts[0];
                    searchParams.lname = nameParts.slice(1).join(" ");
                }
                searchUsers(searchParams);
            } else if (searchCategory === "posts") {
                searchPosts(searchQuery.trim());
            } else if (searchCategory === "events") {
                searchEvents(searchQuery.trim());
            }
            setIsSearchOpen(true);
        }
    };

    const handleCategoryChange = (e: React.MouseEvent, category: SearchCategory) => {
        e.stopPropagation();
        setSearchCategory(category);
        setSearchQuery("");
        setPostResults([]);
        setEventResults([]);
        setIsCategoryDropdownOpen(false);
        setIsSearchOpen(true); // Keep search dropdown open
    };

    const handleUserClick = (userId: string | undefined) => {
        if (!userId) return;
        setNavigatingToUserId(userId);
        router.push(`/feeds/connections/${userId}?from=member-directory`);
        setTimeout(() => {
            setIsSearchOpen(false);
            setSearchQuery("");
            setNavigatingToUserId(null);
        }, 500);
    };

    const handlePostClick = (e: React.MouseEvent, postId: string, postSource: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!postId) return;
        setNavigatingToPostId(postId);
        if (postSource === "bizpulse") {
            router.push(`/feeds/biz-pulse/${postId}`);
        } else {
            router.push(`/feeds/biz-hub/${postId}`);
        }
        setTimeout(() => {
            setIsSearchOpen(false);
            setSearchQuery("");
            setNavigatingToPostId(null);
        }, 500);
    };

    const handleEventClick = (e: React.MouseEvent, eventId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!eventId) return;
        setNavigatingToEventId(eventId);
        router.push(`/feeds/events/event/${eventId}`);
        setTimeout(() => {
            setIsSearchOpen(false);
            setSearchQuery("");
            setNavigatingToEventId(null);
        }, 500);
    };

    const clearSearch = () => {
        setSearchQuery("");
        setIsSearchOpen(false);
        setPostResults([]);
        setEventResults([]);
    };

    // Mobile menu handlers
    useEffect(() => {
        const handleMobileMenuState = (event: Event) => {
            const customEvent = event as CustomEvent<{ isOpen: boolean }>;
            setIsMobileMenuOpen(customEvent.detail.isOpen);
        };

        window.addEventListener("mobileMenuStateChanged", handleMobileMenuState);
        return () => window.removeEventListener("mobileMenuStateChanged", handleMobileMenuState);
    }, []);

    // Auto-hide header on scroll
    useEffect(() => {
        const handleScroll = (event: Event) => {
            const customEvent = event as CustomEvent<{ scrollY: number; lastScrollY: number }>;
            const { scrollY: currentScrollY, lastScrollY } = customEvent.detail;

            if (currentScrollY < lastScrollY || currentScrollY < 100) {
                setIsHeaderVisible(true);
            } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsHeaderVisible(false);
                setShowSearchBar(false);
            }
        };

        window.addEventListener("mainScroll", handleScroll);
        return () => window.removeEventListener("mainScroll", handleScroll);
    }, []);

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-40 bg-red-500 shadow-sm transition-transform duration-300 ${isHeaderVisible ? "translate-y-0" : "-translate-y-full"
                    }`}
            >
                <div className="flex items-center justify-between px-6 py-3">
                    {/* Hamburger Menu - Mobile Only */}
                    <button
                        onClick={() => {
                            window.dispatchEvent(new CustomEvent("toggleMobileMenu"));
                        }}
                        className="md:hidden flex items-center justify-center hover:bg-blue-600 rounded-lg p-2 transition-colors w-10 h-10"
                    >
                        <div className="w-6 h-5 relative flex flex-col justify-center items-center">
                            <span
                                className={`w-full h-0.5 bg-white rounded-full transition-all duration-300 ease-in-out absolute ${isMobileMenuOpen
                                    ? "rotate-45 top-1/2 -translate-y-1/2"
                                    : "top-0"
                                    }`}
                            />
                            <span
                                className={`w-full h-0.5 bg-white rounded-full transition-all duration-300 ease-in-out absolute top-1/2 -translate-y-1/2 ${isMobileMenuOpen
                                    ? "opacity-0 scale-0"
                                    : "opacity-100 scale-100"
                                    }`}
                            />
                            <span
                                className={`w-full h-0.5 bg-white rounded-full transition-all duration-300 ease-in-out absolute ${isMobileMenuOpen
                                    ? "-rotate-45 top-1/2 -translate-y-1/2"
                                    : "bottom-0"
                                    }`}
                            />
                        </div>
                    </button>

                    {/* Spacer for mobile */}
                    <div className="md:hidden flex-1"></div>

                    {/* Desktop Search Bar */}
                    <div className="hidden md:flex flex-1 justify-center">
                        <form
                            ref={searchRef}
                            onSubmit={handleSearch}
                            className={`relative w-full max-w-xl transition-opacity duration-300 ${showSearchBar ? "opacity-100" : "opacity-0 pointer-events-none"
                                }`}
                        >
                            <div
                                className="relative flex items-center bg-white rounded-full border border-gray-300 shadow-sm hover:shadow-md transition-shadow"
                            >
                                {/* Category Dropdown */}
                                <div className="relative" ref={categoryRef}>
                                    <button
                                        type="button"
                                        onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                                        className="flex items-center gap-2 px-5 py-2.5 hover:bg-gray-50 rounded-l-full transition-colors border-r border-gray-300"
                                    >
                                        {selectedCategory?.icon && (
                                            <selectedCategory.icon
                                                className={`w-4 h-4 ${searchCategory === "members"
                                                    ? "text-blue-600"
                                                    : searchCategory === "posts"
                                                        ? "text-green-600"
                                                        : "text-purple-600"
                                                    }`}
                                            />
                                        )}
                                        <span
                                            className={`font-medium text-sm ${searchCategory === "members"
                                                ? "text-blue-600"
                                                : searchCategory === "posts"
                                                    ? "text-green-600"
                                                    : "text-purple-600"
                                                }`}
                                        >
                                            {selectedCategory?.label}
                                        </span>
                                        <ChevronDown className="w-4 h-4 text-gray-600" />
                                    </button>

                                    {/* Category Dropdown Menu */}
                                    {isCategoryDropdownOpen && (
                                        <div
                                            className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-[110] py-1"
                                        >
                                            {categories.map((category) => {
                                                const Icon = category.icon;
                                                return (
                                                    <button
                                                        key={category.value}
                                                        type="button"
                                                        onClick={(e) => handleCategoryChange(e, category.value)}
                                                        className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors ${searchCategory === category.value
                                                            ? "bg-blue-50 text-blue-600"
                                                            : "text-gray-900"
                                                            }`}
                                                    >
                                                        <Icon className="w-4 h-4" />
                                                        <span className="font-medium">{category.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Search Input */}
                                <input
                                    type="text"
                                    placeholder={`Search for ${selectedCategory?.label.toLowerCase()}`}
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        if (e.target.value.trim().length >= 2) {
                                            setIsSearchOpen(true);
                                        }
                                    }}
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

                            {/* Search Results Dropdown */}
                            {isSearchOpen && (
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
                                                    Found {postResults.length} post{postResults.length !== 1 ? "s" : ""}
                                                </p>
                                            </div>
                                            {postResults.map((post) => (
                                                <button
                                                    key={post.id}
                                                    onClick={(e) => handlePostClick(e, post.id, post.postSource)}
                                                    disabled={navigatingToPostId === post.id}
                                                    className={`w-full px-4 py-3 transition-colors text-left border-b last:border-b-0 ${navigatingToPostId === post.id
                                                        ? "bg-blue-50 cursor-wait"
                                                        : "hover:bg-gray-50 cursor-pointer"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3 relative">
                                                        {navigatingToPostId === post.id && (
                                                            <div className="absolute inset-0 bg-blue-50/80 flex items-center justify-center rounded-lg z-10">
                                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                                            </div>
                                                        )}
                                                        {post.postSource === "bizpulse" ? (
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
                                                            (post.author.avatar.includes("backend.bizcivitas.com") ||
                                                                post.author.avatar.includes("images.unsplash.com")) ? (
                                                            <Image
                                                                src={post.author.avatar}
                                                                alt={post.author.name}
                                                                width={40}
                                                                height={40}
                                                                className="rounded-full object-cover flex-shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                                <span className="text-blue-600 font-semibold">
                                                                    {post.author.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                        )}

                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-gray-900 truncate">{post.title}</p>
                                                            {post.content && (
                                                                <p className="text-sm text-gray-500 truncate">{post.content}</p>
                                                            )}
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                By {post.author.name} • {post.timeAgo}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : searchCategory === "posts" && searchQuery.trim().length >= 2 ? (
                                        <div className="p-4 text-center text-gray-500">No posts found</div>
                                    ) : null}

                                    {/* MEMBERS SEARCH RESULTS */}
                                    {searchCategory === "members" && isSearching ? (
                                        <div className="p-4 text-center text-gray-500">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto" />
                                            <p className="mt-2">Searching members...</p>
                                        </div>
                                    ) : searchCategory === "members" && searchResults && searchResults.length > 0 ? (
                                        <div>
                                            <div className="px-4 py-2 bg-gray-50 border-b">
                                                <p className="text-sm font-semibold text-gray-700">
                                                    Found {searchResults.length} member{searchResults.length !== 1 ? "s" : ""}
                                                </p>
                                            </div>
                                            {searchResults.map((user) => (
                                                <button
                                                    key={user._id}
                                                    onClick={() => handleUserClick(user._id)}
                                                    disabled={navigatingToUserId === user._id}
                                                    className={`w-full px-4 py-3 transition-colors text-left border-b last:border-b-0 ${navigatingToUserId === user._id
                                                        ? "bg-blue-50 cursor-wait"
                                                        : "hover:bg-gray-50 cursor-pointer"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3 relative">
                                                        {navigatingToUserId === user._id && (
                                                            <div className="absolute inset-0 bg-blue-50/80 flex items-center justify-center rounded-lg z-10">
                                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                                            </div>
                                                        )}
                                                        {user.avatar &&
                                                            user.avatar.startsWith("http") &&
                                                            (user.avatar.includes("backend.bizcivitas.com") ||
                                                                user.avatar.includes("images.unsplash.com")) ? (
                                                            <Image
                                                                src={user.avatar}
                                                                alt={`${user.fname} ${user.lname}`}
                                                                width={40}
                                                                height={40}
                                                                className="rounded-full object-cover flex-shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                                <span className="text-blue-600 font-semibold">
                                                                    {user.fname?.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-gray-900 truncate">
                                                                {user.fname} {user.lname}
                                                            </p>
                                                            {user.business && (
                                                                <p className="text-sm text-gray-500 truncate">{user.business}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : searchCategory === "members" && searchQuery.trim().length >= 2 ? (
                                        <div className="p-4 text-center text-gray-500">No members found</div>
                                    ) : null}

                                    {/* EVENTS SEARCH RESULTS */}
                                    {searchCategory === "events" && eventResults.length > 0 ? (
                                        <div>
                                            <div className="px-4 py-2 bg-gray-50 border-b">
                                                <p className="text-sm font-semibold text-gray-700">
                                                    Found {eventResults.length} event{eventResults.length !== 1 ? "s" : ""}
                                                </p>
                                            </div>
                                            {eventResults.map((event) => (
                                                <button
                                                    key={event.id}
                                                    onClick={(e) => handleEventClick(e, event.id)}
                                                    disabled={navigatingToEventId === event.id}
                                                    className={`w-full px-4 py-3 transition-colors text-left border-b last:border-b-0 ${navigatingToEventId === event.id
                                                        ? "bg-blue-50 cursor-wait"
                                                        : "hover:bg-gray-50 cursor-pointer"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3 relative">
                                                        {navigatingToEventId === event.id && (
                                                            <div className="absolute inset-0 bg-blue-50/80 flex items-center justify-center rounded-lg z-10">
                                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                                            </div>
                                                        )}
                                                        {event.banner ? (
                                                            <Image
                                                                src={event.banner}
                                                                alt={event.title}
                                                                width={40}
                                                                height={40}
                                                                className="rounded-md object-cover flex-shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-md bg-purple-100 flex items-center justify-center flex-shrink-0">
                                                                <Calendar className="w-5 h-5 text-purple-600" />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-gray-900 truncate">{event.title}</p>
                                                            <p className="text-xs text-gray-500 truncate mt-1">
                                                                {event.eventDate} • {event.venue}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : searchCategory === "events" && searchQuery.trim().length >= 2 ? (
                                        <div className="p-4 text-center text-gray-500">No events found</div>
                                    ) : null}
                                </div>
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

            {/* Mobile Search Dropdown */}
            {showSearchBar && (
                <div className="md:hidden fixed top-16 left-0 right-0 z-[9] bg-white shadow-lg border-t border-gray-200 animate-slideDown">
                    <div className="p-4">
                        <form onSubmit={handleSearch} className="relative" ref={searchRef}>
                            <div
                                className="relative flex items-center bg-white rounded-full border border-gray-300 shadow-sm"
                            >
                                {/* Category Dropdown */}
                                <div className="relative" ref={categoryRef}>
                                    <button
                                        type="button"
                                        onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                                        className="flex items-center gap-1 px-3 py-2.5 hover:bg-gray-50 rounded-l-full transition-colors border-r border-gray-300"
                                    >
                                        <CategoryIcon
                                            className={`w-5 h-5 ${searchCategory === "members"
                                                ? "text-blue-600"
                                                : searchCategory === "posts"
                                                    ? "text-green-600"
                                                    : "text-purple-600"
                                                }`}
                                        />
                                        <ChevronDown className="w-3 h-3 text-gray-600" />
                                    </button>

                                    {/* Category Dropdown Menu */}
                                    {isCategoryDropdownOpen && (
                                        <div
                                            className="absolute top-full left-0 mt-2 w-52 bg-white rounded-lg shadow-lg border z-[110] py-1"
                                        >
                                            {categories.map((category) => {
                                                const Icon = category.icon;
                                                return (
                                                    <button
                                                        key={category.value}
                                                        type="button"
                                                        onClick={(e) => handleCategoryChange(e, category.value)}
                                                        className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors ${searchCategory === category.value
                                                            ? "bg-blue-50 text-blue-600"
                                                            : "text-gray-900"
                                                            }`}
                                                    >
                                                        <Icon className="w-5 h-5" />
                                                        <span className="font-medium text-sm">{category.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Search Input */}
                                <input
                                    type="text"
                                    placeholder={`Search for ${selectedCategory?.label.toLowerCase()}`}
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        if (e.target.value.trim().length >= 2) {
                                            setIsSearchOpen(true);
                                        }
                                    }}
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

                            {/* Mobile Search Results */}
                            {isSearchOpen && (
                                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-lg border z-40 max-h-80 overflow-y-auto">
                                    {/* Same results as desktop */}
                                    {searchCategory === "posts" && isSearchingPosts ? (
                                        <div className="p-4 text-center text-gray-500">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto" />
                                            <p className="mt-2 text-sm">Searching posts...</p>
                                        </div>
                                    ) : searchCategory === "posts" && postResults.length > 0 ? (
                                        <div>
                                            <div className="px-3 py-2 bg-gray-50 border-b">
                                                <p className="text-xs font-semibold text-gray-700">
                                                    Found {postResults.length} post{postResults.length !== 1 ? "s" : ""}
                                                </p>
                                            </div>
                                            {postResults.map((post) => (
                                                <button
                                                    key={post.id}
                                                    onClick={(e) => handlePostClick(e, post.id, post.postSource)}
                                                    disabled={navigatingToPostId === post.id}
                                                    className={`w-full px-3 py-2 transition-colors text-left border-b last:border-b-0 ${navigatingToPostId === post.id
                                                        ? "bg-blue-50 cursor-wait"
                                                        : "hover:bg-gray-50 cursor-pointer"
                                                        }`}
                                                >
                                                    <div className="relative">
                                                        {navigatingToPostId === post.id && (
                                                            <div className="absolute inset-0 bg-blue-50/80 flex items-center justify-center rounded-lg z-10">
                                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                                            </div>
                                                        )}
                                                        <p className="font-medium text-sm text-gray-900 truncate">{post.title}</p>
                                                        {post.content && (
                                                            <p className="text-xs text-gray-500 truncate mt-1">{post.content}</p>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : searchCategory === "posts" && searchQuery.trim().length >= 2 ? (
                                        <div className="p-4 text-center text-sm text-gray-500">No posts found</div>
                                    ) : null}

                                    {searchCategory === "members" && isSearching ? (
                                        <div className="p-4 text-center text-gray-500">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto" />
                                            <p className="mt-2 text-sm">Searching members...</p>
                                        </div>
                                    ) : searchCategory === "members" && searchResults && searchResults.length > 0 ? (
                                        <div>
                                            <div className="px-3 py-2 bg-gray-50 border-b">
                                                <p className="text-xs font-semibold text-gray-700">
                                                    Found {searchResults.length} member{searchResults.length !== 1 ? "s" : ""}
                                                </p>
                                            </div>
                                            {searchResults.map((user) => (
                                                <button
                                                    key={user._id}
                                                    onClick={() => handleUserClick(user._id)}
                                                    disabled={navigatingToUserId === user._id}
                                                    className={`w-full px-3 py-2 transition-colors text-left border-b last:border-b-0 ${navigatingToUserId === user._id
                                                        ? "bg-blue-50 cursor-wait"
                                                        : "hover:bg-gray-50 cursor-pointer"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2 relative">
                                                        {navigatingToUserId === user._id && (
                                                            <div className="absolute inset-0 bg-blue-50/80 flex items-center justify-center rounded-lg z-10">
                                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                                            </div>
                                                        )}
                                                        {user.avatar &&
                                                            user.avatar.startsWith("http") &&
                                                            (user.avatar.includes("backend.bizcivitas.com") ||
                                                                user.avatar.includes("images.unsplash.com")) ? (
                                                            <Image
                                                                src={user.avatar}
                                                                alt={`${user.fname} ${user.lname}`}
                                                                width={32}
                                                                height={32}
                                                                className="rounded-full object-cover flex-shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                                <span className="text-blue-600 text-xs font-semibold">
                                                                    {user.fname?.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-sm text-gray-900 truncate">
                                                                {user.fname} {user.lname}
                                                            </p>
                                                            {user.business && (
                                                                <p className="text-xs text-gray-500 truncate">{user.business}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : searchCategory === "members" && searchQuery.trim().length >= 2 ? (
                                        <div className="p-4 text-center text-sm text-gray-500">No members found</div>
                                    ) : null}

                                    {/* EVENTS SEARCH RESULTS - MOBILE */}
                                    {searchCategory === "events" && eventResults.length > 0 ? (
                                        <div>
                                            <div className="px-3 py-2 bg-gray-50 border-b">
                                                <p className="text-xs font-semibold text-gray-700">
                                                    Found {eventResults.length} event{eventResults.length !== 1 ? "s" : ""}
                                                </p>
                                            </div>
                                            {eventResults.map((event) => (
                                                <button
                                                    key={event.id}
                                                    onClick={(e) => handleEventClick(e, event.id)}
                                                    disabled={navigatingToEventId === event.id}
                                                    className={`w-full px-3 py-2 transition-colors text-left border-b last:border-b-0 ${navigatingToEventId === event.id
                                                        ? "bg-blue-50 cursor-wait"
                                                        : "hover:bg-gray-50 cursor-pointer"
                                                        }`}
                                                >
                                                    <div className="relative">
                                                        {navigatingToEventId === event.id && (
                                                            <div className="absolute inset-0 bg-blue-50/80 flex items-center justify-center rounded-lg z-10">
                                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                                            </div>
                                                        )}
                                                        <p className="font-medium text-sm text-gray-900 truncate">{event.title}</p>
                                                        <p className="text-xs text-gray-500 truncate mt-1">
                                                            {event.eventDate} • {event.venue}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : searchCategory === "events" && searchQuery.trim().length >= 2 ? (
                                        <div className="p-4 text-center text-sm text-gray-500">No events found</div>
                                    ) : null}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
