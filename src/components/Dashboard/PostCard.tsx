"use client";

import Image from "next/image";
import { getAbsoluteImageUrl } from "@/utils/imageUtils";
import { Heart, MessageSquare } from "lucide-react";
import Link from "next/link";

interface PostCardProps {
  title: string;
  content: string;
  id: string;
  category?: string;
  author?: {
    name: string;
    title: string;
    avatar?: string;
  };
  image?: string;
  stats?: {
    likes: number;
    comments: number;
    shares: number;
  };
  timeAgo?: string;
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
}: PostCardProps) {
  // Determine if this is a BizPulse post (has category) vs BizHub post
  const isBizPulse = !!category;
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
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="p-4 sm:p-5">
          {/* Header: Author + time */}
          {author && (
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                {author.avatar ? (
                  <Image
                    src={getAbsoluteImageUrl(author.avatar)}
                    alt={author.name}
                    width={28}
                    height={28}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-200" />
                )}
                <div className="ml-2">
                  <div className="text-sm font-medium text-gray-900 leading-4">{author.name}</div>
                  {author.title && (
                    <div className="text-[11px] text-gray-500 leading-4">{author.title}</div>
                  )}
                </div>
              </div>
              {timeAgo && <span className="text-[11px] text-gray-500">{timeAgo}</span>}
            </div>
          )}
          {/* Category */}
          {category && (
            <div className="mb-3">
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${getCategoryColor(category)}`}
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
