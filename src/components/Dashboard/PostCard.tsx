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
  type?: string; // BizHub type
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
  type,
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

  // Get the tag to display (category for BizPulse, type for BizHub)
  const tagValue = isBizPulse ? category : type;

  const getCategoryLabel = (cat?: string) => {
    if (!cat) return "";
    return cat
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getCategoryColor = (cat?: string, source?: string) => {
    // BizHub colors (purple theme)
    const bizhubColors: Record<string, string> = {
      "general-chatter": "bg-purple-100 text-purple-800 border border-purple-200",
      "referral-exchanges": "bg-pink-100 text-pink-800 border border-pink-200",
      "business-deep-dive": "bg-indigo-100 text-indigo-800 border border-indigo-200",
      "travel-talks": "bg-cyan-100 text-cyan-800 border border-cyan-200",
      "biz-learnings": "bg-violet-100 text-violet-800 border border-violet-200",
      "collab-corner": "bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-200",
    };

    // BizPulse colors (blue theme)
    const bizpulseColors: Record<string, string> = {
      "travel-stories": "bg-blue-100 text-blue-800 border border-blue-200",
      "light-pulse": "bg-yellow-100 text-yellow-800 border border-yellow-200",
      "spotlight-stories": "bg-purple-100 text-purple-800 border border-purple-200",
      "pulse-polls": "bg-green-100 text-green-800 border border-green-200",
      "business-boosters": "bg-indigo-100 text-indigo-800 border border-indigo-200",
      "founders-desk": "bg-pink-100 text-pink-800 border border-pink-200",
      "article": "bg-orange-100 text-orange-800 border border-orange-200",
      "trip": "bg-teal-100 text-teal-800 border border-teal-200",
      "upcoming-event": "bg-red-100 text-red-800 border border-red-200",
      "announcement": "bg-amber-100 text-amber-800 border border-amber-200",
      "poll": "bg-emerald-100 text-emerald-800 border border-emerald-200",
    };

    const colors = source === "bizhub" ? bizhubColors : bizpulseColors;
    return colors[cat || ""] || "bg-gray-100 text-gray-800 border border-gray-200";
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
          {/* Category/Type Tag */}
          {tagValue && (
            <div className="mb-3">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(
                  tagValue,
                  sourceType
                )}`}
              >
                {getCategoryLabel(tagValue)}
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
