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
  imageUrl?: string;
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
  imageUrl,
}) => {
  const [imageError, setImageError] = useState(false);
  const initials = getInitials(name);
  const avatarColor = getAvatarColor(name);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-3">
      {/* Header: Avatar, Name, Profession */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8">
          {!imageError &&
          avatarUrl &&
          getAbsoluteImageUrl(avatarUrl) &&
          avatarUrl !== "/avatars/default.jpg" ? (
            <Image
              src={getAbsoluteImageUrl(avatarUrl)!}
              alt={name}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover border"
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              className={`w-8 h-8 rounded-full border flex items-center justify-center text-white font-semibold text-xs ${avatarColor}`}
            >
              {initials}
            </div>
          )}
          </div>
          <div>
            <div className="font-medium text-gray-900 text-sm leading-4">{name}</div>
            <div className="text-xs text-gray-400 leading-4">{profession}</div>
          </div>
        </div>
        <span className="text-[10px] text-gray-400 ml-2">{timeAgo}</span>
      </div>

      {/* Image (if any) */}
      {imageUrl && (
        <div className="w-full">
          <Image
            src={getAbsoluteImageUrl(imageUrl)}
            alt={name}
            width={900}
            height={506}
            className="w-full h-auto rounded-lg object-cover"
          />
        </div>
      )}

      {/* Content */}
      {content && (
        <div className="text-sm text-gray-900 font-medium mb-1">{content}</div>
      )}

      {/* Divider */}
      <hr className="my-2" />

      {/* Bottom Row: Category, Time, Actions */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-3">
          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
            {category}
          </span>
          {/* time shown in header */}
        </div>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1 text-gray-400 text-xs">
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
          <span className="flex items-center gap-1 text-gray-400 text-xs">
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
