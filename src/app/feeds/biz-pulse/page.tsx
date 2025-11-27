"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/store";
import TabNavigation from "@/components/Dashboard/TabNavigation";
import SearchBar from "@/components/Dashboard/SearchBar";
import PostsGrid from "@/components/Dashboard/PostsGrid";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import NotificationPromptBanner from "@/components/Dashboard/NotificationPromptBanner";
import {
  useGetWallFeedsQuery,
  useLikePostMutation,
} from "../../../../store/api/bizpulseApi";
import { transformBizPulsePostsToMock } from "@/utils/bizpulseTransformers";
import { BizPulseCategory } from "@/types/bizpulse.types";
import toast from "react-hot-toast";

export default function BizPulsePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const user = useSelector((state: RootState) => state.auth.user);
  const currentUserId = user?._id || user?.id || "";

  // State
  const [activeCategory, setActiveCategory] = useState<BizPulseCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const showNotificationBanner = false; // temporarily hide the notifications banner

  // Handle URL category parameter - only on initial load
  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    if (categoryFromUrl) {
      setActiveCategory(categoryFromUrl as BizPulseCategory);
    }
  }, [searchParams]);

  // Fetch posts using RTK Query
  // We pass type (category) and search to the query
  const {
    data: wallFeeds,
    isLoading,
    error,
    refetch,
  } = useGetWallFeedsQuery({
    type: activeCategory !== "all" ? activeCategory : undefined,
    search: searchQuery || undefined,
  });

  const [likePost] = useLikePostMutation();

  // Transform posts for display
  const posts = useMemo(() => {
    if (!wallFeeds) return [];
    return transformBizPulsePostsToMock(wallFeeds);
  }, [wallFeeds]);

  const handleTabChange = (category: BizPulseCategory) => {
    setActiveCategory(category);
    // Clear URL params when manually switching tabs
    window.history.replaceState(null, "", pathname);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleLike = async (postId: string) => {
    try {
      await likePost(postId).unwrap();
      // Optimistic update is handled by RTK Query
    } catch (err: any) {
      console.error("Failed to like post:", err);
      toast.error("Failed to like post");
    }
  };

  const handleRetry = () => {
    refetch();
  };

  // Show full page loading only on initial load when no posts exist
  if (isLoading && !posts.length) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Biz Pulse</h1>
        </div>
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" text="Loading posts..." />
        </div>
      </div>
    );
  }

  if (error && !posts.length) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Biz Pulse</h1>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-2">Error loading posts</div>
            <p className="text-gray-600">{(error as any)?.message || "Unknown error"}</p>
            <button
              onClick={handleRetry}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 md:rounded-3xl space-y-6 md:mt-12 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Biz Pulse</h1>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-5 5v-5z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 19h16"
              />
            </svg>
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Notification Prompt Banner (disabled) */}
      {showNotificationBanner && <NotificationPromptBanner />}

      {/* Search Bar */}
      <SearchBar searchQuery={searchQuery} onSearchChange={handleSearchChange} />

      {/* Tab Navigation and Content */}
      <div className="bg-white rounded-lg shadow overflow-visible">
        <TabNavigation
          activeCategory={activeCategory}
          onTabChange={handleTabChange}
          loading={isLoading}
        />
        <div className="p-2 md:p-6 overflow-hidden">
          {error && posts.length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-600 text-sm mb-2">
                Error loading posts
              </div>
              <p className="text-red-500 text-xs">{(error as any)?.message || "Unknown error"}</p>
              <button
                onClick={handleRetry}
                className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}
          <PostsGrid
            posts={posts}
            loading={isLoading}
            currentUserId={currentUserId}
            onLike={handleLike}
          />
        </div>
      </div>

      {/* Description */}
      <div className="text-center text-sm text-gray-500">
        Stay plugged in with curated spotlights, polls and updates by
        BizCivitas.
      </div>
    </div>
  );
}
