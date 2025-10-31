"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MessageSquare } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Image from "next/image";

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
  stats,
  timeAgo,
  category,
  tags = [],
  featured = false,
  onLike,
  isLiked: initialIsLiked = false,
}: BizPulseCardProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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

  return (
    <Link href={`/feeds/biz-pulse/${id}`} className="block">
      <div
        className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer overflow-hidden ${
          featured ? "ring-2 ring-blue-500/20" : ""
        }`}
      >
        {/* Header: Avatar + Admin Name + Time */}
        <div className="p-4 sm:p-5 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              {/* Display user avatar or fallback to favicon for admin */}
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src={author.avatar || "/favicon.ico"}
                  alt={author.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover bg-gray-100"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/favicon.ico";
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 leading-tight truncate">
                  {author.name}
                </div>
                <div className="text-xs text-gray-500 leading-tight mt-0.5">
                  {timeAgo}
                </div>
              </div>
            </div>
            {/* Featured Badge */}
            {featured && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 flex-shrink-0">
                Featured
              </span>
            )}
          </div>
        </div>

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

        {/* Content Section */}
        <div className="p-4 sm:p-5">
          {/* Category Badge */}
          <div className="mb-3">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                category
              )}`}
            >
              {category
                .replace("-", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 line-clamp-2 leading-snug">
            {title}
          </h3>

          {/* Stats and Like Button */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center text-sm text-gray-600 space-x-4">
              <div className="flex items-center space-x-1.5">
                <Heart size={16} className="text-gray-400" />
                <span className="font-medium">{stats.likes || 0}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <MessageSquare size={16} className="text-gray-400" />
                <span className="font-medium">{stats.comments || 0}</span>
              </div>
            </div>

            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`p-2 rounded-lg transition-colors ${
                isLiked
                  ? "text-red-500 bg-red-50 hover:bg-red-100"
                  : "text-gray-400 hover:text-red-500 hover:bg-red-50"
              }`}
            >
              <Heart
                className="w-5 h-5"
                fill={isLiked ? "currentColor" : "none"}
              />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
