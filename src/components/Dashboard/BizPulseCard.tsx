"use client";

import { useState } from "react";
import Link from "next/link";
import { ThumbsUp, MessageSquare } from "lucide-react";
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
              {/* Display user avatar with proper circular shape */}
              <div className="flex-shrink-0">
                <Avatar
                  src={author.avatar || undefined}
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
        <div className="p-3 flex-1 flex flex-col">
          {/* Category Badge */}
          <div className="mb-2">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                category
              )}`}
            >
              {category
                .replace("-", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </span>
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
