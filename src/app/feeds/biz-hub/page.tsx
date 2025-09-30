"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import TabNavigation from "@/components/Dashboard/TabNavigation";
import SearchBar from "@/components/Dashboard/SearchBar";
import BizHubPostCard from "@/components/Dashboard/Bizhub/BizHubPostCard";
import Link from "next/link";
import { RootState } from "../../../../store";
import { filterPosts } from "../../../../store/postsSlice";

export default function BizHubPage() {
  const dispatch = useDispatch();
  const { filteredPosts, loading, error } = useSelector(
    (state: RootState) => state.posts
  );

  useEffect(() => {
    // Initialize filtered posts on component mount
    dispatch(filterPosts());
  }, [dispatch]);

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
          <div className="space-y-4">
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
              </div>
            )}
            {!loading &&
              !error &&
              filteredPosts.map((post) => (
                <Link
                  href={`/feeds/biz-hub/${post.id}`}
                  className="block"
                  key={post.id}
                >
                  <BizHubPostCard
                    avatarUrl={post.author.avatar || "/avatars/default.jpg"}
                    name={post.author.name}
                    profession={post.author.title}
                    content={post.content}
                    category={post.category}
                    timeAgo={post.timeAgo}
                    comments={post.stats.comments}
                    likes={post.stats.likes}
                  />
                </Link>
              ))}
          </div>
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
