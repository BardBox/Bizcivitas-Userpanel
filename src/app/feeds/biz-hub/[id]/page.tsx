"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { getAbsoluteImageUrl } from "@/utils/imageUtils";

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

// Dummy data for demonstration. Replace with real data fetching.
const dummyPosts = [
  {
    id: "1",
    avatarUrl: "/avatars/avatar1.jpg",
    name: "John Doe",
    profession: "Software Engineer",
    content: "This is a sample post content for John Doe.",
    category: "Technology",
    timeAgo: "2 hours ago",
    comments: 5,
    likes: 10,
    imageUrl: "/handshake.jpg",
    title: "Egestas libero nulla facilisis ac diam rhoncus feugiat.",
    details: "Full post details for John Doe...",
  },
  {
    id: "2",
    avatarUrl: "/avatars/avatar2.jpg",
    name: "Jane Smith",
    profession: "Marketing Consultant",
    content: "Jane's post content goes here.",
    category: "Marketing",
    timeAgo: "1 hour ago",
    comments: 8,
    likes: 15,
    imageUrl: "/handshake.jpg",
    title:
      "Sed ullamcorper venenatis euismod orci id condimentum fermentum rhoncus sodales.",
    details: "Full post details for Jane Smith...",
  },
  {
    id: "3",
    avatarUrl: "/avatars/avatar3.jpg",
    name: "Alex Brown",
    profession: "Product Manager",
    content: "Alex's post content for BizHub.",
    category: "Product",
    timeAgo: "30 min ago",
    comments: 2,
    likes: 7,
    imageUrl: "/handshake.jpg",
    title: "Nibh sem tempus cras morbi sit suscipit.",
    details: "Full post details for Alex Brown...",
  },
];

export default function BizHubPostDetail() {
  const params = useParams();
  const post = dummyPosts.find((p) => p.id === params?.id);
  const [imageError, setImageError] = useState(false);

  if (!post) {
    return <div className="p-8 text-center text-gray-500">Post not found.</div>;
  }

  const initials = getInitials(post.name);
  const avatarColor = getAvatarColor(post.name);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-12 h-12">
            {!imageError &&
            post.avatarUrl &&
            getAbsoluteImageUrl(post.avatarUrl) &&
            post.avatarUrl !== "/avatars/default.jpg" ? (
              <Image
                src={getAbsoluteImageUrl(post.avatarUrl)!}
                alt={post.name}
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
            <div className="font-semibold text-gray-900 text-base">
              {post.name}
            </div>
            <div className="text-xs text-gray-400">{post.profession}</div>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{post.title}</h1>
        <img
          src={post.imageUrl}
          alt="Post"
          className="w-full rounded-lg mb-4 object-cover"
        />
        <div className="text-gray-700 text-base mb-4">{post.details}</div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
            {post.category}
          </span>
          <span>• {post.timeAgo}</span>
          <span>💬 {post.comments}</span>
          <span>👍 {post.likes}</span>
        </div>
      </div>
    </div>
  );
}
