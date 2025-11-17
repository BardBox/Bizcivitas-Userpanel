"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import BizHubTabNavigation from "@/components/Dashboard/BizHubTabNavigation";
import BizHubPostCard from "@/components/Dashboard/Bizhub/BizHubPostCard";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../../store/store";
import {
  fetchBizHubPosts,
  setSearchQuery,
  likeBizHubPost,
  setActiveCategory,
  type BizHubCategory,
} from "../../../../store/bizhubSlice";

const categoryDescriptions: Record<BizHubCategory, string> = {
  all: "Create, connect, and grow — your forum for business conversations.",
  "general-chatter": "Casual conversation, introductions, wins.",
  "referral-exchange":
    "Post who you're looking to meet / what referrals you can offer.",
  "business-deep-dive":
    "Share your challenges, get feedback, discuss case studies.",
  "travel-talks":
    "Best business destinations, co-working reviews, travel hacks.",
  "biz-learnings": "Book recommendations, podcasts, webinars, courses.",
  "collab-corner": "Post your current offers, needs, JV opportunities.",
};

export default function BizHubPage() {
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();
  const { filteredPosts, activeCategory, searchQuery, loading, error } =
    useSelector((state: RootState) => state.bizhub);
  const userId = useSelector((state: RootState) => state.auth.user?._id);

  // Handle URL type parameter - only on initial load
  useEffect(() => {
    const typeFromUrl = searchParams.get('type');
    if (typeFromUrl) {
      dispatch(setActiveCategory(typeFromUrl as BizHubCategory));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, dispatch]);

  useEffect(() => {
    dispatch(fetchBizHubPosts());
  }, [dispatch]);

  const handleSearchChange = (query: string) => {
    dispatch(setSearchQuery(query));
  };

  const handleLike = async (postId: string) => {
    dispatch(likeBizHubPost(postId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Biz Hub</h1>
        <div className="flex items-center gap-2">
          <Link href="/feeds/biz-hub/create">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Post
            </button>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tab Navigation and Content */}
      <div className="bg-white rounded-lg shadow overflow-visible">
        <BizHubTabNavigation />
        <div className="p-2 md:p-6 overflow-hidden">
          {/* Category Description */}
          <p className="text-sm text-gray-500 mb-4">
            {categoryDescriptions[activeCategory]}
          </p>

          {/* Posts Grid - Two Column Layout */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading posts...</p>
            </div>
          )}
          {error && (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
            </div>
          )}
          {!loading && !error && filteredPosts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No posts found.</p>
              <p className="text-sm text-gray-400 mt-2">
                Try changing your filters or search query.
              </p>
            </div>
          )}
          {!loading && !error && filteredPosts.length > 0 && (
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              {filteredPosts.map((post) => (
                <BizHubPostCard
                  key={post._id}
                  post={post}
                  onLike={handleLike}
                  userId={userId}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="text-center text-sm text-gray-500">
        Create, connect, and grow — your forum for business conversations.
      </div>
    </div>
  );
}
