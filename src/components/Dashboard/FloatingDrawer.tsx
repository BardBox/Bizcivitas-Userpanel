"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Activity, Network, Clock } from "lucide-react";
import Avatar from "@/components/ui/Avatar";

interface RecentPost {
  id: string;
  title: string;
  description?: string;
  author: {
    name: string;
    avatar?: string;
  };
  timeAgo: string;
  postSource: "bizpulse" | "bizhub";
  category?: string;
  isPoll?: boolean;
}

interface FloatingDrawerProps {
  onToggle?: (isOpen: boolean) => void;
  recentPosts?: RecentPost[];
}

export default function FloatingDrawer({
  onToggle,
  recentPosts = [],
}: FloatingDrawerProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [manuallyToggled, setManuallyToggled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Set initial state based on screen size
  useEffect(() => {
    setIsMounted(true);

    const checkScreenSize = () => {
      // Only auto-adjust if user hasn't manually toggled
      if (!manuallyToggled) {
        const isLargeScreen = window.innerWidth >= 1024; // lg breakpoint
        setIsOpen(isLargeScreen);
        onToggle?.(isLargeScreen);
      }
    };

    // Set initial state immediately
    checkScreenSize();

    // Listen for resize events
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [onToggle, manuallyToggled]);

  const toggleDrawer = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    setManuallyToggled(true); // Mark as manually toggled
    onToggle?.(newState);
  };

  return (
    <>
      <button
        onClick={toggleDrawer}
        className={`fixed top-1/2 transform -translate-y-1/2 z-50 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-l-lg shadow-lg transition-all duration-300 ${
          isOpen ? "right-96" : "right-0"
        }`}
        title={isOpen ? "Close drawer" : "Open drawer"}
      >
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
            d={isOpen ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
          />
        </svg>
      </button>

      {/* Floating Drawer */}
      <div
        className={`fixed top-18 w-[85%] right-0 h-full md:w-96 bg-white shadow-2xl transition-all duration-300 z-40 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full overflow-y-auto custom-scrollbar">
          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #d1d5db;
              border-radius: 3px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #9ca3af;
            }
            .custom-scrollbar {
              scrollbar-width: thin;
              scrollbar-color: #d1d5db transparent;
            }
          `}</style>
          {/* Drawer Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Recent Posts
              </h3>
              <button
                onClick={toggleDrawer}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-white/50 transition"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Drawer Content */}
          <div className="p-4 bg-gray-50">
            {/* Recent Posts List */}
            {recentPosts.length > 0 ? (
              <div>
                {recentPosts.slice(0, 8).map((post) => {
                  // Check if this is a poll post
                  const isPoll = post.category === "pulse-polls" || post.isPoll;

                  // For polls, navigate to BizPulse Pulse Polls tab
                  // For regular posts, navigate to detail page
                  const detailUrl = isPoll
                    ? "/feeds/biz-pulse?category=pulse-polls"
                    : post.postSource === "bizpulse"
                    ? `/feeds/biz-pulse/${post.id}`
                    : `/feeds/biz-hub/${post.id}`;

                  return (
                    <Link href={detailUrl} key={post.id}>
                      <div className="group p-4 mb-4 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer border border-gray-200 transition-all hover:border-blue-300 hover:shadow-md bg-white">
                        {/* Title with Icon */}
                        <div className="flex items-start gap-2 mb-3">
                          <h4 className="text-sm font-bold text-gray-900 line-clamp-2 flex-1 leading-snug group-hover:text-blue-700">
                            {post.title}
                          </h4>
                          {/* Source Icon */}
                          <div
                            className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                              post.postSource === "bizpulse"
                                ? "bg-blue-500"
                                : "bg-purple-500"
                            }`}
                          >
                            {post.postSource === "bizpulse" ? (
                              <Activity className="w-4 h-4 text-white" />
                            ) : (
                              <Network className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>

                        {/* Author and Time */}
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                          <div className="flex-shrink-0">
                            <Avatar
                              src={post.postSource === "bizpulse" ? "/favicon.ico" : (post.author.avatar || undefined)}
                              alt={post.author.name}
                              size="xs"
                              fallbackText={post.author.name}
                              showMembershipBorder={false}
                            />
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 min-w-0">
                            <span className="truncate font-semibold text-gray-700">
                              {post.author.name}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="flex-shrink-0 text-gray-500">
                              {post.timeAgo}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">No recent posts available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop - Only show on mobile screens */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-30 md:hidden"
          onClick={toggleDrawer}
        />
      )}
    </>
  );
}
