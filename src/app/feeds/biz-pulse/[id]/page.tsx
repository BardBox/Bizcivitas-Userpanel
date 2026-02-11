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
  useEditCommentMutation,
  useLikeCommentMutation
} from "../../../../../store/api/bizpulseApi";
import { transformBizPulsePostToMock } from "../../../../../src/utils/bizpulseTransformers";
import toast from "react-hot-toast";
import Avatar from "@/components/ui/Avatar";
import ReportModal from "@/components/modals/ReportModal";
import LikesModal from "@/components/modals/LikesModal";
import { reportApi } from "../../../../../src/services/reportApi";
import ImageCarousel from "@/components/ImageCarousel";
import PostSkeleton from "@/components/ui/skeletons/PostSkeleton";
import { buildCommentTree } from "@/utils/buildCommentTree";
import CommentItem from "@/components/CommentItem";
import { useUserSearch } from "@/hooks/useUserSearch";
import MentionAutocomplete from "@/components/MentionAutocomplete";

export default function BizPulseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params?.id as string;

  const { data: rawPost, isLoading, error: queryError } = useGetPostByIdQuery(postId);
  const [likePost, { isLoading: isLiking }] = useLikePostMutation();
  const [addComment, { isLoading: isSubmitting }] = useAddCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const [editComment] = useEditCommentMutation();
  const [likeComment] = useLikeCommentMutation();

  const [newComment, setNewComment] = useState("");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isLikesModalOpen, setIsLikesModalOpen] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isEditingCommentId, setIsEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ label: string; path: string }>>([
    { label: "Home", path: "/feeds" },
    { label: "BizPulse", path: "/feeds/biz-pulse" },
  ]);

  // Mention autocomplete state
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStartIndex, setMentionStartIndex] = useState(0);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [mentionedUsers, setMentionedUsers] = useState<Array<{id: string, username: string}>>([]);
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null);

  // Use the user search hook
  const { users: mentionUsers, loading: mentionLoading } = useUserSearch(mentionQuery);

  // Get current user from auth state (must be before post transform)
  const currentUser = useSelector((state: RootState) => state.auth.user);

  // Transform the raw post data
  const post = useMemo(() => {
    if (!rawPost) return null;
    // The API might return the post wrapped in 'wallFeed' or directly
    const postData = (rawPost as any).wallFeed || rawPost;
    const userId = currentUser?._id || currentUser?.id;
    return transformBizPulsePostToMock(postData, userId);
  }, [rawPost, currentUser]);

  // Get likes array from raw post for display
  const likesArray = useMemo(() => {
    return ((rawPost as any)?.wallFeed?.likes || (rawPost as any)?.likes) || [];
  }, [rawPost]);

  // Build comment tree for recursive rendering
  const commentTree = useMemo(() => {
    if (!post?.comments) return [];
    return buildCommentTree(post.comments);
  }, [post?.comments]);

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

  // Handle mention detection in textarea
  const handleCommentTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const cursorPos = e.target.selectionStart;
    setNewComment(text);

    // Find "@" before cursor
    const textBeforeCursor = text.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      // Check if there's no space after @ (still typing the mention)
      if (!textAfterAt.includes(" ") && textAfterAt.length >= 0) {
        setMentionQuery(textAfterAt);
        setMentionStartIndex(lastAtIndex);
        setShowMentionDropdown(true);
        setSelectedMentionIndex(0);
        return;
      }
    }

    // Hide dropdown if no @ or conditions not met
    setShowMentionDropdown(false);
  };

  // Handle mention selection
  const handleMentionSelect = (user: any) => {
    if (!textareaRef) return;

    const username = user.username || `${user.fname} ${user.lname}`.trim();
    const beforeMention = newComment.substring(0, mentionStartIndex);
    const afterMention = newComment.substring(textareaRef.selectionStart);
    const newText = `${beforeMention}@${username} ${afterMention}`;

    setNewComment(newText);
    setShowMentionDropdown(false);
    setMentionedUsers([...mentionedUsers, { id: user.id, username }]);

    // Focus textarea and move cursor after mention
    setTimeout(() => {
      if (textareaRef) {
        const newCursorPos = beforeMention.length + username.length + 2; // +2 for @ and space
        textareaRef.focus();
        textareaRef.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Handle keyboard navigation in mention dropdown
  const handleCommentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showMentionDropdown) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedMentionIndex((prev) => Math.min(prev + 1, mentionUsers.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedMentionIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && mentionUsers.length > 0) {
      e.preventDefault();
      handleMentionSelect(mentionUsers[selectedMentionIndex]);
    } else if (e.key === "Escape") {
      setShowMentionDropdown(false);
    }
  };

  // Handle comment submit
  const handleCommentSubmit = useCallback(async () => {
    if (!newComment.trim() || isSubmitting) return;

    try {
      const mentions = mentionedUsers.map(u => u.id);
      await addComment({
        postId,
        content: newComment.trim(),
        ...(mentions.length > 0 && { mentions })
      }).unwrap();
      setNewComment("");
      setMentionedUsers([]);
      toast.success("Comment posted!");
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error("Failed to add comment. Please try again.");
    }
  }, [newComment, isSubmitting, postId, addComment, mentionedUsers]);

  // Handle reply submit
  const handleReply = useCallback(async (parentCommentId: string, content: string, mentions?: string[]) => {
    if (!content.trim()) return;

    try {
      await addComment({
        postId,
        content: content.trim(),
        parentCommentId,
        mentions
      }).unwrap();
      toast.success("Reply posted!");
    } catch (error) {
      console.error("Failed to add reply:", error);
      toast.error("Failed to add reply. Please try again.");
      throw error;
    }
  }, [postId, addComment]);

  const handleEditComment = useCallback(async (commentId: string, content: string) => {
    if (!content.trim()) return;

    try {
      await editComment({ postId, commentId, content: content.trim() }).unwrap();
      toast.success("Comment updated!");
    } catch (error) {
      console.error("Failed to edit comment:", error);
      toast.error("Failed to edit comment");
      throw error;
    }
  }, [postId, editComment]);

  const handleDeleteComment = useCallback(async (commentId: string) => {
    try {
      await deleteComment({ postId, commentId }).unwrap();
      toast.success("Comment deleted!");
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast.error("Failed to delete comment");
      throw error;
    }
  }, [postId, deleteComment]);

  // Handle like comment
  const handleLikeComment = useCallback(async (commentId: string) => {
    try {
      await likeComment({ postId, commentId }).unwrap();
    } catch (error) {
      console.error("Failed to like comment:", error);
      toast.error("Failed to like comment");
    }
  }, [postId, likeComment]);

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

          {/* Hero Video or Image(s) */}
          {(post as any).videos && (post as any).videos.length > 0 ? (
            // Display Vimeo video player - Same approach as Knowledge Hub
            <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
              <iframe
                src={(post as any).videos[0].embedLink || `https://player.vimeo.com/video/${(post as any).videos[0].vimeoId}`}
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title={post.title}
              />
            </div>
          ) : Array.isArray((post as any).images) && (post as any).images.length > 0 ? (
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
            {/* Category Badge - Clickable */}
            <div className="mb-4">
              <button
                onClick={() => router.push(`/feeds/biz-pulse?category=${post.category}`)}
                className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 hover:bg-indigo-200 text-sm rounded-full font-medium transition-colors cursor-pointer"
              >
                {post.category
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </button>
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
                {/* Like Button + Instagram-style Text */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLike}
                    disabled={isLiking}
                    className={`p-1 rounded-full transition-all hover:scale-110 ${post.isLiked ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
                      } ${isLiking ? "opacity-50 cursor-not-allowed" : ""}`}
                    title={post.isLiked ? "Unlike" : "Like"}
                  >
                    <ThumbsUp className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`} />
                  </button>
                  <button
                    onClick={() => (post.stats?.likes || 0) > 0 && setIsLikesModalOpen(true)}
                    className={`text-sm ${(post.stats?.likes || 0) > 0 ? "hover:text-blue-600 cursor-pointer" : "text-gray-500 cursor-default"}`}
                  >
                    {(() => {
                      const likeCount = post.stats?.likes || 0;
                      if (likeCount === 0) return <span className="text-gray-500">Be the first to like</span>;

                      const currentUserId = currentUser?._id || currentUser?.id;

                      // Get the most recent liker's name (check if it's current user)
                      const recentLike = likesArray[likesArray.length - 1];
                      let recentLikerName = "Someone";
                      let isRecentLikerCurrentUser = false;

                      if (recentLike?.userId && typeof recentLike.userId === "object") {
                        const user = recentLike.userId as any;
                        const likerUserId = user._id || user.id;
                        isRecentLikerCurrentUser = likerUserId === currentUserId;
                        recentLikerName = isRecentLikerCurrentUser
                          ? "you"
                          : `${user.fname || ""} ${user.lname || ""}`.trim() || "Someone";
                      }

                      if (likeCount === 1) {
                        return <span>Liked by <span className="font-semibold">{recentLikerName}</span></span>;
                      } else {
                        const othersCount = likeCount - 1;
                        return (
                          <span>
                            Liked by <span className="font-semibold">{recentLikerName}</span>
                            {" and "}
                            <span className="font-semibold">{othersCount} {othersCount === 1 ? "other" : "others"}</span>
                          </span>
                        );
                      }
                    })()}
                  </button>
                </div>
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
                <div className="flex-1 space-y-3 relative">
                  <textarea
                    ref={(ref) => setTextareaRef(ref)}
                    value={newComment}
                    onChange={handleCommentTextChange}
                    onKeyDown={handleCommentKeyDown}
                    placeholder="Share your thoughts... (type @ to mention someone)"
                    disabled={isSubmitting}
                    className="w-full p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />

                  {/* Mention Autocomplete Dropdown */}
                  {showMentionDropdown && textareaRef && (
                    <MentionAutocomplete
                      users={mentionUsers}
                      loading={mentionLoading}
                      onSelect={handleMentionSelect}
                      selectedIndex={selectedMentionIndex}
                      onClose={() => setShowMentionDropdown(false)}
                      position={{
                        top: textareaRef.offsetHeight + 8,
                        left: 0,
                      }}
                    />
                  )}
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
                {commentTree.length > 0 ? (
                  commentTree.map((comment: any) => (
                    <CommentItem
                      key={comment._id || comment.id}
                      comment={comment}
                      depth={0}
                      currentUserId={currentUser?._id || currentUser?.id}
                      currentUserRole={currentUser?.role}
                      onReply={handleReply}
                      onEdit={handleEditComment}
                      onDelete={handleDeleteComment}
                      onLike={handleLikeComment}
                    />
                  ))
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

      {/* Likes Modal */}
      <LikesModal
        isOpen={isLikesModalOpen}
        onClose={() => setIsLikesModalOpen(false)}
        likes={likesArray}
      />
    </div>
  );
}
