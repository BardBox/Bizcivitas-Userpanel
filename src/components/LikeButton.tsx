"use client";

import React from "react";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  isLiked: boolean;
  likeCount: number;
  onLike: () => void;
  loading?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function LikeButton({
  isLiked,
  likeCount,
  onLike,
  loading = false,
  size = "md",
}: LikeButtonProps) {
  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <button
      onClick={onLike}
      disabled={loading}
      className={`flex items-center gap-2 ${
        isLiked ? "text-orange-500" : "text-gray-600"
      } hover:text-orange-600 transition-colors ${sizes[size]}`}
    >
      <Heart
        size={iconSizes[size]}
        className={`${isLiked ? "fill-current" : ""} ${
          loading ? "animate-pulse" : ""
        }`}
      />
      {likeCount > 0 && <span>{likeCount}</span>}
    </button>
  );
}
