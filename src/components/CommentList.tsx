"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import LikeButton from "./LikeButton";
import { MoreHorizontal, Trash2 } from "lucide-react";
import Avatar from "@/components/ui/Avatar";

interface Comment {
  _id: string;
  content: string;
  userId: {
    _id: string;
    fname: string;
    lname: string;
    avatar?: string;
    username: string;
  };
  createdAt: string;
  likes: Array<{ userId: string }>;
  likeCount: number;
  isLiked: boolean;
  mediaUrl?: string;
}

interface CommentListProps {
  comments: Comment[];
  currentUserId: string;
  onLikeComment: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
  loading?: { [key: string]: boolean };
}

export default function CommentList({
  comments,
  currentUserId,
  onLikeComment,
  onDeleteComment,
  loading = {},
}: CommentListProps) {
  // Helper function to get full avatar URL
  const getAvatarUrl = (avatarPath?: string | null) => {
    if (!avatarPath) return undefined;

    // If it's already a full URL (starts with http), return as is
    if (avatarPath.startsWith("http")) {
      return avatarPath;
    }

    // Otherwise, construct full URL with backend base URL
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    return `${baseUrl}/image/${avatarPath}`;
  };

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        // Check if this comment is from the current user
        const isCurrentUser = comment.userId._id === currentUserId;
        const profileUrl = isCurrentUser
          ? '/feeds/myprofile'
          : `/feeds/connections/${comment.userId._id}?from=connect-members`;

        return (
          <div key={comment._id} className="flex gap-3">
            {/* Comment Content */}
            <div className="flex-1 min-w-0">
              <div className="bg-gray-50 rounded-lg p-4">
                {/* Header with Avatar, Name, and Timestamp */}
                <div className="flex items-center gap-3 mb-3">
                  {/* User Avatar */}
                  <Link href={profileUrl} className="flex-shrink-0">
                    <Avatar
                      src={getAvatarUrl(comment.userId.avatar)}
                      alt={`${comment.userId.fname} ${comment.userId.lname}`}
                      size="sm"
                      fallbackText={`${comment.userId.fname} ${comment.userId.lname}`}
                      showMembershipBorder={false}
                      className="cursor-pointer"
                    />
                  </Link>

                  {/* Name and Timestamp */}
                  <div className="flex-1 min-w-0">
                    <Link href={profileUrl}>
                      <h4 className="font-semibold hover:text-blue-600 cursor-pointer truncate">
                        {comment.userId.fname} {comment.userId.lname}
                      </h4>
                    </Link>
                    <p className="text-sm text-gray-500 truncate">
                      {format(
                        new Date(comment.createdAt),
                        "MMM d, yyyy 'at' h:mm a"
                      )}
                    </p>
                  </div>

                  {/* Actions Menu */}
                  {comment.userId._id === currentUserId && (
                    <div className="relative group flex-shrink-0">
                      <button className="p-1 hover:bg-gray-100 rounded-full">
                        <MoreHorizontal className="w-5 h-5 text-gray-500" />
                      </button>
                      <div className="absolute right-0 mt-1 hidden group-hover:block">
                        <button
                          onClick={() => onDeleteComment(comment._id)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 bg-white rounded-lg shadow-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              <p className="mt-2">{comment.content}</p>

              {comment.mediaUrl && (
                <div className="mt-3 relative w-full h-48">
                  <Image
                    src={comment.mediaUrl}
                    alt="Comment attachment"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Like Button */}
            <div className="mt-2 ml-4">
              <LikeButton
                isLiked={comment.isLiked}
                likeCount={comment.likeCount}
                onLike={() => onLikeComment(comment._id)}
                loading={loading[comment._id]}
                size="sm"
              />
            </div>
          </div>
        </div>
      );
      })}
    </div>
  );
}
