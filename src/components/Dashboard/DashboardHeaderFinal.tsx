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
    Search,
    Menu,
    Bell,
    Activity,
    Network
} from "lucide-react";
import NotificationDropdown from "@/components/NotificationDropdown";
import { useLazySearchUsersQuery } from "@/store/api/connectionsApi";
import { bizpulseApi } from "../../services/bizpulseApi";
import { bizhubApi } from "../../services/bizhubApi";
import { useGetAllEventsQuery } from "@/store/api/eventsApi.latest";
import { getAbsoluteImageUrl } from "@/utils/imageUtils";
import Avatar from "@/components/ui/Avatar";

// --- Types & Interfaces ---

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

// --- Helper Functions ---

const stripHtml = (html: string): string => {
    if (!html) return "";
    let text = html.replace(/<[^>]*>/g, "");
    text = text.replace(/&nbsp;/g, " ");
    text = text.replace(/&amp;/g, "&");
    text = text.replace(/&lt;/g, "<");
    text = text.replace(/&gt;/g, ">");
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");
    return text.replace(/\s+/g, " ").trim();
};

export default function DashboardHeaderFinal() {
    const router = useRouter();

    // --- State ---
    const [searchQuery, setSearchQuery] = useState("");
    const [searchCategory, setSearchCategory] = useState<SearchCategory>("members");

    // UI State
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const [showSearchBar, setShowSearchBar] = useState(false);

    // Loading/Navigation State
    const [navigatingId, setNavigatingId] = useState<string | null>(null); // Unified navigation state

    // Data State
    const [searchUsers, { data: memberResults, isLoading: isSearchingMembers }] = useLazySearchUsersQuery();
    const [postResults, setPostResults] = useState<SearchPost[]>([]);
    const [isSearchingPosts, setIsSearchingPosts] = useState(false);
    const { data: allEvents = [] } = useGetAllEventsQuery();
    const [eventResults, setEventResults] = useState<SearchEvent[]>([]);

    // Refs
    const desktopSearchRef = useRef<HTMLDivElement>(null);
    const mobileSearchRef = useRef<HTMLDivElement>(null);

    // --- Configuration ---
    const categories = [
        { value: "members" as SearchCategory, label: "Members", icon: UserIcon, color: "text-blue-600", bgColor: "bg-blue-50" },
        { value: "posts" as SearchCategory, label: "Posts", icon: Building2, color: "text-green-600", bgColor: "bg-green-50" },
        { value: "events" as SearchCategory, label: "Events", icon: MapPin, color: "text-purple-600", bgColor: "bg-purple-50" },
    ];

    const activeCategory = categories.find(c => c.value === searchCategory) || categories[0];
    const CategoryIcon = activeCategory.icon;

    // --- Search Logic ---

    const handleSearch = async (query: string, category: SearchCategory) => {
        if (query.trim().length < 2) {
            setPostResults([]);
            setEventResults([]);
            return;
        }

        if (category === "members") {
            const nameParts = query.trim().split(/\s+/);
            const searchParams: any = { keyword: query.trim() };
            if (nameParts.length >= 2) {
                searchParams.fname = nameParts[0];
                searchParams.lname = nameParts.slice(1).join(" ");
            }
            searchUsers(searchParams);
        } else if (category === "posts") {
            setIsSearchingPosts(true);
            try {
                const [bizpulsePosts, bizhubPosts] = await Promise.all([
                    bizpulseApi.fetchWallFeeds({ limit: 100 }),
                    bizhubApi.fetchPosts(),
                ]);

                const allPosts: SearchPost[] = [];
                const lowerQuery = query.toLowerCase();

                // Process BizPulse (Admin posts)
                if (bizpulsePosts?.data?.wallFeeds) {
                    bizpulsePosts.data.wallFeeds.forEach((post: any) => {
                        const title = stripHtml(String(post.title || post.poll?.question || ""));
                        const desc = stripHtml(String(post.description || ""));

                        if (title.toLowerCase().includes(lowerQuery) || desc.toLowerCase().includes(lowerQuery)) {
                            allPosts.push({
                                id: post._id,
                                title: title || "Untitled Post",
                                content: desc.substring(0, 100),
                                author: {
                                    name: "BizCivitas Admin",
                                    avatar: "/favicon.ico",
                                },
                                timeAgo: new Date(post.createdAt).toLocaleDateString(),
                                postSource: "bizpulse",
                                category: post.type,
                            });
                        }
                    });
                }

                // Process BizHub (Member posts)
                if (bizhubPosts && Array.isArray(bizhubPosts)) {
                    console.log('BizHub Posts Array:', bizhubPosts);
                    console.log('First BizHub Post:', bizhubPosts[0]);
                    bizhubPosts.forEach((post: any) => {
                        const title = stripHtml(String(post.title || ""));
                        const desc = stripHtml(String(post.description || ""));

                        if (title.toLowerCase().includes(lowerQuery) || desc.toLowerCase().includes(lowerQuery)) {
                            console.log('Matching BizHub Post:', {
                                title: post.title,
                                user: post.user,
                                userId: post.userId,
                                author: post.author,
                                createdBy: post.createdBy
                            });

                            // BizHub API returns user.name as the full name (not fname/lname separately)
                            const memberName = post.user?.name || "Unknown Member";
                            const memberAvatar = post.user?.avatar;

                            allPosts.push({
                                id: post._id,
                                title: title || "Untitled Post",
                                content: desc.substring(0, 100),
                                author: {
                                    name: memberName,
                                    avatar: memberAvatar,
                                },
                                timeAgo: new Date(post.createdAt).toLocaleDateString(),
                                postSource: "bizhub",
                                category: post.category,
                            });
                        }
                    });
                }
                setPostResults(allPosts);
            } catch (err) {
                console.error("Post search error:", err);
                setPostResults([]);
            } finally {
                setIsSearchingPosts(false);
            }
        } else if (category === "events") {
            if (!allEvents) return;
            const lowerQuery = query.toLowerCase();
            const filtered = allEvents.filter((event: any) => {
                const title = (event.title || "").toLowerCase();
                const desc = (event.description || "").toLowerCase();
                const venue = (event.venue || "").toLowerCase();
                return title.includes(lowerQuery) || desc.includes(lowerQuery) || venue.includes(lowerQuery);
            });

            setEventResults(filtered.map((event: any) => ({
                id: event._id,
                title: event.title,
                description: stripHtml(event.description || ""),
                eventDate: new Date(event.eventDate).toLocaleDateString(),
                venue: event.venue,
                isFree: event.isFree,
                accessMode: event.accessMode,
                banner: event.banner,
            })));
        }
    };

    // Debounce Effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim().length >= 2) {
                handleSearch(searchQuery, searchCategory);
                setIsSearchOpen(true);
            } else {
                setIsSearchOpen(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, searchCategory, allEvents]);

    // Click Outside Handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const isInsideDesktop = desktopSearchRef.current?.contains(target);
            const isInsideMobile = mobileSearchRef.current?.contains(target);

            if (!isInsideDesktop && !isInsideMobile) {
                setIsSearchOpen(false);
                setIsCategoryDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Scroll Handler
    useEffect(() => {
        const handleScroll = (event: Event) => {
            const { scrollY, lastScrollY } = (event as CustomEvent).detail;
            if (scrollY < lastScrollY || scrollY < 100) {
                setIsHeaderVisible(true);
            } else if (scrollY > lastScrollY && scrollY > 100) {
                setIsHeaderVisible(false);
                setShowSearchBar(false);
            }
        };
        window.addEventListener("mainScroll", handleScroll);
        return () => window.removeEventListener("mainScroll", handleScroll);
    }, []);

    // --- Navigation Handlers ---

    const navigateTo = (path: string, id: string) => {
        setNavigatingId(id);
        router.push(path);
        setTimeout(() => {
            setNavigatingId(null);
            setIsSearchOpen(false);
            setSearchQuery("");
            setShowSearchBar(false);
        }, 800);
    };

    // --- Render Helpers ---

    const renderLoading = (text: string) => (
        <div className="p-6 text-center text-gray-500 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mb-2" />
            <p className="text-sm">{text}</p>
        </div>
    );

    const renderNoResults = (text: string) => (
        <div className="p-6 text-center text-gray-500">
            <p className="text-sm">{text}</p>
        </div>
    );

    const renderHeader = (count: number, label: string) => (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
            <span className="text-xs font-medium text-gray-400">{count} found</span>
        </div>
    );

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-40 bg-blue-500 shadow-sm border-b border-blue-600 transition-transform duration-300 ${isHeaderVisible ? "translate-y-0" : "-translate-y-full"
                    }`}
            >
                <div className="mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

                    {/* Left: Mobile Menu & Logo Area */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent("toggleMobileMenu"))}
                            className="md:hidden p-2 rounded-md text-white hover:bg-blue-600 transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        {/* Logo/Brand */}
                        <div className="font-bold text-xl text-white hidden md:block"></div>
                    </div>

                    {/* Right Side: Search Bar + Actions */}
                    <div className="flex items-center gap-3 md:gap-4">
                        {/* Search Bar (Desktop) */}
                        {showSearchBar && (
                            <div className="hidden md:flex max-w-xl md:max-w-sm relative" ref={desktopSearchRef}>
                        <div className={`w-full flex items-center bg-white rounded-lg border ${isSearchOpen ? 'border-blue-300 ring-1 ring-blue-300' : 'border-transparent'} transition-all duration-200`}>

                            {/* Category Selector */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                                    className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-200 rounded-l-lg transition-colors border-r border-gray-200"
                                >
                                    <CategoryIcon className={`w-4 h-4 ${activeCategory.color}`} />
                                    <span className={`text-sm font-medium ${activeCategory.color}`}>{activeCategory.label}</span>
                                    <ChevronDown className="w-3 h-3 text-gray-500" />
                                </button>

                                {/* Category Dropdown */}
                                {isCategoryDropdownOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.value}
                                                onClick={() => {
                                                    setSearchCategory(cat.value);
                                                    setIsCategoryDropdownOpen(false);
                                                    // Trigger search immediately if query exists
                                                    if (searchQuery.trim().length >= 2) handleSearch(searchQuery, cat.value);
                                                }}
                                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${searchCategory === cat.value ? "bg-blue-50/50" : ""
                                                    }`}
                                            >
                                                <cat.icon className={`w-4 h-4 ${cat.color}`} />
                                                <span className={`text-sm font-medium ${searchCategory === cat.value ? 'text-gray-900' : 'text-gray-600'}`}>
                                                    {cat.label}
                                                </span>
                                                {searchCategory === cat.value && (
                                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Search Input */}
                            <div className="flex-1 flex items-center px-3 relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={`Search ${activeCategory.label.toLowerCase()}...`}
                                    className="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-900 placeholder-gray-500 py-2.5 px-2"
                                />
                                {searchQuery && (
                                    <button onClick={() => { setSearchQuery(""); setIsSearchOpen(false); }} className="p-1 hover:bg-gray-200 rounded-full text-gray-400 transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}

                                {/* Search Results Dropdown */}
                                {isSearchOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-[480px] overflow-y-auto z-50 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">

                                        {/* MEMBERS */}
                                        {searchCategory === "members" && (
                                            <>
                                                {isSearchingMembers ? renderLoading("Finding members...") :
                                                    memberResults && memberResults.length > 0 ? (
                                                        <>
                                                            {renderHeader(memberResults.length, "Members")}
                                                            {memberResults.filter(u => u._id).map(user => (
                                                                <button
                                                                    key={user._id!}
                                                                    onClick={() => navigateTo(`/feeds/connections/${user._id!}?from=member-directory`, user._id!)}
                                                                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 text-left group"
                                                                >
                                                                    <div className="relative flex-shrink-0">
                                                                        {user.avatar ? (
                                                                            <Image src={user.avatar} alt={user.fname} width={40} height={40} className="rounded-full object-cover" />
                                                                        ) : (
                                                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                                                {user.fname?.[0]}
                                                                            </div>
                                                                        )}
                                                                        {navigatingId === user._id && (
                                                                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-full">
                                                                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{user.fname} {user.lname}</p>
                                                                        <p className="text-xs text-gray-500 truncate">{user.business || "Member"}</p>
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </>
                                                    ) : renderNoResults("No members found matching your search.")}
                                            </>
                                        )}

                                        {/* POSTS */}
                                        {searchCategory === "posts" && (
                                            <>
                                                {isSearchingPosts ? renderLoading("Searching posts...") :
                                                    postResults.length > 0 ? (
                                                        <>
                                                            {renderHeader(postResults.length, "Posts")}
                                                            {postResults.map(post => (
                                                                <button
                                                                    key={post.id}
                                                                    onClick={() => navigateTo(post.postSource === "bizpulse" ? `/feeds/biz-pulse/${post.id}` : `/feeds/biz-hub/${post.id}`, post.id)}
                                                                    className="w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 text-left group relative"
                                                                >
                                                                    {/* Post Type Icon - Top Right */}
                                                                    <div className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center ${post.postSource === 'bizpulse' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'}`}>
                                                                        {post.postSource === 'bizpulse' ? <Activity className="w-4 h-4" /> : <Network className="w-4 h-4" />}
                                                                    </div>

                                                                    {/* Avatar */}
                                                                    <Avatar
                                                                        src={post.author.avatar}
                                                                        alt={post.author.name}
                                                                        size="md"
                                                                        fallbackText={post.author.name}
                                                                    />

                                                                    {/* Content */}
                                                                    <div className="flex-1 min-w-0 pr-12">
                                                                        {/* Post Title */}
                                                                        <p className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">{post.title}</p>

                                                                        {/* Author Name & Date */}
                                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                            <span className="font-medium">{post.author.name}</span>
                                                                            <span>•</span>
                                                                            <span>{post.timeAgo}</span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Loading Spinner */}
                                                                    {navigatingId === post.id && (
                                                                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                                            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                                                        </div>
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </>
                                                    ) : renderNoResults("No posts found.")}
                                            </>
                                        )}

                                        {/* EVENTS */}
                                        {searchCategory === "events" && (
                                            <>
                                                {eventResults.length > 0 ? (
                                                    <>
                                                        {renderHeader(eventResults.length, "Events")}
                                                        {eventResults.map(event => (
                                                            <button
                                                                key={event.id}
                                                                onClick={() => navigateTo(`/feeds/events/event/${event.id}`, event.id)}
                                                                className="w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 text-left group"
                                                            >
                                                                <div className="flex-shrink-0 relative">
                                                                    {event.banner ? (
                                                                        <Image src={event.banner} alt={event.title} width={48} height={48} className="rounded-lg object-cover" />
                                                                    ) : (
                                                                        <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                                                                            <Calendar className="w-6 h-6" />
                                                                        </div>
                                                                    )}
                                                                    {navigatingId === event.id && (
                                                                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                                                                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-purple-600 transition-colors">{event.title}</p>
                                                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {event.eventDate}</span>
                                                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.venue}</span>
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </>
                                                ) : renderNoResults("No upcoming events found.")}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                            </div>
                        )}

                        {/* Search Toggle (Desktop & Mobile) */}
                        <button
                            className="p-2 text-white hover:bg-blue-600 rounded-full"
                            onClick={() => setShowSearchBar(!showSearchBar)}
                        >
                            <Search className="w-5 h-5" />
                        </button>

                        <div className="relative [&_img]:brightness-0 [&_img]:invert">
                            <NotificationDropdown iconPath="/notification.svg" />
                        </div>
                    </div>
                </div>

                {/* Mobile Search Bar (Expandable) */}
                {showSearchBar && (
                    <div className="md:hidden px-4 pb-4 border-t border-gray-100 bg-white animate-in slide-in-from-top-2">
                        <div className="mt-3" ref={mobileSearchRef}>
                            {/* Mobile Category Tabs */}
                            <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                                {categories.map(cat => (
                                    <button
                                        key={cat.value}
                                        onClick={() => setSearchCategory(cat.value)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${searchCategory === cat.value
                                            ? `${cat.bgColor} ${cat.color} ring-1 ring-inset ring-current`
                                            : "bg-gray-100 text-gray-600"
                                            }`}
                                    >
                                        <cat.icon className="w-3 h-3" />
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            {/* Mobile Input */}
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={`Search ${activeCategory.label.toLowerCase()}...`}
                                    className="w-full bg-gray-100 border-none rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                />
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Mobile Results */}
                            {isSearchOpen && (
                                <div className="mt-2 bg-white rounded-lg shadow-lg border border-gray-100 max-h-[60vh] overflow-y-auto">
                                    {/* Re-use the same logic as desktop, simplified for mobile if needed */}
                                    {/* (Content is identical to desktop results block above) */}
                                    {/* For brevity, I'm relying on the fact that the desktop block renders conditionally based on state. 
                                        However, since the desktop block is absolutely positioned relative to the desktop container, 
                                        we need to duplicate the result rendering here or make it a shared component. 
                                        For this single-file solution, I will duplicate the logic for robustness. */}

                                    {searchCategory === "members" && (
                                        memberResults?.length ? memberResults.filter(u => u._id).map(user => (
                                            <button key={user._id!} onClick={() => navigateTo(`/feeds/connections/${user._id!}?from=member-directory`, user._id!)} className="w-full px-4 py-3 flex items-center gap-3 border-b border-gray-50 text-left">
                                                <Image src={user.avatar || "/default-avatar.png"} alt={user.fname} width={32} height={32} className="rounded-full" />
                                                <div className="flex-1"><p className="text-sm font-medium">{user.fname} {user.lname}</p></div>
                                            </button>
                                        )) : renderNoResults("No members found")
                                    )}

                                    {searchCategory === "posts" && (
                                        postResults.length ? postResults.map(post => (
                                            <button key={post.id} onClick={() => navigateTo(post.postSource === "bizpulse" ? `/feeds/biz-pulse/${post.id}` : `/feeds/biz-hub/${post.id}`, post.id)} className="w-full px-4 py-3 text-left border-b border-gray-50">
                                                <p className="text-sm font-medium truncate">{post.title}</p>
                                            </button>
                                        )) : renderNoResults("No posts found")
                                    )}

                                    {searchCategory === "events" && (
                                        eventResults.length ? eventResults.map(event => (
                                            <button key={event.id} onClick={() => navigateTo(`/feeds/events/event/${event.id}`, event.id)} className="w-full px-4 py-3 text-left border-b border-gray-50">
                                                <p className="text-sm font-medium truncate">{event.title}</p>
                                                <p className="text-xs text-gray-500">{event.eventDate}</p>
                                            </button>
                                        )) : renderNoResults("No events found")
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </header>
            {/* Spacer to prevent content overlap - only show when header is visible */}
            {isHeaderVisible && <div className="h-16" />}
        </>
    );
}
