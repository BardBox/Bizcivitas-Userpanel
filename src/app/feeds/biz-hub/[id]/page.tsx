"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { getAbsoluteImageUrl } from "@/utils/imageUtils";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../../../store/store";
import {
  fetchBizHubPostById,
  likeBizHubPost,
  addBizHubComment,
  editBizHubComment,
  deleteBizHubComment,
  likeBizHubComment,
  deleteBizHubPost,
  editBizHubPost,
} from "../../../../../store/bizhubSlice";
import { bizhubApi } from "@/services/bizhubApi";
import ReportModal from "@/components/modals/ReportModal";
import TipTapEditor from "@/components/TipTapEditor";
import HtmlContent from "@/components/HtmlContent";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import ImageCarousel from "@/components/ImageCarousel";
import Avatar from "@/components/ui/Avatar";

// Utility functions
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
};

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

const formatCategory = (type: string): string => {
  return type
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function BizHubPostDetail() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const postId = params?.id as string;

  const { currentPost: post, loading, error } = useSelector(
    (state: RootState) => state.bizhub
  );
  const userId = useSelector((state: RootState) => state.auth.user?._id);

  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState<"comment" | "post">("comment");
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPostMenu, setShowPostMenu] = useState(false);

  useEffect(() => {
    if (postId) {
      dispatch(fetchBizHubPostById(postId));
    }
  }, [dispatch, postId]);


  const handleLike = () => {
    if (postId) {
      dispatch(likeBizHubPost(postId));
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !postId) return;

    try {
      setSubmittingComment(true);
      await dispatch(
        addBizHubComment({ postId, content: commentText })
      ).unwrap();
      setCommentText("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editingCommentText.trim() || !postId) return;

    try {
      await dispatch(
        editBizHubComment({
          postId,
          commentId,
          content: editingCommentText,
        })
      ).unwrap();
      setEditingCommentId(null);
      setEditingCommentText("");
    } catch (err) {
      console.error("Failed to edit comment:", err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!postId || !confirm("Are you sure you want to delete this comment?"))
      return;

    try {
      await dispatch(deleteBizHubComment({ postId, commentId })).unwrap();
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!postId) return;

    try {
      await dispatch(likeBizHubComment({ postId, commentId })).unwrap();
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
        await bizhubApi.reportComment(postId, reportingCommentId, reason);
        toast.success("Comment reported successfully. It will be hidden from your view.");
      } else if (reportType === "post" && reportingPostId) {
        await bizhubApi.reportPost(postId, reason);
        toast.success("Post reported successfully. Thank you for helping keep the community safe.");
      }
      // Refresh post to hide reported content
      dispatch(fetchBizHubPostById(postId));
    } catch (err: any) {
      toast.error(err.message || `Failed to report ${reportType}`);
      console.error(`Failed to report ${reportType}:`, err);
      throw err; // Re-throw to let modal handle the error state
    } finally {
      setReportingCommentId(null);
      setReportingPostId(null);
    }
  };

  const handleOpenDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!postId) return;

    try {
      setIsDeleting(true);
      await dispatch(deleteBizHubPost(postId)).unwrap();
      toast.success("Post deleted successfully");
      setIsDeleteModalOpen(false);
      router.push("/feeds/biz-hub");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete post");
      console.error("Failed to delete post:", err);
      setIsDeleting(false);
    }
  };

  const handleEditPost = () => {
    if (!post) return;
    // Redirect to create page with edit mode
    router.push(`/feeds/biz-hub/create?edit=${postId}`);
  };

  // Determine if current user is the post owner
  const isPostOwner = post?.user?._id === userId || post?.userId?._id === userId;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
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

  const initials = getInitials(userName);
  const avatarColor = getAvatarColor(userName);

  // Determine profile URL for post author
  const authorProfileUrl = isPostOwner
    ? "/feeds/myprofile"
    : `/feeds/connections/${postAuthorId}?from=connect-members`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Post Card */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
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
                className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
              >
                {userName}
              </Link>
              <div className="text-sm text-gray-500">
                {userClassification}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">{post.timeAgo}</span>

            {/* Three-dot menu for post owner */}
            {isPostOwner && (
              <div className="relative">
                <button
                  onClick={() => setShowPostMenu(!showPostMenu)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Post options"
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showPostMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowPostMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                      <button
                        onClick={() => {
                          setShowPostMenu(false);
                          handleEditPost();
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Post
                      </button>
                      <button
                        onClick={() => {
                          setShowPostMenu(false);
                          handleOpenDeleteModal();
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Post
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Show report button for non-owners */}
            {!isPostOwner && (
              <button
                onClick={handleOpenReportPostModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Report post"
              >
                <svg
                  className="w-5 h-5 text-gray-500 hover:text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category Badge */}
        <span className="inline-block bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-medium">
          {formatCategory(post.type)}
        </span>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>

        {/* Images Carousel */}
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <ImageCarousel
            images={post.mediaUrls.map(url => getAbsoluteImageUrl(url) || "/placeholder.jpg")}
            alt={post.title}
          />
        )}

        {/* Description */}
        <HtmlContent
          content={post.description}
          className="text-gray-700 leading-relaxed"
        />

        {/* Actions */}
        <div className="flex items-center gap-6 pt-4 border-t">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 transition-colors ${
              post.isLiked
                ? "text-blue-600"
                : "text-gray-500 hover:text-blue-600"
            }`}
          >
            <svg
              className="w-6 h-6"
              fill={post.isLiked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span className="font-medium">{post.likeCount || 0} Likes</span>
          </button>
          <span className="flex items-center gap-2 text-gray-500">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="font-medium">
              {post.commentCount || 0} Comments
            </span>
          </span>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Comments</h2>

        {/* Add Comment */}
        <div className="flex gap-3">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <button
            onClick={handleAddComment}
            disabled={!commentText.trim() || submittingComment}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed h-fit"
          >
            {submittingComment ? "Posting..." : "Post"}
          </button>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((comment: any) => {
              // Construct name from fname and lname (backend returns these separately)
              const commentAuthorName = comment.userId?.fname && comment.userId?.lname
                ? `${comment.userId.fname} ${comment.userId.lname}`
                : comment.user?.name || "Unknown";

              const commentAuthorId = comment.userId?._id || comment.user?._id;
              const commentAuthorAvatar = comment.userId?.avatar || comment.user?.avatar;
              const isCommentOwner = commentAuthorId === userId;
              const isCommentLiked = comment.likes?.some(
                (like: any) => like.userId === userId
              );

              // Determine profile URL
              const commentProfileUrl = isCommentOwner
                ? "/feeds/myprofile"
                : `/feeds/connections/${commentAuthorId}?from=connect-members`;

              return (
                <div
                  key={comment._id}
                  className="flex gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Link href={commentProfileUrl}>
                    <Avatar
                      src={commentAuthorAvatar}
                      alt={commentAuthorName}
                      size="sm"
                      fallbackText={commentAuthorName}
                      showMembershipBorder={false}
                      className="cursor-pointer"
                    />
                  </Link>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Link
                          href={commentProfileUrl}
                          className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {commentAuthorName}
                        </Link>
                        <div className="text-xs text-gray-400">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {isCommentOwner && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingCommentId(comment._id);
                              setEditingCommentText(comment.content);
                            }}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="Edit comment"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
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

                    {editingCommentId === comment._id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingCommentText}
                          onChange={(e) =>
                            setEditingCommentText(e.target.value)
                          }
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditComment(comment._id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingCommentId(null);
                              setEditingCommentText("");
                            }}
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-700">{comment.content}</p>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleLikeComment(comment._id)}
                            className={`flex items-center gap-1 text-sm ${
                              isCommentLiked
                                ? "text-blue-600"
                                : "text-gray-500 hover:text-blue-600"
                            }`}
                          >
                            <svg
                              className="w-4 h-4"
                              fill={isCommentLiked ? "currentColor" : "none"}
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                              />
                            </svg>
                            {comment.likes?.length || 0}
                          </button>

                          {!isCommentOwner && (
                            <button
                              onClick={() => handleOpenReportModal(comment._id)}
                              className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600"
                              title="Report comment"
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
                                  d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                                />
                              </svg>
                              Report
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500 py-8">
              No comments yet. Be the first to comment!
            </p>
          )}
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone and the post will be permanently removed."
        isDeleting={isDeleting}
      />
    </div>
  );
}
