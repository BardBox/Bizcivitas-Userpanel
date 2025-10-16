"use client";

/**
 * Biz Pulse Page - FRONTEND PERFORMANCE OPTIMIZATIONS
 *
 * ✅ Optimized useEffect dependencies to prevent unnecessary re-fetches
 * ✅ Memoized retry handlers to prevent re-renders
 * ✅ Extracted conditional renders for better performance
 */

import { useEffect, useCallback, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../../store";
import { fetchPosts } from "../../../../store/postsSlice";
import TabNavigation from "@/components/Dashboard/TabNavigation";
import SearchBar from "@/components/Dashboard/SearchBar";
import PostsGrid from "@/components/Dashboard/PostsGrid";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function BizPulsePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { activeCategory, searchQuery, loading, error, posts } = useSelector(
    (state: RootState) => state.posts
  );

  // ✅ PERFORMANCE FIX: Memoize fetch function to prevent unnecessary effect triggers
  const handleFetchPosts = useCallback(() => {
    dispatch(
      fetchPosts({
        category: activeCategory,
        search: searchQuery || undefined,
      })
    );
  }, [dispatch, activeCategory, searchQuery]);

  // ✅ PERFORMANCE FIX: Memoized retry handler - prevents creating new function on every render
  // IMPORTANT: Must be declared BEFORE any conditional returns (React Rules of Hooks)
  const handleRetry = useCallback(() => {
    handleFetchPosts();
  }, [handleFetchPosts]);

  useEffect(() => {
    // Fetch posts when component mounts or filters change
    handleFetchPosts();
  }, [handleFetchPosts]);

  // Show full page loading only on initial load when no posts exist
  if (loading && posts.length === 0) {
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

  if (error && posts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Biz Pulse</h1>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-2">Error loading posts</div>
            <p className="text-gray-600">{error}</p>
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
    <div className="space-y-6">
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

      {/* Search Bar */}
      <SearchBar />

      {/* Tab Navigation and Content */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <TabNavigation />
        <div className="p-2 md:p-6">
          {error && posts.length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-600 text-sm mb-2">
                Error loading posts
              </div>
              <p className="text-red-500 text-xs">{error}</p>
              <button
                onClick={handleRetry}
                className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}
          <PostsGrid />
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
