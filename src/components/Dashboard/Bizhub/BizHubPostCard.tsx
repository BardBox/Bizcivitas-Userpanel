import React, { useState } from "react";
import Link from "next/link";
import { ThumbsUp, MessageSquare } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import type { BizHubPost } from "../../../../store/bizhubSlice";

interface BizHubPostCardProps {
  post: BizHubPost;
  onLike: (postId: string) => void;
  userId?: string;
}

// Format category for display
const formatCategory = (type: string): string => {
  return type
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const BizHubPostCard: React.FC<BizHubPostCardProps> = ({
  post,
  onLike,
  userId,
}) => {
  // Safe access to user data with fallbacks
  const userName = post.userId?.name || post.user?.name || "Unknown User";
  const userAvatar = post.userId?.avatar || post.user?.avatar || "";
  const userClassification = post.userId?.classification || post.user?.classification || "Member";

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onLike(post._id);
  };

  return (
    <Link href={`/feeds/biz-hub/${post._id}`} className="block h-full">
      <div className="bg-white rounded-lg shadow-sm border border-gray-300 hover:shadow-lg hover:border-blue-500 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden h-full flex flex-col">
        {/* Header: Avatar, Name, Time */}
        <div className="p-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex-shrink-0">
                <Avatar
                  src={userAvatar}
                  alt={userName}
                  size="sm"
                  fallbackText={userName}
                  showMembershipBorder={false}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-900 leading-tight truncate">
                  {userName}
                </div>
                <div className="text-xs text-gray-500 leading-tight">
                  {post.timeAgo}
                </div>
              </div>
            </div>
            {/* Category Badge */}
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-900 text-white flex-shrink-0">
              {formatCategory(post.type)}
            </span>
          </div>
        </div>

        {/* Title */}
        {post.title && (
          <div className="px-3 pb-2">
            <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight">
              {post.title}
            </h3>
          </div>
        )}

        {/* Spacer to push actions to bottom */}
        <div className="flex-1"></div>

        {/* Bottom Actions Bar */}
        <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            {/* Classification */}
            <span className="text-xs text-gray-500 truncate">
              {userClassification}
            </span>
            <div className="flex items-center gap-4">
              {/* Comments */}
              <span className="flex items-center gap-1 text-gray-500 text-xs">
                <MessageSquare className="w-4 h-4" />
                {post.commentCount || 0}
              </span>
              {/* Likes */}
              <button
                onClick={handleLikeClick}
                className={`flex items-center gap-1 text-xs transition-colors ${
                  post.isLiked ? "text-blue-600" : "text-gray-500 hover:text-blue-600"
                }`}
              >
                <ThumbsUp
                  className="w-4 h-4"
                  fill={post.isLiked ? "currentColor" : "none"}
                />
                {post.likeCount || 0}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BizHubPostCard;
