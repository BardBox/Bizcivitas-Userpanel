"use client";

import { useSelector, useDispatch } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { Heart, MessageSquare, Share2, ArrowLeft, MoreVertical, Flag } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
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
  const enableCommentReporting = false; // temporarily disable reporting UI
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
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isEditingCommentId, setIsEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openMenuId) setOpenMenuId(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  // Fetch post data if not in Redux (on page refresh)
  useEffect(() => {
    const fetchPostIfNeeded = async () => {
      // Only fetch if post is not in Redux
      if (!post && postId) {
        console.log("Fetching post with ID:", postId);
        setIsLoading(true);
        try {
          const response = await bizpulseApi.fetchWallFeedById(postId);
          console.log("API Response:", response);
          if (response.success && response.data) {
            // Extract wallFeed from response.data (API wraps it in wallFeed property)
            const postData = (response.data as any).wallFeed || response.data;
            console.log("Post data to transform:", postData);
            const transformedPost = transformBizPulsePostToMock(postData);
            console.log("Transformed post:", transformedPost);
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
        console.log("Post already in Redux or no postId", { post: !!post, postId });
      }
    };

    fetchPostIfNeeded();
  }, [postId, post, dispatch]);

  // Show loading state while fetching
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

  // Return null while loading (shouldn't reach here but safety check)
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

  const handleLike = async () => {
    if (isLiking || !post) return;

    // Optimistic update - immediately update UI
    const currentLikeStatus = isLiked;
    setIsLiked(!isLiked);

    // Update the post in Redux with optimistic like count
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

        // Preserve the image from the current post if the API doesn't return it
        if (!transformedPost.image && post.image) {
          transformedPost.image = post.image;
        }
        
        dispatch(updatePost(transformedPost));
      }
    } catch (error) {
      console.error("Failed to like post:", error);
      toast.error("Failed to update like status");

      // Revert optimistic update on error
      setIsLiked(currentLikeStatus);
      dispatch(updatePost(post));
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    const commentText = newComment.trim();

    // Get current user's info for optimistic update
    const currentUserName = currentUser
      ? `${currentUser.fname || ""} ${currentUser.lname || ""}`.trim()
      : "You";
    const currentUserId = currentUser?._id || currentUser?.id || "temp-user";
    const currentUserAvatar = currentUser?.avatar || null;

    // Create optimistic comment with real user data
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

    // Clear input immediately
    setNewComment("");

    try {
      // Add optimistic comment to UI immediately with real user avatar
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

      // Submit to backend
      await bizpulseApi.addComment(postId, commentText);

      // Small delay to ensure backend has processed the comment
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Fetch only this post's updated data (not the whole app)
      const updatedPost = await bizpulseApi.fetchWallFeedById(postId);
      if (updatedPost.success && updatedPost.data) {
        const postData = (updatedPost.data as any).wallFeed || updatedPost.data;
        const transformedPost = transformBizPulsePostToMock(postData);

        // Preserve the image from the current post if the API doesn't return it
        if (!transformedPost.image && post.image) {
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

      // Revert optimistic update on error
      const revertedPost = await bizpulseApi.fetchWallFeedById(postId);
      if (revertedPost.success && revertedPost.data) {
        const postData = (revertedPost.data as any).wallFeed || revertedPost.data;
        const transformedPost = transformBizPulsePostToMock(postData);
        dispatch(updatePost(transformedPost));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportComment = async (reason: string) => {
    if (!reportingCommentId) return;
    const isValidObjectId = /^[a-fA-F0-9]{24}$/.test(reportingCommentId);
    if (!isValidObjectId) {
      toast.error("Cannot report this comment until it’s synced. Please refresh.");
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
        toast.success("Comment reported successfully. It has been hidden from your view.");
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
      toast.error("Cannot report this comment until it’s synced. Please refresh.");
      return;
    }
    setReportingCommentId(commentId);
    setIsReportModalOpen(true);
    setOpenMenuId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with breadcrumb */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button onClick={() => router.back()} className="flex items-center hover:text-blue-600 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Biz Hub
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
  {/* Hero Image(s) - Use carousel if multiple images exist */}
  {Array.isArray((post as any).images) && (post as any).images.length > 0 ? (
    <ImageCarousel
      images={(post as any).images}
      alt={post.title}
    />
  ) : post.image ? (
    <div className="w-full h-96 relative overflow-hidden">
      <img
        src={post.image}
        alt={post.title}
        className="w-full h-full object-cover"
      />
    </div>
  ) : null}

  {/* Article Content */}
  <div className="px-6 py-8 sm:px-8 sm:py-10">
    {/* Category Badge */}
    <div className="mb-4">
      <span className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full font-medium">
        {post.category
          .replace("-", " ")
          .replace(/\b\w/g, (l) => l.toUpperCase())}
      </span>
    </div>

    {/* Title */}
    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
      {post.title}
    </h1>

    {/* Meta Info */}
    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
      <span className="flex items-center">
        <MessageSquare className="w-4 h-4 mr-1" />
        {post.stats.comments} comments
      </span>
      <span>•</span>
      <span>{post.timeAgo}</span>
    </div>

    {/* Article Content */}
    <div className="prose prose-lg max-w-none text-gray-700 mb-8">
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>

    {/* Action Buttons */}
    <div className="flex items-center space-x-4 py-6 border-y border-gray-200">
      <button
        onClick={handleLike}
        disabled={isLiking}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
          isLiked
            ? "bg-red-50 text-red-600 hover:bg-red-100"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLiking ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
        )}
        <span className="font-medium">
          {post.stats.likes} {isLiked ? "Liked" : "Like"}
        </span>
      </button>

      <button className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all">
        <Share2 className="w-5 h-5" />
        <span className="font-medium">Share</span>
      </button>
    </div>

    {/* Comment Form */}
    <div className="py-8">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Add a Comment
      </h3>
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
        <div className="flex-1">
          <div className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              disabled={isSubmitting}
              className={`w-full p-4 border rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                error ? "border-red-300" : "border-gray-300"
              } ${isSubmitting ? "bg-gray-50" : ""}`}
              rows={3}
            />
            <button
              onClick={handleCommentSubmit}
              disabled={!newComment.trim() || isSubmitting}
              className={`absolute bottom-4 right-4 px-4 py-2 rounded-lg font-medium transition-all ${
                isSubmitting || !newComment.trim()
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
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>

    {/* Comments Section */}
    <div className="border-t border-gray-200 pt-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Comments ({post.stats.comments})
      </h3>

      <div className="space-y-6">
        {post.comments && post.comments.length > 0 ? (
          post.comments.map((comment) => {
            const isCurrentUserComment =
              comment.author.id === (currentUser?._id || currentUser?.id);
            const commentProfileUrl = isCurrentUserComment
              ? "/feeds/myprofile"
              : `/feeds/connections/${comment.author.id}?from=connect-members`;

            return (
              <div
                key={comment.id}
                className="flex space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
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
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={commentProfileUrl}
                        className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {comment.author.name}
                      </Link>
                      <span className="text-xs text-gray-500">
                        • {comment.timeAgo}
                      </span>
                    </div>
                    {/* Comment menu (edit/delete/report) stays same */}
                    {/* ... */}
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
                              await bizpulseApi.editComment(
                                postId,
                                comment.id,
                                editingContent.trim()
                              );
                              const refreshed =
                                await bizpulseApi.fetchWallFeedById(postId);
                              if (refreshed.success && refreshed.data) {
                                const postData =
                                  (refreshed.data as any).wallFeed ||
                                  refreshed.data;
                                const transformedPost =
                                  transformBizPulsePostToMock(postData);
                                if (!transformedPost.image && post.image) {
                                  transformedPost.image = post.image;
                                }
                                dispatch(updatePost(transformedPost));
                                toast.success("Comment updated");
                              }
                            } catch (err) {
                              console.error("Failed to update comment", err);
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
