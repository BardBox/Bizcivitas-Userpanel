"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ThumbsUp, MessageSquare, Home, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { getAbsoluteImageUrl } from "@/utils/imageUtils";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../../store/store";
import {
  useGetBizHubPostByIdQuery,
  useLikeBizHubPostMutation,
  useAddBizHubCommentMutation,
  useEditBizHubCommentMutation,
  useDeleteBizHubCommentMutation,
  useLikeBizHubCommentMutation,
  useDeleteBizHubPostMutation,
} from "../../../../../store/api/bizpulseApi";
import { reportApi } from "@/services/reportApi";
import ReportModal from "@/components/modals/ReportModal";
import LikesModal from "@/components/modals/LikesModal";
import HtmlContent from "@/components/HtmlContent";
import ImageCarousel from "@/components/ImageCarousel";
import Avatar from "@/components/ui/Avatar";
import PostNotAvailable from "@/components/ui/PostNotAvailable";
import { buildCommentTree } from "@/utils/buildCommentTree";
import CommentItem from "@/components/CommentItem";
import { useUserSearch } from "@/hooks/useUserSearch";
import MentionAutocomplete from "@/components/MentionAutocomplete";

// Utility functions
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
};

const formatCategory = (type: string): string => {
  if (!type) return "";
  return type
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Helper function to get full avatar URL
const getAvatarUrl = (avatarPath?: string | null) => {
  if (!avatarPath) return "/favicon.ico"; // Fallback to favicon
  if (avatarPath.startsWith("http")) return avatarPath;
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  return `${baseUrl}/image/${avatarPath}`;
};

export default function BizHubPostDetail() {
  const params = useParams();
  const router = useRouter();
  const postId = params?.id as string;

  const { data: post, isLoading, error } = useGetBizHubPostByIdQuery(postId);
  const [likeBizHubPost] = useLikeBizHubPostMutation();
  const [addBizHubComment, { isLoading: submittingComment }] = useAddBizHubCommentMutation();
  const [editBizHubComment] = useEditBizHubCommentMutation();
  const [deleteBizHubComment] = useDeleteBizHubCommentMutation();
  const [likeBizHubComment] = useLikeBizHubCommentMutation();
  const [deleteBizHubPost] = useDeleteBizHubPostMutation();

  const userId = useSelector((state: RootState) => state.auth.user?._id);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);

  // Mention autocomplete state
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStartIndex, setMentionStartIndex] = useState(0);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [mentionedUsers, setMentionedUsers] = useState<Array<{id: string, username: string}>>([]);
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null);

  // Use the user search hook
  const { users: mentionUsers, loading: mentionLoading } = useUserSearch(mentionQuery);

  // Debug: Log when dropdown state changes
  useEffect(() => {
    console.log("🎯 Mention State:", {
      showMentionDropdown,
      mentionQuery,
      mentionUsers: mentionUsers.length,
      mentionLoading,
      textareaRef: !!textareaRef,
    });
  }, [showMentionDropdown, mentionQuery, mentionUsers, mentionLoading, textareaRef]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState<"comment" | "post">("comment");
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showPostMenu, setShowPostMenu] = useState(false);
  const [isLikesModalOpen, setIsLikesModalOpen] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ label: string; path: string }>>([
    { label: "Home", path: "/feeds" },
    { label: "BizHub", path: "/feeds/biz-hub" },
  ]);

  // Get likes array from post data
  const likesArray = useMemo(() => {
    return (post?.likes || []);
  }, [post]);

  // Determine breadcrumbs based on referrer and post type
  useEffect(() => {
    if (typeof window !== "undefined" && post) {
      const referrer = document.referrer;
      const postType = post.type;

      if (referrer.includes("/feeds/biz-hub")) {
        setBreadcrumbs([
          { label: "Home", path: "/feeds" },
          { label: "BizHub", path: "/feeds/biz-hub" },
          ...(postType ? [{ label: formatCategory(postType), path: `/feeds/biz-hub?type=${postType}` }] : []),
        ]);
      } else if (referrer.includes("/feeds/biz-pulse")) {
        setBreadcrumbs([
          { label: "Home", path: "/feeds" },
          { label: "BizPulse", path: "/feeds/biz-pulse" },
        ]);
      } else {
        setBreadcrumbs([
          { label: "Home", path: "/feeds" },
          { label: "BizHub", path: "/feeds/biz-hub" },
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

  // Handle mention detection in textarea
  const handleCommentTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log("⚡ handleCommentTextChange CALLED! Value:", e.target.value);
    const text = e.target.value;
    const cursorPos = e.target.selectionStart;
    setCommentText(text);

    // Find "@" before cursor
    const textBeforeCursor = text.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    console.log("🔍 Mention Detection:", {
      text,
      cursorPos,
      lastAtIndex,
      textBeforeCursor,
    });

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      console.log("📝 Text after @:", textAfterAt, "length:", textAfterAt.length);

      // Check if there's no space after @ (still typing the mention)
      if (!textAfterAt.includes(" ") && textAfterAt.length >= 0) {
        console.log("✅ Showing mention dropdown, query:", textAfterAt);
        setMentionQuery(textAfterAt);
        setMentionStartIndex(lastAtIndex);
        setShowMentionDropdown(true);
        setSelectedMentionIndex(0);
        return;
      }
    }

    // Hide dropdown if no @ or conditions not met
    console.log("❌ Hiding mention dropdown");
    setShowMentionDropdown(false);
  };

  // Handle mention selection
  const handleMentionSelect = (user: any) => {
    if (!textareaRef) return;

    // Use full name (FirstName LastName) instead of username
    const displayName = `${user.fname} ${user.lname}`.trim() || user.username || user.name || 'User';
    const beforeMention = commentText.substring(0, mentionStartIndex);
    const afterMention = commentText.substring(textareaRef.selectionStart);
    const newText = `${beforeMention}@${displayName} ${afterMention}`;

    setCommentText(newText);
    setShowMentionDropdown(false);
    setMentionedUsers([...mentionedUsers, { id: user.id, username: displayName }]);

    // Focus textarea and move cursor after mention
    setTimeout(() => {
      if (textareaRef) {
        const newCursorPos = beforeMention.length + displayName.length + 2; // +2 for @ and space
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

  const handleLike = async () => {
    if (postId) {
      try {
        await likeBizHubPost(postId).unwrap();
      } catch (error) {
        console.error("Failed to like post:", error);
      }
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !postId) return;

    try {
      const mentions = mentionedUsers.map(u => u.id);
      console.log("💬 Posting comment with mentions:", {
        content: commentText.trim(),
        mentionedUsers,
        mentionIds: mentions,
      });
      await addBizHubComment({
        postId,
        content: commentText.trim(),
        ...(mentions.length > 0 && { mentions })
      }).unwrap();
      setCommentText("");
      setMentionedUsers([]);
      toast.success("Comment added!");
    } catch (err) {
      console.error("Failed to add comment:", err);
      toast.error("Failed to add comment. Please try again.");
    }
  };

  const handleReply = async (parentCommentId: string, content: string) => {
    if (!content.trim() || !postId) return;

    try {
      await addBizHubComment({
        postId,
        content: content.trim(),
        parentCommentId
      }).unwrap();
      toast.success("Reply added!");
    } catch (err) {
      console.error("Failed to add reply:", err);
      toast.error("Failed to add reply. Please try again.");
      throw err;
    }
  };

  const handleEditComment = async (commentId: string, content: string) => {
    if (!content.trim() || !postId) return;

    try {
      await editBizHubComment({
        postId,
        commentId,
        content: content.trim(),
      }).unwrap();
      toast.success("Comment updated!");
    } catch (err) {
      console.error("Failed to edit comment:", err);
      toast.error("Failed to update comment.");
      throw err;
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!postId || !confirm("Are you sure you want to delete this comment?")) return;

    try {
      await deleteBizHubComment({ postId, commentId }).unwrap();
      toast.success("Comment deleted!");
    } catch (err) {
      console.error("Failed to delete comment:", err);
      toast.error("Failed to delete comment.");
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!postId) return;

    try {
      await likeBizHubComment({ postId, commentId }).unwrap();
    } catch (err) {
      console.error("Failed to like comment:", err);
    }
  };

  const handleOpenReportModal = (commentId: string) => {
    setReportingCommentId(commentId);
    setReportType("comment");
    setIsReportModalOpen(true);
  };

  const handleOpenReportPostModal = () => {
    setReportingPostId(postId);
    setReportType("post");
    setIsReportModalOpen(true);
  };

  const handleReportSubmit = async (reason: string) => {
    if (!postId) return;

    try {
      if (reportType === "comment" && reportingCommentId) {
        await reportApi.reportComment({
          commentId: reportingCommentId,
          postId: postId,
          reason: reason as any,
        });
        toast.success("Comment reported successfully.");
      } else if (reportType === "post" && reportingPostId) {
        await reportApi.reportPost({
          postId: reportingPostId,
          reason: reason as any,
        });
        toast.success("Post reported successfully.");
      }
    } catch (err: any) {
      toast.error(err.message || `Failed to report ${reportType}`);
      console.error(`Failed to report ${reportType}:`, err);
    } finally {
      setReportingCommentId(null);
      setReportingPostId(null);
      setIsReportModalOpen(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!postId) return;

    try {
      await deleteBizHubPost(postId).unwrap();
      toast.success("Post deleted successfully");
      setIsDeleteModalOpen(false);
      router.push("/feeds/biz-hub");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete post");
      console.error("Failed to delete post:", err);
    }
  };

  const handleEditPost = () => {
    if (!post) return;
    router.push(`/feeds/biz-hub/create?edit=${postId}`);
  };

  // Determine if current user is the post owner
  const isPostOwner = post?.user?._id === userId || post?.userId?._id === userId;

  // Memoize comments
  const memoizedComments = useMemo(() => {
    return post?.comments || [];
  }, [post?.comments]);

  // Group comments into top-level and replies
  const commentTree = useMemo(() => {
    return buildCommentTree(memoizedComments);
  }, [memoizedComments]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <PostNotAvailable
        reason="not-found"
        errorMessage="Post not found or unavailable."
        onGoBack={() => router.back()}
      />
    );
  }

  if (!post) {
    return (
      <div className="p-8 text-center text-gray-500">
        Post not found.
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg block mx-auto"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Safe access to user data with fallbacks
  const userName = post.userId?.name || post.user?.name || "Unknown User";
  const userAvatar = post.userId?.avatar || post.user?.avatar || "";
  const userClassification = post.userId?.classification || post.user?.classification || "Member";
  const postAuthorId = post.userId?._id || post.user?._id;

  const authorProfileUrl = isPostOwner
    ? "/feeds/myprofile"
    : `/feeds/connections/${postAuthorId}?from=connect-members`;

  return (
    <div className="min-h-screen bg-gray-50">
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
      <div className="max-w-4xl mx-auto px-2 md:px-4 py-8 space-y-6">
        {/* Post Card */}
        <div className="bg-white rounded-lg shadow p-2 space-y-4">
          {/* Author Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={authorProfileUrl}>
                <Avatar
                  src={userAvatar}
                  alt={userName}
                  size="md"
                  fallbackText={userName}
                  showMembershipBorder={false}
                  className="cursor-pointer"
                />
              </Link>
              <div>
                <Link
                  href={authorProfileUrl}
                  className="text-[13px] font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                >
                  {userName}
                </Link>
                <div className="text-[11px] text-gray-500">
                  {userClassification}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm hidden md:block text-gray-400">
                {post.timeAgo}
              </span>

              {/* Three-dot menu for post owner */}
              {isPostOwner && (
                <div className="relative">
                  <button
                    onClick={() => setShowPostMenu(!showPostMenu)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    title="Post options"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                  </button>

                  {showPostMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowPostMenu(false)} />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                        <button
                          onClick={() => {
                            setShowPostMenu(false);
                            handleEditPost();
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          Edit Post
                        </button>
                        <button
                          onClick={() => {
                            setShowPostMenu(false);
                            setIsDeleteModalOpen(true);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          Delete Post
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {!isPostOwner && (
                <button
                  onClick={handleOpenReportPostModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Report post"
                >
                  <svg className="w-5 h-5 text-gray-500 hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <div className="flex justify-between">
            <span className="inline-block bg-gray-900 text-white px-2 py-1 md:px-3 md:py-2 rounded-full text-[11px] font-medium">
              {formatCategory(post.type)}
            </span>
            <span className="text-sm md:hidden text-gray-400">
              {post.timeAgo}
            </span>
          </div>

          <h1 className="text-lg font-semibold text-gray-900">{post.title}</h1>

          {post.mediaUrls && post.mediaUrls.length > 0 && (
            <ImageCarousel
              images={post.mediaUrls.map((url: string) => getAbsoluteImageUrl(url) || "/placeholder.jpg")}
              alt={post.title}
            />
          )}

          <HtmlContent
            content={post.description}
            className="text-sm text-gray-700 leading-relaxed"
          />

          {/* Stats Section - Update likes display */}
          <div className="flex items-center gap-6 pt-4 border-t text-gray-700">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 transition-all hover:scale-105 ${post.isLiked ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
                }`}
            >
              <ThumbsUp className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`} />
            </button>

            {/* Instagram-style likes display */}
            <button
              onClick={() => likesArray.length > 0 && setIsLikesModalOpen(true)}
              disabled={likesArray.length === 0}
              className={`text-sm ${
                likesArray.length === 0
                  ? "text-gray-500 cursor-default"
                  : "hover:underline font-medium transition-colors"
              }`}
            >
              {(() => {
                const likeCount = post.likeCount || 0;
                if (likeCount === 0) return <span className="text-gray-500">Be the first to like</span>;

                const currentUserId = currentUser?._id || currentUser?.id;
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

            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gray-400" />
              <span className="font-medium">{post.commentCount || 0} Comments</span>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow p-2 md:p-6 space-y-6 mb-8">
          <h2 id="comments-section" className="text-lg font-bold text-gray-900">
            Comments
          </h2>

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
                value={commentText}
                onChange={handleCommentTextChange}
                onKeyDown={handleCommentKeyDown}
                onClick={() => console.log("🖱️ TEXTAREA CLICKED!")}
                onFocus={() => console.log("🎯 TEXTAREA FOCUSED!")}
                onInput={(e) => console.log("⌨️ ONINPUT FIRED:", (e.target as HTMLTextAreaElement).value)}
                placeholder="Share your thoughts... (type @ to mention someone)"
                rows={3}
                disabled={submittingComment}
                className={`w-full p-4 border rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${submittingComment ? "bg-gray-50" : "border-gray-300"
                  }`}
              />

              {/* Mention Autocomplete Dropdown */}
              {(() => {
                console.log("🔧 Checking render condition:", {
                  showMentionDropdown,
                  hasTextareaRef: !!textareaRef,
                  mentionUsersLength: mentionUsers.length,
                  shouldRender: showMentionDropdown && textareaRef,
                });

                if (showMentionDropdown && textareaRef) {
                  console.log("✅ Rendering MentionAutocomplete component!");
                  return (
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
                  );
                }
                console.log("❌ NOT rendering MentionAutocomplete");
                return null;
              })()}
              <div className="flex justify-end">
                <button
                  onClick={handleAddComment}
                  disabled={!commentText.trim() || submittingComment}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${submittingComment || !commentText.trim()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow"
                    }`}
                >
                  {submittingComment ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {commentTree.length > 0 ? (
              commentTree.map((comment: any) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  depth={0}
                  currentUserId={currentUser?._id}
                  currentUserRole={currentUser?.role}
                  onReply={handleReply}
                  onEdit={handleEditComment}
                  onDelete={handleDeleteComment}
                  onLike={handleLikeComment}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">No comments yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setReportingCommentId(null);
          setReportingPostId(null);
        }}
        onSubmit={handleReportSubmit}
        type={reportType}
      />

      {/* Likes Modal - show users who liked this post */}
      <LikesModal
        isOpen={isLikesModalOpen}
        onClose={() => setIsLikesModalOpen(false)}
        likes={likesArray}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Delete Post?</h3>
            <p className="text-gray-500 mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
