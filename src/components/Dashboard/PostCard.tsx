"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, MessageSquare, Share2, MoreHorizontal } from "lucide-react";
import Avatar from "@/components/ui/Avatar";

interface PostCardProps {
  title: string;
  content: string;
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
  author = {
    name: "John Smith",
    title: "Business Professional",
  },
  image,
  stats = {
    likes: 42,
    comments: 8,
    shares: 5,
  },
  timeAgo = "2 hours ago",
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(stats.likes);
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleCommentClick = () => {
    setIsCommentsExpanded(!isCommentsExpanded);
  };

  // Render rich text content
  const renderContent = (content: string) => {
    return (
      <div className="prose prose-sm max-w-none text-gray-800">
        <p>{content}</p>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-4">
      {/* Post Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Avatar
            src={author.avatar}
            alt={author.name}
            size="lg"
            fallbackText={author.name}
            showMembershipBorder={false}
            className=" flex-shrink-0"
          />
          <div className="flex flex-col justify-center min-h-[40px] sm:min-h-[48px] flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 leading-tight text-sm sm:text-base truncate">
              {author.name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 leading-tight truncate">
              {author.title}
            </p>
            <p className="text-xs text-gray-400 leading-tight">{timeAgo}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <button className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100">
            <MoreHorizontal size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="mt-3 sm:mt-4">
        <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 leading-tight">
          {title}
        </h4>
        <div className="text-sm sm:text-base">{renderContent(content)}</div>
        {image && (
          <div className="mt-3 flex justify-center">
            <Image
              src={image}
              alt="Post content"
              width={600}
              height={400}
              priority={title.includes("Post 1")} // Add priority for the first post
              className="rounded-lg object-cover max-h-64 sm:max-h-96 w-full"
            />
          </div>
        )}
      </div>

      {/* Post Stats */}
      <div className="mt-3 sm:mt-4 flex items-center text-xs sm:text-sm text-gray-500 space-x-3 sm:space-x-4">
        <span>{likeCount} likes</span>
        <span>{stats.comments} comments</span>
        <span>{stats.shares} shares</span>
      </div>

      {/* Post Actions */}
      <div className="mt-3 sm:mt-4 flex justify-between border-t border-gray-200 pt-3">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-md hover:bg-gray-50 transition-colors text-xs sm:text-sm ${
            isLiked ? "text-blue-500" : "text-gray-500"
          }`}
        >
          <Heart
            size={16}
            className="sm:w-[18px] sm:h-[18px]"
            fill={isLiked ? "currentColor" : "none"}
          />
          <span className="hidden sm:inline">Like</span>
        </button>
        <button
          onClick={handleCommentClick}
          className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-md hover:bg-gray-50 transition-colors text-xs sm:text-sm ${
            isCommentsExpanded ? "text-blue-500" : "text-gray-500"
          }`}
        >
          <MessageSquare size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span className="hidden sm:inline">Comment</span>
        </button>
        <button className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-md hover:bg-gray-50 transition-colors text-gray-500 text-xs sm:text-sm">
          <Share2 size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      {/* Comment Section Placeholder */}
      {isCommentsExpanded && (
        <div className="mt-3 sm:mt-4 border-t border-gray-200 pt-3 sm:pt-4">
          <div className="space-y-2 sm:space-y-3">
            {/* Sample Comments */}
            <div className="flex space-x-2 sm:space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                AB
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    Alice Brown
                  </p>
                  <p className="text-xs sm:text-sm text-gray-700">
                    Great insights! This is very helpful for our business
                    strategy.
                  </p>
                </div>
                <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
              </div>
            </div>

            <div className="flex space-x-2 sm:space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                MJ
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    Mike Johnson
                  </p>
                  <p className="text-xs sm:text-sm text-gray-700">
                    Thanks for sharing this valuable information!
                  </p>
                </div>
                <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
              </div>
            </div>

            {/* Comment Input */}
            <div className="flex space-x-2 sm:space-x-3 mt-3 sm:mt-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                YJ
              </div>
              <div className="flex-1 min-w-0">
                <textarea
                  placeholder="Write a comment..."
                  className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                  rows={2}
                />
                <div className="flex justify-end mt-2">
                  <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 text-white text-xs sm:text-sm rounded-md hover:bg-blue-600 transition-colors">
                    Post Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
