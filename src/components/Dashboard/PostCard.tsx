"use client";

import { useState } from "react";
import Image from "next/image";
import { ThumbsUp, MessageSquare, Activity, Network } from "lucide-react";
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
  onLike?: (postId: string) => void;
  isLiked?: boolean;
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
  onLike,
  isLiked: initialIsLiked = false,
}: PostCardProps) {
  const [avatarError, setAvatarError] = useState(false);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(stats.likes || 0);

  // Update local state when props change
  useState(() => {
    setIsLiked(initialIsLiked);
    setLikeCount(stats.likes || 0);
  });

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

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic update
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);

    onLike?.(id);
  };

  return (
    <div className="group relative bg-white rounded-lg shadow-sm border-2 border-gray-100 overflow-hidden mb-6 cursor-pointer transition-all duration-300 ease-out hover:shadow-2xl hover:scale-[1.01] hover:-translate-y-1 hover:border-transparent">
      {/* Animated gradient border on hover using brand colors */}
      <div
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
        style={{
          padding: '2px',
          background: 'linear-gradient(135deg, var(--color-brand-orange), var(--color-brand-blue), var(--color-brand-green-dark))'
        }}
      >
        <div className="absolute inset-[2px] bg-white rounded-lg"></div>
      </div>

      {/* Glow effect on hover using brand colors */}
      <div
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 -z-20"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 157, 0, 0.2), rgba(51, 89, 255, 0.2), rgba(29, 178, 18, 0.2))'
        }}
      ></div>

      {/* Header: Avatar + Admin Name + Time */}
      {author && (
        <div className="p-4 sm:p-5 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              {/* Display user avatar or fallback to favicon for admin */}
              <div className="relative w-10 h-10 flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300">
                <Image
                  src={avatarError || !author.avatar ? "/favicon.ico" : author.avatar}
                  alt={author.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover bg-gray-100 group-hover:shadow-lg transition-shadow duration-300"
                  onError={() => setAvatarError(true)}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 leading-tight truncate transition-colors duration-300" style={{ color: 'inherit' }}>
                  {author.name}
                </div>
                {timeAgo && (
                  <div className="text-xs text-gray-500 leading-tight mt-0.5 group-hover:text-gray-700 transition-colors duration-300">
                    {timeAgo}
                  </div>
                )}
              </div>
            </div>
            {/* Floating Source Type Badge */}
            {sourceType && (
              <div className={`flex items-center justify-center w-9 h-9 rounded-full shadow-md flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${
                sourceType === "bizpulse"
                  ? "bg-blue-500"
                  : "bg-purple-500"
              }`}>
                {sourceType === "bizpulse" ? (
                  <Activity className="w-4 h-4 text-white group-hover:animate-pulse" />
                ) : (
                  <Network className="w-4 h-4 text-white group-hover:animate-pulse" />
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image with maintained aspect ratio - Clickable */}
      {image && (
        <Link href={detailUrl}>
          <div className="w-full aspect-video relative overflow-hidden bg-gray-100 cursor-pointer">
            <Image
              src={image}
              alt={title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </Link>
      )}

      <div className="p-4 sm:p-5">
        {/* Category/Type Tag */}
        {tagValue && (
          <div className="mb-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 group-hover:scale-105 group-hover:shadow-md ${getCategoryColor(
                tagValue,
                sourceType
              )}`}
            >
              {getCategoryLabel(tagValue)}
            </span>
          </div>
        )}

        {/* Title - Clickable */}
        <Link href={detailUrl}>
          <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 line-clamp-2 leading-snug cursor-pointer transition-colors duration-300" style={{ color: 'inherit' }}>
            {title}
          </h4>
        </Link>

        {/* Stats and Like Button */}
        <div className="flex items-center text-sm text-gray-600 space-x-4 pt-3 border-t border-gray-100 transition-colors duration-300 group-hover:border-gray-300">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1.5 transition-all duration-300 ${
              isLiked
                ? "text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            } group-hover:scale-110`}
          >
            <ThumbsUp
              size={16}
              className={`transition-transform duration-300 ${isLiked ? "fill-current" : ""} group-hover:rotate-12`}
            />
            <span className="font-medium">{likeCount}</span>
          </button>
          {/* Comments */}
          <div className="flex items-center space-x-1.5 transition-all duration-300 group-hover:scale-110 group-hover:text-gray-800">
            <MessageSquare size={16} className="text-gray-400 transition-colors duration-300 group-hover:text-gray-600" />
            <span className="font-medium">{stats.comments || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
