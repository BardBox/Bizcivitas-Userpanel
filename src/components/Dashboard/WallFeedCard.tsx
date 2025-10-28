"use client";

import { useState } from "react";
import Link from "next/link";
import { ThumbsUp, MessageSquare, Calendar, ExternalLink } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Image from "next/image";
import { WallFeedPost } from "@/types/bizpulse.types";

interface WallFeedCardProps {
  post: WallFeedPost;
  onLike?: (postId: string) => void;
}

export default function WallFeedCard({ post, onLike }: WallFeedCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);

  const getAuthorName = () => {
    if (post.userId?.fname)
      return `${post.userId.fname} ${post.userId.lname || ""}`.trim();
    return "BizCivitas Member";
  };

  const getAuthorCompany = () => {
    return post.userId?.classification || "BizCivitas Member";
  };

  // ✅ FIXED FUNCTION (was missing)
  const getCategoryLabel = (type: string) => {
    const labels: Record<string, string> = {
      foundersDesk: "Founders Desk",
      businessBoosters: "Business Boosters",
      pulsePolls: "Pulse Polls",
      article: "Spotlight Stories",
      lightPulse: "Light Pulse",
      travelStories: "Travel Stories",
      trip: "Trip",
      upcomingEvent: "Upcoming Event",
      announcement: "Announcement",
      poll: "Poll",
    };
    return labels[type] || type;
  };

  const getCategoryColor = (type: string) => {
    const colors: Record<string, string> = {
      foundersDesk: "bg-purple-100 text-purple-800",
      businessBoosters: "bg-blue-100 text-blue-800",
      pulsePolls: "bg-green-100 text-green-800",
      article: "bg-yellow-100 text-yellow-800",
      lightPulse: "bg-pink-100 text-pink-800",
      travelStories: "bg-indigo-100 text-indigo-800",
      trip: "bg-cyan-100 text-cyan-800",
      upcomingEvent: "bg-orange-100 text-orange-800",
      announcement: "bg-red-100 text-red-800",
      poll: "bg-emerald-100 text-emerald-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    onLike?.(post._id);
  };

  const getDescription = () => {
    if (Array.isArray(post.description)) {
      return post.description.join(" ");
    }
    return post.description || "";
  };

  const getImage = () => {
    if (post.images && post.images.length > 0) {
      return `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/${post.images[0]}`;
    }
    if (post.article?.image) {
      return `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/${post.article.image}`;
    }
    return null;
  };

  const image = getImage();
  const description = getDescription();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image Section */}
      {image && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={image}
            alt={post.title || "Post image"}
            width={800}
            height={400}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          {post.badge && (
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-900 shadow-sm">
                {post.badge}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Content Section */}
      <div className="p-5">
        {/* Header - Author Info */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3 flex-1">
            <Avatar
              src={post.userId?.avatar}
              alt={getAuthorName()}
              size="sm"
              fallbackText={getAuthorName()}
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 text-sm truncate">
                {getAuthorName()}
              </h4>
              <p className="text-xs text-gray-600 truncate">
                {getAuthorCompany()}
              </p>
            </div>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getCategoryColor(
              post.type
            )}`}
          >
            {getCategoryLabel(post.type)}
          </span>
        </div>

        {/* Title */}
        {post.title && (
          <Link href={`/feeds/biz-pulse/${post._id}`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">
              {post.title}
            </h3>
          </Link>
        )}

        {/* Description */}
        {description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-3 leading-relaxed">
            {description}
          </p>
        )}

        {/* Conditional Sections */}
        {post.type === "article" && post.article && (
          <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-xs text-yellow-800 font-medium flex items-center gap-1">
              <ExternalLink className="w-3 h-3" />
              Article: {post.article.title}
            </p>
          </div>
        )}

        {post.type === "announcement" && post.announcement && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-xs text-red-800 font-medium">
              Announcement: {post.announcement.title}
            </p>
          </div>
        )}

        {(post.type === "trip" || post.type === "upcomingEvent") &&
          post.eventRef && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-800 font-medium">
                Event: {post.eventRef.title || post.eventRef.name}
              </p>
              {post.eventRef.eventDate && (
                <p className="text-xs text-blue-600 mt-1">
                  {new Date(post.eventRef.eventDate).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1.5 text-sm transition-colors ${
                isLiked
                  ? "text-blue-600 font-medium"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              <ThumbsUp
                className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`}
              />
              {(post.likeCount || 0) > 0 && <span>{post.likeCount}</span>}
            </button>

            <Link
              href={`/feeds/biz-pulse/${post._id}`}
              className="flex items-center space-x-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              {(post.commentCount || 0) > 0 && <span>{post.commentCount}</span>}
            </Link>
          </div>

          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>
              {post.timeAgo || new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
