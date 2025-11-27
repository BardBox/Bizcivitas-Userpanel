"use client";

import { useSelector, useDispatch } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ThumbsUp,
  MessageSquare,
  ArrowLeft,
  Flag,
  Home,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import type { RootState } from "../../../../../store/store";
import { bizpulseApi } from "../../../../../src/services/bizpulseApi";
import { updatePost } from "../../../../../store/postsSlice";
import { transformBizPulsePostToMock } from "../../../../../src/utils/bizpulseTransformers";
import toast from "react-hot-toast";
import Avatar from "@/components/ui/Avatar";
import ReportModal from "@/components/modals/ReportModal";
import { reportApi } from "../../../../../src/services/reportApi";
import ImageCarousel from "@/components/ImageCarousel";

export default function BizPulseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const postId = params?.id as string;
  const enableCommentReporting = false;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const post = useSelector((state: RootState) =>
    state.posts.posts.find((p) => p.id === postId)
  );

  // Get current user from auth state
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [isLiked, setIsLiked] = useState(post?.isLiked || false);
  const [newComment, setNewComment] = useState("");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(
    null
  );
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isEditingCommentId, setIsEditingCommentId] = useState<string | null>(
    null
  );
  const [editingContent, setEditingContent] = useState<string>("");
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ label: string; path: string }>>([
    { label: "Home", path: "/feeds" },
    { label: "BizPulse", path: "/feeds/biz-pulse" },
  ]);

  // Helper function to format category
  const formatCategory = (category?: string): string => {
    if (!category) return "";
    return category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Helper function to get full avatar URL
  const getAvatarUrl = useCallback((avatarPath?: string | null) => {
    if (!avatarPath) return "/favicon.ico";
    if (avatarPath.startsWith("http")) return avatarPath;
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    return `${baseUrl}/image/${avatarPath}`;
  }, []);

  // Memoize comments to prevent flickering (MUST be before early returns)
  const memoizedComments = useMemo(() => {
    return post?.comments || [];
  }, [post?.comments]);

  // Memoize post stats to prevent flickering
  const memoizedStats = useMemo(() => {
    return post?.stats || { likes: 0, comments: 0, shares: 0 };
  }, [post?.stats]);

  // Handle like action with useCallback
  const handleLike = useCallback(async () => {
    if (isLiking || !post) return;

    const currentLikeStatus = isLiked;
    setIsLiked(!isLiked);

    const optimisticPost = {
      ...post,
      isLiked: !currentLikeStatus,
      stats: {
        ...post.stats,
        likes: currentLikeStatus ? post.stats.likes - 1 : post.stats.likes + 1,
      },
    };
    dispatch(updatePost(optimisticPost));

    setIsLiking(true);
    try {
      const updatedPost = await bizpulseApi.likeWallFeed(postId);
      if (updatedPost.success && updatedPost.data) {
        const postData = (updatedPost.data as any).wallFeed || updatedPost.data;
        const transformedPost = transformBizPulsePostToMock(postData);

        if (!transformedPost.image && post.image) {
          transformedPost.image = post.image;
        }

        dispatch(updatePost(transformedPost));
      }
    } catch (error) {
      console.error("Failed to like post:", error);
      toast.error("Failed to update like status");

      setIsLiked(currentLikeStatus);
      dispatch(updatePost(post));
    } finally {
      setIsLiking(false);
    }
  }, [isLiking, post, isLiked, postId, dispatch]);

  // Handle comment submit with useCallback
  const handleCommentSubmit = useCallback(async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    const commentText = newComment.trim();

    const currentUserName = currentUser
      ? `${currentUser.fname || ""} ${currentUser.lname || ""}`.trim()
      : "You";
    const currentUserId = currentUser?._id || currentUser?.id || "temp-user";
    const currentUserAvatar = currentUser?.avatar || null;

    const optimisticComment = {
      id: `temp-${Date.now()}`,
      content: commentText,
      author: {
        id: currentUserId,
        name: currentUserName,
        avatar: currentUserAvatar,
      },
      timeAgo: "Just now",
      likes: 0,
    };

    setNewComment("");

    try {
      if (post) {
        const updatedPost = {
          ...post,
          comments: [optimisticComment, ...(post.comments || [])],
          stats: {
            ...post.stats,
            comments: post.stats.comments + 1,
          },
        };
        dispatch(updatePost(updatedPost));
      }

      await bizpulseApi.addComment(postId, commentText);
      await new Promise((resolve) => setTimeout(resolve, 300));

      const updatedPost = await bizpulseApi.fetchWallFeedById(postId);
      if (updatedPost.success && updatedPost.data) {
        const postData = (updatedPost.data as any).wallFeed || updatedPost.data;
        const transformedPost = transformBizPulsePostToMock(postData);

        if (!transformedPost.image && post?.image) {
          transformedPost.image = post.image;
        }

        dispatch(updatePost(transformedPost));
        toast.success("Comment posted!");
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
      setError(
        error instanceof Error ? error.message : "Failed to add comment"
      );
      toast.error("Failed to add comment. Please try again.");

      const revertedPost = await bizpulseApi.fetchWallFeedById(postId);
      if (revertedPost.success && revertedPost.data) {
        const postData =
          (revertedPost.data as any).wallFeed || revertedPost.data;
        const transformedPost = transformBizPulsePostToMock(postData);
        dispatch(updatePost(transformedPost));
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [newComment, isSubmitting, currentUser, post, postId, dispatch]);

  // Determine breadcrumbs based on referrer and post category
  useEffect(() => {
    if (typeof window !== "undefined" && post) {
      const referrer = document.referrer;
      const postCategory = post.category;

      // Create breadcrumb trail based on referrer
      if (referrer.includes("/feeds/biz-pulse")) {
        // Came from BizPulse - add category filter if available
        setBreadcrumbs([
          { label: "Home", path: "/feeds" },
          { label: "BizPulse", path: "/feeds/biz-pulse" },
          ...(postCategory ? [{ label: formatCategory(postCategory), path: `/feeds/biz-pulse?category=${postCategory}` }] : []),
        ]);
      } else if (referrer.includes("/feeds/biz-hub")) {
        setBreadcrumbs([
          { label: "Home", path: "/feeds" },
          { label: "BizHub", path: "/feeds/biz-hub" },
        ]);
      } else if (referrer.includes("/feeds/dash") || referrer.includes("/feeds")) {
        setBreadcrumbs([
          { label: "Home", path: "/feeds" },
          { label: "BizPulse", path: "/feeds/biz-pulse" },
        ]);
      } else {
        // Default breadcrumb
        setBreadcrumbs([
          { label: "Home", path: "/feeds" },
          { label: "BizPulse", path: "/feeds/biz-pulse" },
        ]);
      }
    }
  }, [post]);

  // Scroll to comments section if navigation came from a notification about a comment
  useEffect(() => {
    if (typeof window !== "undefined" && post) {
      const shouldScrollToComments = sessionStorage.getItem("scrollToComments");
      if (shouldScrollToComments === "true") {
        // Remove the flag immediately to prevent re-scrolling on refresh
        sessionStorage.removeItem("scrollToComments");

        // Use a timeout to ensure the page has fully rendered
        setTimeout(() => {
          const commentsSection = document.getElementById("comments-section");
          if (commentsSection) {
            commentsSection.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }, 500);
      }
    }
  }, [post]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openMenuId) setOpenMenuId(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openMenuId]);

  useEffect(() => {
    const fetchPostIfNeeded = async () => {
      if (!post && postId) {
        setIsLoading(true);
        try {
          const response = await bizpulseApi.fetchWallFeedById(postId);
          if (response.success && response.data) {
            // Extract wallFeed from response.data (API wraps it in wallFeed property)
            const postData = (response.data as any).wallFeed || response.data;
            const transformedPost = transformBizPulsePostToMock(postData);
            dispatch(updatePost(transformedPost));
          } else {
            console.error("API returned success=false");
            toast.error("Failed to load post");
          }
        } catch (error) {
          console.error("Failed to fetch post:", error);
          toast.error("Failed to load post");
        } finally {
          setIsLoading(false);
        }
      } else {
      }
    };

    fetchPostIfNeeded();
  }, [postId, post, dispatch]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
        <div className="text-gray-500 text-lg">Loading post...</div>
      </div>
    );
  }

  // Show not found only if not loading and no post
  if (!post && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-gray-500 text-lg mb-2">Post not found</div>
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-700 flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go back</span>
        </button>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };







  const handleReportComment = async (reason: string) => {
    if (!reportingCommentId) return;
    const isValidObjectId = /^[a-fA-F0-9]{24}$/.test(reportingCommentId);
    if (!isValidObjectId) {
      toast.error(
        "Cannot report this comment until it’s synced. Please refresh."
      );
      setReportingCommentId(null);
      setIsReportModalOpen(false);
      return;
    }

    try {
      console.debug("[BizPulseDetailPage] Reporting comment:", {
        commentId: reportingCommentId,
        postId,
        reason,
      });
      const result = await reportApi.reportComment({
        commentId: reportingCommentId,
        postId: postId,
        reason: reason as any,
      });

      if (result.success) {
        console.debug("[BizPulseDetailPage] Report success:", result);
        toast.success(
          "Comment reported successfully. It has been hidden from your view."
        );
      } else {
        console.error("[BizPulseDetailPage] Report failed:", result.error);
        toast.error(result.error || "Failed to report comment");
      }
    } catch (error) {
      console.error("[BizPulseDetailPage] Error reporting comment:", error);
      toast.error("Failed to report comment");
    } finally {
      setReportingCommentId(null);
      setIsReportModalOpen(false);
    }
  };

  const handleOpenReportModal = (commentId: string) => {
    const isValidObjectId = /^[a-fA-F0-9]{24}$/.test(commentId);
    if (!isValidObjectId) {
      toast.error(
        "Cannot report this comment until it’s synced. Please refresh."
      );
      return;
    }
    setReportingCommentId(commentId);
    setIsReportModalOpen(true);
    setOpenMenuId(null);
  };

  return (
    <div className="min-h-screen mt-12 bg-gray-50">
      {/* Header with breadcrumb navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-1.5 text-sm text-gray-600 overflow-x-auto scrollbar-hide">
            {/* Home Icon */}
            <Link
              href="/feeds"
              className="hover:text-blue-600 transition-colors p-0.5 flex-shrink-0"
            >
              <Home className="w-4 h-4" />
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />

            {breadcrumbs.slice(1).map((crumb, index) => (
              <React.Fragment key={crumb.path}>
                <Link
                  href={crumb.path}
                  className="text-[13px] md:text-[14px] hover:text-blue-600 transition-colors font-medium whitespace-nowrap flex-shrink-0"
                >
                  {crumb.label}
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </React.Fragment>
            ))}

            <span className="text-gray-900 font-semibold text-[13px] md:text-[14px] truncate">
              {post?.title || "Post"}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Author Info Header */}
          <div className="px-6 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <Avatar
                src={getAvatarUrl(post.author.avatar)}
                alt={post.author.name}
                size="md"
                fallbackText={post.author.name}
                showMembershipBorder={false}
              />
              <div className="flex-1">
                <div className="text-base font-semibold text-gray-900">
                  {post.author.name}
                </div>
                <div className="text-sm text-gray-500 mt-0.5">
                  {post.timeAgo}
                </div>
              </div>
            </div>
          </div>

          {/* Hero Image(s) - Use carousel if multiple images exist */}
          {Array.isArray((post as any).images) &&
            (post as any).images.length > 0 ? (
            <ImageCarousel images={(post as any).images} alt={post.title} />
          ) : post.image ? (
            <div className="w-full aspect-video relative overflow-hidden bg-gray-100">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-contain"
              />
            </div>
          ) : null}

          {/* Article Content */}
          <div className="px-2 py-4 md:px-6 md:py-8">
            {/* Category Badge */}
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full font-medium">
                {post.category
                  .replace("-", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-[20px] md:text-[24px] font-bold text-gray-900 md:mb-2 lg:mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Article Content */}
            <div className="prose mt-2 prose-lg max-w-none text-gray-700 mb-8">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>

            {/* Interactive Stats Display */}
            <div className="py-4 border-y border-gray-200">
              <div className="flex items-center gap-6 text-gray-700">
                {/* Like Button */}
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`flex items-center space-x-2 transition-all hover:scale-105 ${isLiked
                      ? "text-blue-600"
                      : "text-gray-700 hover:text-blue-600"
                    } ${isLiking ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <ThumbsUp
                    className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`}
                  />
                  <span className="font-medium text-sm">
                    {memoizedStats.likes} Likes
                  </span>
                </button>
                {/* Comments Count */}
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-sm">
                    {memoizedStats.comments} Comments
                  </span>
                </div>
              </div>
            </div>

            {/* Comment Form */}
            <div className="pt-4 pb-2">
              <div className="flex space-x-3">
                <Avatar
                  src={getAvatarUrl(currentUser?.avatar)}
                  alt={
                    currentUser
                      ? `${currentUser.fname} ${currentUser.lname}`
                      : "User"
                  }
                  size="sm"
                  fallbackText={
                    currentUser
                      ? `${currentUser.fname} ${currentUser.lname}`
                      : "You"
                  }
                  showMembershipBorder={false}
                />
                <div className="flex-1 space-y-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    disabled={isSubmitting}
                    className={`w-full p-4 border rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${error ? "border-red-300" : "border-gray-300"
                      } ${isSubmitting ? "bg-gray-50" : ""}`}
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleCommentSubmit}
                      disabled={!newComment.trim() || isSubmitting}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${isSubmitting || !newComment.trim()
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow"
                        }`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Posting...</span>
                        </div>
                      ) : (
                        "Post Comment"
                      )}
                    </button>
                  </div>
                  {error && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="border-t border-gray-200 pt-4 mt-2">
              <h3
                id="comments-section"
                className="text-base font-bold text-gray-900 mb-4"
              >
                Comments ({memoizedStats.comments})
              </h3>

              <div className="space-y-4">
                {memoizedComments.length > 0 ? (
                  memoizedComments.map((comment) => {
                    const isCurrentUserComment =
                      comment.author.id ===
                      (currentUser?._id || currentUser?.id);
                    const commentProfileUrl = isCurrentUserComment
                      ? "/feeds/myprofile"
                      : `/feeds/connections/${comment.author.id}?from=connect-members`;

                    return (
                      <div
                        key={comment.id}
                        className="flex space-x-3 pb-4 border-b border-gray-100 last:border-0"
                      >
                        <Link href={commentProfileUrl}>
                          <Avatar
                            src={getAvatarUrl(comment.author.avatar)}
                            alt={comment.author.name}
                            size="sm"
                            fallbackText={comment.author.name}
                            showMembershipBorder={false}
                            className="cursor-pointer"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex flex-col">
                              <Link
                                href={commentProfileUrl}
                                className="font-semibold text-sm text-gray-900 hover:text-blue-600 transition-colors"
                              >
                                {comment.author.name}
                              </Link>
                              <span className="text-xs text-gray-500">
                                {comment.timeAgo}
                              </span>
                            </div>
                            {/* Edit/Delete buttons for own comments */}
                            {isCurrentUserComment && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setIsEditingCommentId(comment.id);
                                    setEditingContent(comment.content);
                                  }}
                                  className="text-blue-600 hover:text-blue-700 p-1"
                                  title="Edit comment"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={async () => {
                                    if (!confirm("Are you sure you want to delete this comment?")) return;
                                    try {
                                      await bizpulseApi.deleteComment(postId, comment.id);
                                      const refreshed = await bizpulseApi.fetchWallFeedById(postId);
                                      if (refreshed.success && refreshed.data) {
                                        const postData = (refreshed.data as any).wallFeed || refreshed.data;
                                        const transformedPost = transformBizPulsePostToMock(postData);
                                        if (!transformedPost.image && post.image) {
                                          transformedPost.image = post.image;
                                        }
                                        dispatch(updatePost(transformedPost));
                                        toast.success("Comment deleted");
                                      }
                                    } catch (err) {
                                      console.error("Failed to delete comment", err);
                                      toast.error("Failed to delete comment");
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-700 p-1"
                                  title="Delete comment"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                          {isEditingCommentId === comment.id ? (
                            <div className="mt-2 space-y-2">
                              <textarea
                                value={editingContent}
                                onChange={(e) =>
                                  setEditingContent(e.target.value)
                                }
                                className="w-full border rounded-lg p-2 text-sm"
                                rows={3}
                              />
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={async () => {
                                    try {
                                      await bizpulseApi.editComment(
                                        postId,
                                        comment.id,
                                        editingContent.trim()
                                      );
                                      const refreshed =
                                        await bizpulseApi.fetchWallFeedById(
                                          postId
                                        );
                                      if (refreshed.success && refreshed.data) {
                                        const postData =
                                          (refreshed.data as any).wallFeed ||
                                          refreshed.data;
                                        const transformedPost =
                                          transformBizPulsePostToMock(postData);
                                        if (
                                          !transformedPost.image &&
                                          post.image
                                        ) {
                                          transformedPost.image = post.image;
                                        }
                                        dispatch(updatePost(transformedPost));
                                        toast.success("Comment updated");
                                      }
                                    } catch (err) {
                                      console.error(
                                        "Failed to update comment",
                                        err
                                      );
                                      toast.error("Failed to update comment");
                                    } finally {
                                      setIsEditingCommentId(null);
                                      setEditingContent("");
                                    }
                                  }}
                                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setIsEditingCommentId(null);
                                    setEditingContent("");
                                  }}
                                  className="px-3 py-1.5 text-xs font-medium text-gray-700 border rounded-lg hover:bg-gray-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {comment.content}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      No comments yet. Be the first to comment!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setReportingCommentId(null);
        }}
        onSubmit={handleReportComment}
        type="comment"
      />
    </div>
  );
}
