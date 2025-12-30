"use client";

import { useState } from "react";
import Link from "next/link";
import { ThumbsUp, MessageSquare, Play } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Image from "next/image";
import { VimeoVideo } from "../../../types/bizpulse.types";

interface BizPulseCardProps {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    title: string;
    avatar?: string | null;
  };
  image?: string;
  videos?: VimeoVideo[];
  stats: {
    likes: number;
    comments: number;
    shares: number;
    views?: number;
  };
  timeAgo: string;
  category: string;
  tags?: string[];
  featured?: boolean;
  onLike?: (postId: string) => void;
  isLiked?: boolean;
}

export default function BizPulseCard({
  id,
  title,
  content,
  author,
  image,
  videos,
  stats,
  timeAgo,
  category,
  tags = [],
  featured = false,
  onLike,
  isLiked: initialIsLiked = false,
}: BizPulseCardProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);

  const getCategoryColor = (category: string) => {
    const colors = {
      "founders-desk": "bg-purple-100 text-purple-800",
      "business-boosters": "bg-blue-100 text-blue-800",
      "pulse-polls": "bg-green-100 text-green-800",
      "spotlight-stories": "bg-yellow-100 text-yellow-800",
      "light-pulse": "bg-pink-100 text-pink-800",
      "travel-stories": "bg-indigo-100 text-indigo-800",
      all: "bg-gray-100 text-gray-800",
    };
    return colors[category as keyof typeof colors] || colors.all;
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    onLike?.(id);
  };

  const handleCategoryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to BizPulse page with category parameter
    window.location.href = `/feeds/biz-pulse?category=${category}`;
  };

  return (
    <Link href={`/feeds/biz-pulse/${id}`} className="block h-full">
      <div
        className={`bg-white rounded-lg shadow-sm border border-gray-300 hover:shadow-lg hover:border-blue-500 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden h-full flex flex-col ${
          featured ? "ring-2 ring-blue-500/20" : ""
        }`}
      >
        {/* Header: Avatar + Admin Name + Time */}
        <div className="p-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* Display favicon for all BizPulse posts */}
              <div className="flex-shrink-0">
                <Avatar
                  src="/favicon.ico"
                  alt={author.name}
                  size="sm"
                  fallbackText={author.name}
                  showMembershipBorder={false}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-900 leading-tight truncate">
                  {author.name}
                </div>
                <div className="text-xs text-gray-500 leading-tight">
                  {timeAgo}
                </div>
              </div>
            </div>
            {/* Featured Badge */}
            {featured && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 flex-shrink-0">
                Featured
              </span>
            )}
          </div>
        </div>

        {/* Video or Image with maintained aspect ratio */}
        {videos && videos.length > 0 ? (
          // Show video thumbnail with play button
          <div className="w-full aspect-video relative overflow-hidden bg-gray-100 group">
            <Image
              src={videos[0].thumbnailUrl || "/images/default-video-thumb.jpg"}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized
            />
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
              <div className="bg-white/90 rounded-full p-4 group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-gray-900 fill-current" />
              </div>
            </div>
          </div>
        ) : image ? (
          // Show regular image if no video
          <div className="w-full aspect-video relative overflow-hidden bg-gray-100">
            <Image
              src={image}
              alt={title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={(e) => {
                console.error('[BizPulse Image Error] Failed to load:', image);
                // Hide the entire image container on error
                const container = (e.target as HTMLElement).closest('.aspect-video');
                if (container) {
                  (container as HTMLElement).style.display = 'none';
                }
              }}
              unoptimized
            />
          </div>
        ) : null}

        {/* Content Section */}
        <div className="p-3 flex-1 flex flex-col">
          {/* Category Badge - Clickable */}
          <div className="mb-2">
            <button
              onClick={handleCategoryClick}
              className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all hover:scale-105 hover:shadow-md ${getCategoryColor(
                category
              )}`}
            >
              {category
                .replace(/-/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </button>
          </div>

          {/* Title */}
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 line-clamp-2 leading-snug">
            {title}
          </h3>

          {/* Stats and Like Button */}
          <div className="flex items-center justify-between pt-2 mt-auto border-t border-gray-100">
            <div className="flex items-center text-xs text-gray-600 space-x-3">
              {/* Like Button with Count */}
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 transition-colors ${
                  isLiked
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                <ThumbsUp
                  size={16}
                  className={isLiked ? "fill-current" : ""}
                />
                <span className="font-medium">{stats.likes || 0}</span>
              </button>

              {/* Comments */}
              <div className="flex items-center space-x-1">
                <MessageSquare size={14} className="text-gray-400" />
                <span className="font-medium">{stats.comments || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
