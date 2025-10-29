import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getAbsoluteImageUrl } from "@/utils/imageUtils";
import type { BizHubPost } from "../../../../store/bizhubSlice";

interface BizHubPostCardProps {
  post: BizHubPost;
  onLike: (postId: string) => void;
  userId?: string;
}

// Utility function to generate initials from name
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
};

// Generate a consistent color based on name
const getAvatarColor = (name: string): string => {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-teal-500",
  ];
  const index =
    name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;
  return colors[index];
};

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
  const [imageError, setImageError] = useState(false);

  // Safe access to user data with fallbacks
  const userName = post.userId?.name || post.user?.name || "Unknown User";
  const userAvatar = post.userId?.avatar || post.user?.avatar || "";
  const userClassification = post.userId?.classification || post.user?.classification || "Member";

  const initials = getInitials(userName);
  const avatarColor = getAvatarColor(userName);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onLike(post._id);
  };

  return (
    <Link href={`/feeds/biz-hub/${post._id}`} className="block mb-4">
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow cursor-pointer border border-gray-100">
        {/* Header: Avatar, Name, Profession */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              {!imageError &&
              userAvatar &&
              getAbsoluteImageUrl(userAvatar) ? (
                <Image
                  src={getAbsoluteImageUrl(userAvatar)!}
                  alt={userName}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover border"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div
                  className={`w-10 h-10 rounded-full border flex items-center justify-center text-white font-semibold text-sm ${avatarColor}`}
                >
                  {initials}
                </div>
              )}
            </div>
            <div>
              <div className="font-medium text-gray-900 text-sm leading-5">
                {userName}
              </div>
              <div className="text-xs text-gray-400 leading-4">
                {userClassification}
              </div>
            </div>
          </div>
          <span className="text-xs text-gray-400 ml-2">{post.timeAgo}</span>
        </div>

        {/* Title */}
        {post.title && (
          <div className="text-base font-semibold text-gray-900 line-clamp-2">
            {post.title}
          </div>
        )}

        {/* Divider */}
        <hr className="my-2" />

        {/* Bottom Row: Category, Actions */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-3">
            <span className="bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-medium">
              {formatCategory(post.type)}
            </span>
          </div>
          <div className="flex items-center gap-6">
            {/* Comments */}
            <span className="flex items-center gap-1 text-gray-500 text-sm">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {post.commentCount || 0}
            </span>
            {/* Likes */}
            <button
              onClick={handleLikeClick}
              className={`flex items-center gap-1 text-sm transition-colors ${
                post.isLiked ? "text-blue-600" : "text-gray-500 hover:text-blue-600"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill={post.isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {post.likeCount || 0}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BizHubPostCard;
