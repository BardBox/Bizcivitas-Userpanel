"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import TabNavigation from "@/components/Dashboard/TabNavigation";
import SearchBar from "@/components/Dashboard/SearchBar";
import BizHubPostCard from "@/components/Dashboard/Bizhub/BizHubPostCard";
import Link from "next/link";
import { bizhubApi } from "@/services/bizhubApi";
import { transformBizHubPostToMock } from "@/utils/bizhubTransformers";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../store/store";

export default function BizHubPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string>("all");
  // BizHub has no polls; no userId needed here

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const raw = await bizhubApi.fetchPosts();
      const transformed = raw.map((p: any) => transformBizHubPostToMock(p));
      setPosts(transformed);
    } catch (e: any) {
      setError(e.message || "Failed to load BizHub posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const filtered = useMemo(() => {
    if (activeType === "all") return posts;
    return posts.filter((p) => (p.rawType || p.type || "").toLowerCase() === activeType);
  }, [posts, activeType]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Biz Hub</h1>
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
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { key: "all", label: "All" },
              { key: "general-chatter", label: "General Chatter" },
              { key: "referral-exchange", label: "Referral Exchanges" },
              { key: "business-deep-dive", label: "Business Deep Dive" },
              { key: "travel-talks", label: "Travel Talks" },
              { key: "biz-learnings", label: "Biz Learnings" },
              { key: "collab-corner", label: "Collab Corner" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveType(key)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  activeType === key
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
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
            {!loading && !error && filtered.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No posts found.</p>
              </div>
            )}
            {!loading &&
              !error &&
              filtered.map((post) => (
                  <Link
                    href={`/feeds/biz-hub/${post.id}`}
                    className="block"
                    key={post.id}
                  >
                    <BizHubPostCard
                      avatarUrl={post.author?.avatar || "/avatars/default.jpg"}
                      name={post.author?.name}
                      profession={post.author?.title}
                      imageUrl={post.image}
                      content={post.content}
                      category={post.category}
                      timeAgo={post.timeAgo}
                      comments={post.stats?.comments}
                      likes={post.stats?.likes}
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
