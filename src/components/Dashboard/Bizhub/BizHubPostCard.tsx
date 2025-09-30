import React, { useState } from "react";
import Image from "next/image";
import { getAbsoluteImageUrl } from "@/utils/imageUtils";

interface BizHubPostCardProps {
  avatarUrl: string;
  name: string;
  profession: string;
  content: string;
  category: string;
  timeAgo: string;
  comments: number;
  likes: number;
}

// Utility function to generate initials from name
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2) // Take first 2 initials
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

const BizHubPostCard: React.FC<BizHubPostCardProps> = ({
  avatarUrl,
  name,
  profession,
  content,
  category,
  timeAgo,
  comments,
  likes,
}) => {
  const [imageError, setImageError] = useState(false);
  const initials = getInitials(name);
  const avatarColor = getAvatarColor(name);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-4">
      {/* Top Row: Avatar, Name, Profession */}
      <div className="flex items-center gap-4">
        <div className="relative w-12 h-12">
          {!imageError &&
          avatarUrl &&
          getAbsoluteImageUrl(avatarUrl) &&
          avatarUrl !== "/avatars/default.jpg" ? (
            <Image
              src={getAbsoluteImageUrl(avatarUrl)!}
              alt={name}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover border"
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              className={`w-12 h-12 rounded-full border flex items-center justify-center text-white font-semibold text-sm ${avatarColor}`}
            >
              {initials}
            </div>
          )}
        </div>
        <div>
          <div className="font-semibold text-gray-900 text-base">{name}</div>
          <div className="text-xs text-gray-400">{profession}</div>
        </div>
      </div>

      {/* Post Content */}
      <div className="text-lg text-gray-900 font-medium mb-2">{content}</div>

      {/* Divider */}
      <hr className="my-2" />

      {/* Bottom Row: Category, Time, Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
            {category}
          </span>
          <span className="text-xs text-gray-500">• {timeAgo}</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1 text-gray-400 text-sm">
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
                d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2"
              />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {comments}
          </span>
          <span className="flex items-center gap-1 text-gray-400 text-sm">
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
                d="M14 9l-3 3-3-3"
              />
            </svg>
            {likes}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BizHubPostCard;
