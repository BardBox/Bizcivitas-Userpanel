"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MessageSquare, Share2, Eye, Calendar } from "lucide-react";
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

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Handle share logic
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-200 overflow-hidden group ${
        featured
          ? "ring-2 ring-blue-500/20 bg-gradient-to-br from-blue-50/50 to-indigo-50/50"
          : ""
      }`}
    >
      {/* Image Section */}
      {image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-1/2 h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute top-3 left-3">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                category
              )}`}
            >
              {category
                .replace("-", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </span>
          </div>
          {featured && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                Featured
              </span>
            </div>
          )}
        </div>
      )}

      {/* Content Section */}
      <div className="p-6">
        {/* Category Badge (if no image) */}
        {!image && (
          <div className="flex items-center justify-between mb-3">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                category
              )}`}
            >
              {category
                .replace("-", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </span>
            {featured && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                Featured
              </span>
            )}
          </div>
        )}

        {/* Title - Clickable */}
        <Link href={`/feeds/biz-pulse/${id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer group-hover:text-blue-600">
            {title}
          </h3>
        </Link>

        {/* Content Preview */}
        <div
          className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md hover:bg-gray-200 transition-colors"
              >
                #{tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-gray-400">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Author Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar
              src={author.avatar}
              alt={author.name}
              size="sm"
              fallbackText={author.name}
              showMembershipBorder={false}
            />
            <div>
              <p className="text-sm font-medium text-gray-900">{author.name}</p>
              <p className="text-xs text-gray-500">{author.title}</p>
            </div>
          </div>
          <div className="flex items-center text-xs text-gray-400 space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{timeAgo}</span>
          </div>
        </div>

        {/* Stats and Actions */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            {/* Stats */}
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              {stats.views && stats.views > 0 && (
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{stats.views}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Heart className="w-3 h-3" />
                {stats.likes > 0 && <span>{stats.likes}</span>}
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="w-3 h-3" />
                {stats.comments > 0 && <span>{stats.comments}</span>}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleLike}
                className={`p-1.5 rounded-md transition-colors ${
                  isLiked
                    ? "text-red-500 bg-red-50 hover:bg-red-100"
                    : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                }`}
              >
                <Heart
                  className="w-4 h-4"
                  fill={isLiked ? "currentColor" : "none"}
                />
              </button>
              <button
                onClick={handleShare}
                className="p-1.5 rounded-md text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <Link href={`/feeds/biz-pulse/${id}`}>
                <button className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors">
                  Read More
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
