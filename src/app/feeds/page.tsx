"use client";

import { useState, useCallback, useEffect, memo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import PollCard from "@/components/Dashboard/PollCard";
import InfiniteScroll from "react-infinite-scroll-component";
import PostCard from "@/components/Dashboard/PostCard";
import FloatingDrawer from "@/components/Dashboard/FloatingDrawer";
import { bizpulseApi } from "../../services/bizpulseApi";
import { transformWallFeedPostToMock } from "../../utils/bizpulseTransformers";
import { transformBizHubPostToMock } from "../../utils/bizhubTransformers";
import { Activity, Network } from "lucide-react";

// removed unused dummy utilities

// --- Component ---
export default function DashboardPage() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Backend URL:", process.env.NEXT_PUBLIC_BACKEND_URL);
  }

  const [posts, setPosts] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"bizpulse" | "bizhub">("bizpulse");
  const user = useSelector((state: RootState) => state.auth.user);
  const currentUserId = user?._id || user?.id || "";
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const updateDrawer = () => setIsDrawerOpen(window.innerWidth >= 768);
    updateDrawer();
    window.addEventListener("resize", updateDrawer);
    return () => window.removeEventListener("resize", updateDrawer);
  }, []);

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
        postSource: "bizpulse"
      }));
      const transformedBizhubDaily = bizhubPosts
        .filter((p: any) => p.isDailyFeed === true)
        .map((p: any) => ({
          ...transformBizHubPostToMock(p),
          postSource: "bizhub"
        }));

      const merged = [...transformedDaily, ...transformedBizhubDaily];
      setAllPosts(merged);
      setPosts(merged);

      // Get all recent posts (mix BizPulse and BizHub)
      const allBizPulsePosts = (allWallFeeds?.data?.wallFeeds || []).map((wf: any) => ({
        ...transformWallFeedPostToMock(wf),
        postSource: "bizpulse",
        createdAtTimestamp: new Date(wf.createdAt).getTime()
      }));

      const allBizHubPosts = bizhubPosts.map((p: any) => ({
        ...transformBizHubPostToMock(p),
        postSource: "bizhub",
        createdAtTimestamp: new Date(p.createdAt).getTime()
      }));

      // Mix and sort by most recent
      const mixedPosts = [...allBizPulsePosts, ...allBizHubPosts]
        .sort((a, b) => b.createdAtTimestamp - a.createdAtTimestamp)
        .slice(0, 8)
        .map(post => ({
          id: post.id,
          title: post.title,
          description: post.content?.substring(0, 100),
          author: post.author,
          timeAgo: post.timeAgo,
          postSource: post.postSource
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
    if (activeTab === "bizpulse") {
      setPosts(allPosts.filter((post) => post.postSource === "bizpulse"));
    } else if (activeTab === "bizhub") {
      setPosts(allPosts.filter((post) => post.postSource === "bizhub"));
    }
  }, [activeTab, allPosts]);

  return (
    <div className="relative min-h-screen ">
      {/* Main content */}
      <div
        className={`transition-all duration-300 no-scrollbar ${
          isDrawerOpen ? "xl:mr-80 lg:mr-20" : "mr-0"
        }`}
        style={{ height: "100vh", overflow: "auto" }}
      >
        <div className="md:max-w-[95%] lg:max-w-[70%] mx-auto md:p-6 space-y-4">
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 flex gap-2">
            <button
              onClick={() => setActiveTab("bizpulse")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-all ${
                activeTab === "bizpulse"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Activity className="w-5 h-5" />
              <span className="font-medium">BizPulse</span>
            </button>
            <button
              onClick={() => setActiveTab("bizhub")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-all ${
                activeTab === "bizhub"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Network className="w-5 h-5" />
              <span className="font-medium">BizHub</span>
            </button>
          </div>

          <InfiniteScroll
            dataLength={posts.length}
            next={() => {}}
            hasMore={hasMore}
            loader={
              <div className="text-center py-8 flex justify-center items-center">
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
              const isPoll = post.category === "pulse-polls" || (post.poll && post.postType === "poll");
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
                  <div key={post.id}>
                    <PollCard
                      post={wallFeedPost}
                      currentUserId={currentUserId}
                      onVoteSuccess={(updated) => {
                        const updatedMock = {
                          ...transformWallFeedPostToMock(updated as any),
                          postSource: "bizpulse"
                        };
                        setAllPosts((prev) =>
                          prev.map((p) => (p.id === updatedMock.id ? updatedMock : p))
                        );
                        setPosts((prev) =>
                          prev.map((p) => (p.id === updatedMock.id ? updatedMock : p))
                        );
                      }}
                    />
                  </div>
                );
              }
              return (
                <div key={post.id}>
                  <PostCard {...post} sourceType={post.postSource} />
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
