"use client";

import { useState } from "react";
import { ArrowLeft, Play, Video, Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useGetRecordingsQuery,
  type MediaItem,
} from "../../../../../store/api/knowledgeHubApi";

export default function RecordingsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: recordings = [], isLoading } = useGetRecordingsQuery();

  // Filter recordings based on search
  const filteredRecordings = recordings.filter((recording) =>
    recording.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleVideoClick = (media: MediaItem) => {
    router.push(
      `/feeds/knowledge-hub/video/${media._id}?` +
        new URLSearchParams({
          videoUrl:
            media.embedLink ||
            `https://player.vimeo.com/video/${media.vimeoId}`,
          title: media.title,
          description: media.description || "",
          headerTitle: "Recording",
          gradientColor: "#8696C8",
        }).toString()
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white hover:text-white/90 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Knowledge Hub</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Video className="w-8 h-8 text-white" />
            <h1 className="text-3xl font-bold text-white">
                Conclave & Masterclass Recordings
            </h1>
          </div>
          <p className="text-white/90">
            {recordings.length} recording{recordings.length !== 1 ? "s" : ""}{" "}
            available
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search recordings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading recordings...</p>
            </div>
          </div>
        ) : filteredRecordings.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? "No recordings found" : "No recordings available"}
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Check back later for new content"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRecordings.map((recording) => (
              <div
                key={recording._id}
                onClick={() => handleVideoClick(recording)}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg transition-all cursor-pointer group"
              >
                {/* Thumbnail */}
                <div className="relative h-48 bg-gradient-to-br from-purple-500 to-indigo-600">
                  {recording.thumbnailUrl ? (
                    <img
                      src={recording.thumbnailUrl}
                      alt={recording.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <Video className="w-20 h-20 text-white/70" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                      <Play className="w-7 h-7 text-purple-600 ml-1" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                    {recording.title}
                  </h3>
                  {recording.description && (
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {recording.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
