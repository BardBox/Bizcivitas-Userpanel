"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, MessageSquare, Activity, Network } from "lucide-react";
import Link from "next/link";

interface PostCardProps {
  title: string;
  content: string;
  id: string;
  category?: string;
  author?: {
    name: string;
    title: string;
    avatar?: string | null;
  };
  image?: string;
  stats?: {
    likes: number;
    comments: number;
    shares: number;
  };
  timeAgo?: string;
  sourceType?: string; // 'bizhub' or 'bizpulse'
}

export default function PostCard({
  title,
  content,
  id,
  category,
  author,
  image,
  stats = { likes: 0, comments: 0, shares: 0 },
  timeAgo,
  sourceType,
}: PostCardProps) {
  const [avatarError, setAvatarError] = useState(false);

  // Determine if this is a BizPulse post based on sourceType or category
  const isBizPulse = sourceType === "bizpulse" || (sourceType !== "bizhub" && !!category);
  const detailUrl = isBizPulse ? `/feeds/biz-pulse/${id}` : `/feeds/biz-hub/${id}`;

  const getCategoryLabel = (cat?: string) => {
    if (!cat) return "";
    return cat
      .replace("-", " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getCategoryColor = (cat?: string) => {
    const colors: Record<string, string> = {
      "travel-stories": "bg-blue-100 text-blue-800",
      "light-pulse": "bg-yellow-100 text-yellow-800",
      "spotlight-stories": "bg-purple-100 text-purple-800",
      "pulse-polls": "bg-green-100 text-green-800",
      "business-boosters": "bg-indigo-100 text-indigo-800",
      "founders-desk": "bg-pink-100 text-pink-800",
    };
    return colors[cat || ""] || "bg-gray-100 text-gray-800";
  };

  return (
    <Link href={detailUrl} className="block">
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-6 hover:shadow-md transition-shadow cursor-pointer relative">
        <div className="p-4 sm:p-5">
          {/* Header: Author + time + Icon */}
          {author && (
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {/* Display user avatar or fallback to favicon */}
                <div className="relative w-8 h-8 flex-shrink-0">
                  <Image
                    src={avatarError || !author.avatar ? "/favicon.ico" : author.avatar}
                    alt={author.name}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                </div>
                <div className="ml-1 flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 leading-tight truncate">
                    {author.name}
                  </div>
                  {author.title && (
                    <div className="text-[11px] text-gray-500 leading-tight truncate">
                      {author.title}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                {timeAgo && <span className="text-[11px] text-gray-500 whitespace-nowrap">{timeAgo}</span>}
                {/* Floating Source Type Badge */}
                {sourceType && (
                  <div className={`flex items-center justify-center w-9 h-9 rounded-full shadow-md ${
                    sourceType === "bizpulse"
                      ? "bg-blue-500"
                      : "bg-purple-500"
                  }`}>
                    {sourceType === "bizpulse" ? (
                      <Activity className="w-4 h-4 text-white" />
                    ) : (
                      <Network className="w-4 h-4 text-white" />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Category */}
          {category && (
            <div className="mb-3">
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${getCategoryColor(
                  category
                )}`}
              >
                {getCategoryLabel(category)}
              </span>
            </div>
          )}
        </div>

        {/* Image */}
        {image && (
          <div className="w-full h-48 sm:h-64 relative overflow-hidden bg-gray-200">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        <div className="p-4 sm:p-5 pt-4">
          {/* Title */}
          <h4 className="text-[15px] sm:text-base font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
            {title}
          </h4>

          {/* Stats */}
          <div className="flex items-center text-xs text-gray-500 space-x-4 pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-1">
              <Heart size={14} className="text-gray-400" />
              <span>{stats.likes || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageSquare size={14} className="text-gray-400" />
              <span>{stats.comments || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
