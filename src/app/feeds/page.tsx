"use client";

import { useState, useCallback, useEffect, memo, useRef } from "react";
import { useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import type { RootState } from "../../../store/store";
import PollCard from "@/components/Dashboard/PollCard";
import InfiniteScroll from "react-infinite-scroll-component";
import PostCard from "@/components/Dashboard/PostCard";
import FloatingDrawer from "@/components/Dashboard/FloatingDrawer";
import { bizpulseApi } from "../../services/bizpulseApi";
import { bizhubApi } from "../../services/bizhubApi";
import { transformWallFeedPostToMock } from "../../utils/bizpulseTransformers";
import { transformBizHubPostToMock } from "../../utils/bizhubTransformers";
import { Activity, Network, Sparkles, Filter, ChevronDown } from "lucide-react";

// removed unused dummy utilities

// --- Component ---
export default function DashboardPage() {
  if (process.env.NODE_ENV !== "production") {
  }

  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial tab from URL or default to "all"
  const tabFromUrl = searchParams.get("tab") as
    | "all"
    | "bizpulse"
    | "bizhub"
    | null;
  const validTabs = ["all", "bizpulse", "bizhub"];
  const initialTab =
    tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : "all";

  const [posts, setPosts] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "bizpulse" | "bizhub">(
    initialTab
  );
  const user = useSelector((state: RootState) => state.auth.user);
  const currentUserId = user?._id || user?.id || "";
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDrawer = () => setIsDrawerOpen(window.innerWidth >= 768);
    updateDrawer();
    window.addEventListener("resize", updateDrawer);
    return () => window.removeEventListener("resize", updateDrawer);
  }, []);

  // Listen for notification dropdown open event to close drawer
  useEffect(() => {
    const handleNotificationOpen = () => {
      setIsDrawerOpen(false);
    };

    window.addEventListener(
      "notificationDropdownOpened",
      handleNotificationOpen
    );
    return () =>
      window.removeEventListener(
        "notificationDropdownOpened",
        handleNotificationOpen
      );
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handler to change tab and update URL
  const handleTabChange = useCallback(
    (tab: "all" | "bizpulse" | "bizhub") => {
      setActiveTab(tab);
      setIsDropdownOpen(false); // Close dropdown when selection is made
      // Update URL without full page reload
      const params = new URLSearchParams(searchParams.toString());
      if (tab === "all") {
        params.delete("tab"); // Remove tab param for default "all"
      } else {
        params.set("tab", tab);
      }
      const newUrl = params.toString()
        ? `/feeds?${params.toString()}`
        : "/feeds";
      router.push(newUrl, { scroll: false });
    },
    [router, searchParams]
  );

  const fetchDailyFeed = useCallback(async () => {
    try {
      setLoading(true);
      const [dailyFeeds, bizhubPosts, allWallFeeds] = await Promise.all([
        bizpulseApi.fetchDailyFeeds(),
        bizpulseApi.fetchBizHubPosts(),
        bizpulseApi.fetchWallFeeds({ limit: 100 }), // Fetch recent posts
      ]);

      // Transform daily feed posts
      const transformedDaily = dailyFeeds.map((wf: any) => ({
        ...transformWallFeedPostToMock(wf),
        postSource: "bizpulse",
      }));
      const transformedBizhubDaily = bizhubPosts
        .filter((p: any) => p.isDailyFeed === true)
        .map((p: any) => ({
          ...transformBizHubPostToMock(p),
          postSource: "bizhub",
        }));

      const merged = [...transformedDaily, ...transformedBizhubDaily];
      setAllPosts(merged);
      setPosts(merged);

      // Get all recent posts (mix BizPulse and BizHub)
      const allBizPulsePosts = (allWallFeeds?.data?.wallFeeds || []).map(
        (wf: any) => ({
          ...transformWallFeedPostToMock(wf),
          postSource: "bizpulse",
          createdAtTimestamp: new Date(wf.createdAt).getTime(),
        })
      );

      const allBizHubPosts = bizhubPosts.map((p: any) => ({
        ...transformBizHubPostToMock(p),
        postSource: "bizhub",
        createdAtTimestamp: new Date(p.createdAt).getTime(),
      }));

      // Mix and sort by most recent
      const mixedPosts = [...allBizPulsePosts, ...allBizHubPosts]
        .sort((a, b) => b.createdAtTimestamp - a.createdAtTimestamp)
        .slice(0, 8)
        .map((post) => ({
          id: post.id,
          title: post.title || post.poll?.question || "Untitled Post",
          description: post.content?.substring(0, 100),
          author: post.author,
          timeAgo: post.timeAgo,
          postSource: post.postSource,
          category: post.category,
          isPoll: !!(post.poll || post.category === "pulse-polls"),
        }));

      setRecentPosts(mixedPosts);
      setHasMore(false);
    } catch (e) {
      console.error("Failed to load daily feed", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDailyFeed();
  }, [fetchDailyFeed]);

  // Filter posts based on active tab
  useEffect(() => {
    if (activeTab === "all") {
      setPosts(allPosts);
    } else if (activeTab === "bizpulse") {
      setPosts(allPosts.filter((post) => post.postSource === "bizpulse"));
    } else if (activeTab === "bizhub") {
      setPosts(allPosts.filter((post) => post.postSource === "bizhub"));
    }
  }, [activeTab, allPosts]);

  return (
    <div className="relative min-h-screen">
      {/* Main content */}
      <div
        className={`transition-all duration-300 no-scrollbar ${
          isDrawerOpen ? "xl:mr-80 lg:mr-20" : "mr-0"
        }`}
      >
        <div className="md:max-w-[95%] lg:max-w-[70%] mx-auto  space-y-3">
          {/* Filter Toggle Button */}
          <div className="flex justify-end mt-4 md:mt-12">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                showFilters
                  ? "bg-orange-500 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200"
              }`}
            >
              <Filter className="w-5 h-5" />
              <span className="font-medium">Filter</span>
            </button>
          </div>

          {/* Tab Navigation - Show/Hide based on showFilters */}
          {showFilters && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 animate-in slide-in-from-top duration-200">
              {/* Mobile Dropdown Navigation (up to md) */}
              <div className="md:hidden p-4">
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-left flex items-center justify-between shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <span className="text-gray-900 font-medium flex items-center gap-2">
                      {activeTab === "all" && (
                        <>
                          <Sparkles className="w-5 h-5" />
                          All
                        </>
                      )}
                      {activeTab === "bizpulse" && (
                        <>
                          <Activity className="w-5 h-5" />
                          BizPulse
                        </>
                      )}
                      {activeTab === "bizhub" && (
                        <>
                          <Network className="w-5 h-5" />
                          BizHub
                        </>
                      )}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <button
                        onClick={() => handleTabChange("all")}
                        className={`w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors duration-150 first:rounded-t-lg flex items-center gap-2 ${
                          activeTab === "all"
                            ? "text-orange-600 bg-orange-50 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        <Sparkles className="w-5 h-5" />
                        All
                      </button>
                      <button
                        onClick={() => handleTabChange("bizpulse")}
                        className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors duration-150 flex items-center gap-2 ${
                          activeTab === "bizpulse"
                            ? "text-blue-600 bg-blue-50 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        <Activity className="w-5 h-5" />
                        BizPulse
                      </button>
                      <button
                        onClick={() => handleTabChange("bizhub")}
                        className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors duration-150 last:rounded-b-lg flex items-center gap-2 ${
                          activeTab === "bizhub"
                            ? "text-blue-600 bg-blue-50 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        <Network className="w-5 h-5" />
                        BizHub
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop Horizontal Tabs (md and above) */}
              <div className="hidden md:block p-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => handleTabChange("all")}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-lg transition-all ${
                      activeTab === "all"
                        ? "bg-orange-500 text-white shadow-md"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Sparkles className="w-5 h-5" />
                    <span className="font-medium">All</span>
                  </button>
                  <button
                    onClick={() => handleTabChange("bizpulse")}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-lg transition-all ${
                      activeTab === "bizpulse"
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Activity className="w-5 h-5" />
                    <span className="font-medium">BizPulse</span>
                  </button>
                  <button
                    onClick={() => handleTabChange("bizhub")}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-lg transition-all ${
                      activeTab === "bizhub"
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Network className="w-5 h-5" />
                    <span className="font-medium">BizHub</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <InfiniteScroll
            dataLength={posts.length}
            next={() => {}}
            hasMore={hasMore}
            loader={
              <div className="text-center flex justify-center items-center">
                {loading && (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
                )}
              </div>
            }
            endMessage={
              <div className="text-center py-8 text-gray-500 text-sm">
                🎉 You&apos;ve reached the end! No more posts.
              </div>
            }
            style={{ overflow: "visible" }}
          >
            {posts.map((post) => {
              const isPoll =
                post.category === "pulse-polls" ||
                (post.poll && post.postType === "poll");
              if (isPoll && post.poll) {
                const wallFeedPost = {
                  _id: post.id,
                  type: "poll",
                  userId: {
                    _id: currentUserId,
                    fname: post.author.name?.split(" ")[0] || "",
                    lname: post.author.name?.split(" ")[1] || "",
                    avatar: post.author.avatar || undefined,
                    username: "",
                  },
                  poll: post.poll,
                  title: post.title,
                  description: post.content,
                  images: post.image ? [post.image] : undefined,
                  badge: "Biz pulse",
                  visibility: "public",
                  likes: Array(post.stats?.likes || 0).fill({ userId: "" }),
                  likeCount: post.stats?.likes || 0,
                  isLiked: post.isLiked || false,
                  comments: [],
                  commentCount: post.stats?.comments || 0,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  timeAgo: post.timeAgo,
                } as any;

                return (
                  <div key={post.id} className="mb-4">
                    <PollCard
                      post={wallFeedPost}
                      currentUserId={currentUserId}
                      onVoteSuccess={(updated) => {
                        const updatedMock = {
                          ...transformWallFeedPostToMock(updated as any),
                          postSource: "bizpulse",
                        };
                        setAllPosts((prev) =>
                          prev.map((p) =>
                            p.id === updatedMock.id ? updatedMock : p
                          )
                        );
                        setPosts((prev) =>
                          prev.map((p) =>
                            p.id === updatedMock.id ? updatedMock : p
                          )
                        );
                      }}
                      onLike={async (postId) => {
                        console.log(
                          "[DashboardPage] Liking poll post:",
                          postId
                        );
                        try {
                          const response = await bizpulseApi.likeWallFeed(
                            postId
                          );
                          console.log(
                            "[DashboardPage] Like response:",
                            response
                          );
                          if (response.success && response.data) {
                            const updatedMock = {
                              ...transformWallFeedPostToMock(
                                response.data as any
                              ),
                              postSource: "bizpulse",
                            };
                            setAllPosts((prev) =>
                              prev.map((p) =>
                                p.id === updatedMock.id ? updatedMock : p
                              )
                            );
                            setPosts((prev) =>
                              prev.map((p) =>
                                p.id === updatedMock.id ? updatedMock : p
                              )
                            );
                            console.log(
                              "[DashboardPage] Post state updated successfully"
                            );
                          }
                        } catch (error) {
                          console.error(
                            "[DashboardPage] Failed to like poll post:",
                            error
                          );
                        }
                      }}
                    />
                  </div>
                );
              }
              return (
                <div key={post.id} className="mb-4">
                  <PostCard
                    {...post}
                    sourceType={post.postSource}
                    isLiked={post.isLiked}
                    onLike={async (postId) => {
                      // Handle like based on post source
                      if (post.postSource === "bizpulse") {
                        try {
                          const response = await bizpulseApi.likeWallFeed(
                            postId
                          );
                          if (response.success && response.data) {
                            const updatedMock = {
                              ...transformWallFeedPostToMock(
                                response.data as any
                              ),
                              postSource: "bizpulse",
                            };
                            setAllPosts((prev) =>
                              prev.map((p) =>
                                p.id === updatedMock.id ? updatedMock : p
                              )
                            );
                            setPosts((prev) =>
                              prev.map((p) =>
                                p.id === updatedMock.id ? updatedMock : p
                              )
                            );
                          }
                        } catch (error) {
                          console.error("Failed to like post:", error);
                        }
                      } else if (post.postSource === "bizhub") {
                        try {
                          const response = await bizhubApi.likePost(postId);
                          if (response) {
                            const updatedMock = {
                              ...transformBizHubPostToMock(response),
                              postSource: "bizhub",
                            };
                            setAllPosts((prev) =>
                              prev.map((p) =>
                                p.id === updatedMock.id ? updatedMock : p
                              )
                            );
                            setPosts((prev) =>
                              prev.map((p) =>
                                p.id === updatedMock.id ? updatedMock : p
                              )
                            );
                          }
                        } catch (error) {
                          console.error("Failed to like post:", error);
                        }
                      }
                    }}
                  />
                </div>
              );
            })}
          </InfiniteScroll>
        </div>
      </div>

      {/* Right Floating Drawer */}
      <FloatingDrawer onToggle={setIsDrawerOpen} recentPosts={recentPosts} />
    </div>
  );
}
