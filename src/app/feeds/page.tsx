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

// removed unused dummy utilities

// --- Component ---
export default function DashboardPage() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Backend URL:", process.env.NEXT_PUBLIC_BACKEND_URL);
  }

  const [posts, setPosts] = useState<any[]>([]);
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
      const [dailyFeeds, bizhubPosts] = await Promise.all([
        bizpulseApi.fetchDailyFeeds(),
        bizpulseApi.fetchBizHubPosts(),
      ]);

      const transformedDaily = dailyFeeds.map((wf: any) =>
        transformWallFeedPostToMock(wf)
      );
      const transformedBizhubDaily = bizhubPosts
        .filter((p: any) => p.isDailyFeed === true)
        .map((p: any) => transformBizHubPostToMock(p));

      const merged = [...transformedDaily, ...transformedBizhubDaily];
      setPosts(merged);
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

  return (
    <div className="relative min-h-screen ">
      {/* Main content */}
      <div
        className={`transition-all duration-300 no-scrollbar ${
          isDrawerOpen ? "xl:mr-80 lg:mr-20" : "mr-0"
        }`}
        style={{ height: "100vh", overflow: "auto" }}
      >
        <div className="md:max-w-[95%] lg:max-w-[70%] mx-auto md:p-6 space-y-6">
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
                        const updatedMock = transformWallFeedPostToMock(updated as any);
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
                  <PostCard {...post} />
                </div>
              );
            })}
          </InfiniteScroll>
        </div>
      </div>

      {/* Right Floating Drawer */}
      <FloatingDrawer onToggle={setIsDrawerOpen} />
    </div>
  );
}
