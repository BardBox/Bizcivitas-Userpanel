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
        {/* Header: Avatar + Admin Name + Time */}
        {author && (
          <div className="p-4 sm:p-5 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                {/* Display user avatar or fallback to favicon for admin */}
                <div className="relative w-10 h-10 flex-shrink-0">
                  <Image
                    src={avatarError || !author.avatar ? "/favicon.ico" : author.avatar}
                    alt={author.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover bg-gray-100"
                    onError={() => setAvatarError(true)}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 leading-tight truncate">
                    {author.name}
                  </div>
                  {timeAgo && (
                    <div className="text-xs text-gray-500 leading-tight mt-0.5">
                      {timeAgo}
                    </div>
                  )}
                </div>
              </div>
              {/* Floating Source Type Badge */}
              {sourceType && (
                <div className={`flex items-center justify-center w-9 h-9 rounded-full shadow-md flex-shrink-0 ${
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

        {/* Image with maintained aspect ratio */}
        {image && (
          <div className="w-full aspect-video relative overflow-hidden bg-gray-100">
            <Image
              src={image}
              alt={title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        <div className="p-4 sm:p-5">
          {/* Category Badge */}
          {category && (
            <div className="mb-3">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                  category
                )}`}
              >
                {getCategoryLabel(category)}
              </span>
            </div>
          )}

          {/* Title */}
          <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 line-clamp-2 leading-snug">
            {title}
          </h4>

          {/* Stats */}
          <div className="flex items-center text-sm text-gray-600 space-x-4 pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-1.5">
              <Heart size={16} className="text-gray-400" />
              <span className="font-medium">{stats.likes || 0}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <MessageSquare size={16} className="text-gray-400" />
              <span className="font-medium">{stats.comments || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
