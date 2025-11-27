"use client";

import { useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ThumbsUp,
  MessageSquare,
  ArrowLeft,
  Home,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import type { RootState } from "../../../../../store/store";
import {
  useGetPostByIdQuery,
  useLikePostMutation,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useEditCommentMutation
} from "../../../../../store/api/bizpulseApi";
import { transformBizPulsePostToMock } from "../../../../../src/utils/bizpulseTransformers";
import toast from "react-hot-toast";
import Avatar from "@/components/ui/Avatar";
import ReportModal from "@/components/modals/ReportModal";
import { reportApi } from "../../../../../src/services/reportApi";
import ImageCarousel from "@/components/ImageCarousel";
import PostSkeleton from "@/components/ui/skeletons/PostSkeleton";

export default function BizPulseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params?.id as string;

  const { data: rawPost, isLoading, error: queryError } = useGetPostByIdQuery(postId);
  const [likePost, { isLoading: isLiking }] = useLikePostMutation();
  const [addComment, { isLoading: isSubmitting }] = useAddCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const [editComment] = useEditCommentMutation();

  const [newComment, setNewComment] = useState("");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isEditingCommentId, setIsEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ label: string; path: string }>>([
    { label: "Home", path: "/feeds" },
    { label: "BizPulse", path: "/feeds/biz-pulse" },
  ]);

  // Transform the raw post data
  const post = useMemo(() => {
    if (!rawPost) return null;
    // The API might return the post wrapped in 'wallFeed' or directly
    const postData = (rawPost as any).wallFeed || rawPost;
    return transformBizPulsePostToMock(postData);
  }, [rawPost]);

  // Get current user from auth state
  const currentUser = useSelector((state: RootState) => state.auth.user);

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

  // Handle like action
  const handleLike = useCallback(async () => {
    if (isLiking || !post) return;
    try {
      await likePost(postId).unwrap();
    } catch (error) {
      console.error("Failed to like post:", error);
      toast.error("Failed to update like status");
    }
  }, [isLiking, post, postId, likePost]);

  // Handle comment submit
  const handleCommentSubmit = useCallback(async () => {
    if (!newComment.trim() || isSubmitting) return;

    try {
      await addComment({ postId, content: newComment.trim() }).unwrap();
      setNewComment("");
      toast.success("Comment posted!");
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error("Failed to add comment. Please try again.");
    }
  }, [newComment, isSubmitting, postId, addComment]);

  // Determine breadcrumbs based on referrer and post category
  useEffect(() => {
    if (typeof window !== "undefined" && post) {
      const referrer = document.referrer;
      const postCategory = post.category;

      // Create breadcrumb trail based on referrer
      if (referrer.includes("/feeds/biz-pulse")) {
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
      } else {
        setBreadcrumbs([
          { label: "Home", path: "/feeds" },
          { label: "BizPulse", path: "/feeds/biz-pulse" },
        ]);
      }
    }
  }, [post]);

  // Scroll to comments section if navigation came from a notification
  useEffect(() => {
    if (typeof window !== "undefined" && post) {
      const shouldScrollToComments = sessionStorage.getItem("scrollToComments");
      if (shouldScrollToComments === "true") {
        sessionStorage.removeItem("scrollToComments");
        setTimeout(() => {
          const commentsSection = document.getElementById("comments-section");
          if (commentsSection) {
            commentsSection.scrollIntoView({ behavior: "smooth", block: "start" });
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

  const handleReportComment = async (reason: string) => {
    if (!reportingCommentId) return;
    try {
      const result = await reportApi.reportComment({
        commentId: reportingCommentId,
        postId: postId,
        reason: reason as any,
      });

      if (result.success) {
        toast.success("Comment reported successfully.");
      } else {
        toast.error(result.error || "Failed to report comment");
      }
    } catch (error) {
      console.error("Error reporting comment:", error);
      toast.error("Failed to report comment");
    } finally {
      setReportingCommentId(null);
      setIsReportModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-12">
        <PostSkeleton />
      </div>
    );
  }

  if ((!post && !isLoading) || queryError) {
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

  if (!post) return null;

  return (
    <div className="min-h-screen mt-12 bg-gray-50">
      {/* Header with breadcrumb navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-1.5 text-sm text-gray-600 overflow-x-auto scrollbar-hide">
            <Link href="/feeds" className="hover:text-blue-600 transition-colors p-0.5 flex-shrink-0">
              <Home className="w-4 h-4" />
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {breadcrumbs.slice(1).map((crumb) => (
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
              {post.title || "Post"}
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

          {/* Hero Image(s) */}
          {Array.isArray((post as any).images) && (post as any).images.length > 0 ? (
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

            {/* Content */}
            <div className="prose mt-2 prose-lg max-w-none text-gray-700 mb-8">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>

            {/* Stats */}
            <div className="py-4 border-y border-gray-200">
              <div className="flex items-center gap-6 text-gray-700">
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`flex items-center space-x-2 transition-all hover:scale-105 ${post.isLiked ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
                    } ${isLiking ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <ThumbsUp className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`} />
                  <span className="font-medium text-sm">{post.stats?.likes || 0} Likes</span>
                </button>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-sm">{post.stats?.comments || 0} Comments</span>
                </div>
              </div>
            </div>

            {/* Comment Form */}
            <div className="pt-4 pb-2">
              <div className="flex space-x-3">
                <Avatar
                  src={getAvatarUrl(currentUser?.avatar)}
                  alt={currentUser ? `${currentUser.fname} ${currentUser.lname}` : "User"}
                  size="sm"
                  fallbackText={currentUser ? `${currentUser.fname} ${currentUser.lname}` : "You"}
                  showMembershipBorder={false}
                />
                <div className="flex-1 space-y-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    disabled={isSubmitting}
                    className="w-full p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      {isSubmitting ? "Posting..." : "Post Comment"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="border-t border-gray-200 pt-4 mt-2">
              <h3 id="comments-section" className="text-base font-bold text-gray-900 mb-4">
                Comments ({post.stats?.comments || 0})
              </h3>

              <div className="space-y-4">
                {post.comments && post.comments.length > 0 ? (
                  post.comments.map((comment: any) => {
                    const isCurrentUserComment = comment.author.id === (currentUser?._id || currentUser?.id);
                    const commentProfileUrl = isCurrentUserComment
                      ? "/feeds/myprofile"
                      : `/feeds/connections/${comment.author.id}?from=connect-members`;

                    return (
                      <div key={comment.id} className="flex space-x-3 pb-4 border-b border-gray-100 last:border-0">
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
                              <span className="text-xs text-gray-500">{comment.timeAgo}</span>
                            </div>
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
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={async () => {
                                    if (!confirm("Are you sure you want to delete this comment?")) return;
                                    try {
                                      await deleteComment({ postId, commentId: comment.id }).unwrap();
                                      toast.success("Comment deleted");
                                    } catch (err) {
                                      console.error("Failed to delete comment", err);
                                      toast.error("Failed to delete comment");
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-700 p-1"
                                  title="Delete comment"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                          {isEditingCommentId === comment.id ? (
                            <div className="mt-2 space-y-2">
                              <textarea
                                value={editingContent}
                                onChange={(e) => setEditingContent(e.target.value)}
                                className="w-full border rounded-lg p-2 text-sm"
                                rows={3}
                              />
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={async () => {
                                    try {
                                      await editComment({ postId, commentId: comment.id, content: editingContent.trim() }).unwrap();
                                      toast.success("Comment updated");
                                      setIsEditingCommentId(null);
                                      setEditingContent("");
                                    } catch (err) {
                                      console.error("Failed to update comment", err);
                                      toast.error("Failed to update comment");
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
                            <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No comments yet. Be the first to comment!</p>
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
