"use client";

import React, { useState } from "react";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import { getAvatarUrl } from "@/utils/Feeds/connections/userHelpers";
import { toast } from "react-toastify";
import { parseMentions } from "@/utils/parseMentions";

interface CommentAuthor {
  id: string;
  name: string;
  avatar: string | null;
}

interface CommentItemProps {
  comment: any; // Will accept both BizPulseCommentNode and BizHubCommentNode
  depth: number;
  currentUserId?: string;
  currentUserRole?: string;
  onReply: (commentId: string, content: string) => Promise<void>;
  onEdit: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onLike: (commentId: string) => Promise<void>;
  isDeleting?: boolean;
}

export default function CommentItem({
  comment,
  depth,
  currentUserId,
  currentUserRole,
  onReply,
  onEdit,
  onDelete,
  onLike,
  isDeleting = false,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content || "");
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get author data (handle both BizPulse and BizHub formats)
  const author = comment.userId || comment.author;
  const authorId = author._id || author.id;
  const authorName = author.name || `${author.fname || ""} ${author.lname || ""}`.trim();
  const authorAvatar = author.avatar;

  const isCurrentUser = authorId === currentUserId;
  const isAdmin = ["admin", "master-franchise", "area-franchise", "dcp", "cgc"].includes(
    currentUserRole || ""
  );
  const canEdit = isCurrentUser;
  const canDelete = isCurrentUser || isAdmin;

  // Calculate indentation (cap at 5 levels = 60px)
  const maxDepth = 5;
  const cappedDepth = Math.min(depth, maxDepth);
  const marginLeft = cappedDepth * 12; // 12px per level

  const profileUrl = isCurrentUser
    ? "/feeds/myprofile"
    : `/feeds/connections/${authorId}?from=connect-members`;

  const handleEditSubmit = async () => {
    if (!editContent.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setIsSubmitting(true);
    try {
      await onEdit(comment._id || comment.id, editContent);
      setIsEditing(false);
      toast.success("Comment updated");
    } catch (error) {
      console.error("Failed to edit comment:", error);
      toast.error("Failed to update comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }

    setIsSubmitting(true);
    try {
      await onReply(comment._id || comment.id, replyText);
      setReplyText("");
      setIsReplying(false);
      toast.success("Reply added");
    } catch (error) {
      console.error("Failed to add reply:", error);
      toast.error("Failed to add reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await onDelete(comment._id || comment.id);
      toast.success("Comment deleted");
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  const handleLikeClick = async () => {
    try {
      await onLike(comment._id || comment.id);
    } catch (error) {
      console.error("Failed to like comment:", error);
      toast.error("Failed to like comment");
    }
  };

  return (
    <div style={{ marginLeft: `${marginLeft}px` }} className="mb-3">
      <div className="flex space-x-3 p-3 bg-white rounded-lg border border-gray-200">
        <Link href={profileUrl}>
          <Avatar
            src={getAvatarUrl(authorAvatar)}
            alt={authorName}
            size={depth === 0 ? "sm" : "xs"}
            fallbackText={authorName}
            showMembershipBorder={false}
            className="cursor-pointer"
          />
        </Link>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-1">
            <div className="flex flex-col">
              <Link
                href={profileUrl}
                className="font-semibold text-sm text-gray-900 hover:text-blue-600 transition-colors"
              >
                {authorName}
              </Link>
              <span className="text-xs text-gray-500">{comment.timeAgo || "Just now"}</span>
            </div>

            {/* Edit/Delete Buttons */}
            {(canEdit || canDelete) && !isEditing && (
              <div className="flex gap-2">
                {canEdit && (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setEditContent(comment.content || "");
                    }}
                    className="text-blue-600 hover:text-blue-700 p-1"
                    title="Edit comment"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                    className="text-red-600 hover:text-red-700 p-1 disabled:opacity-50"
                    title="Delete comment"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Content or Edit Form */}
          {isEditing ? (
            <div className="space-y-2 mt-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleEditSubmit}
                  disabled={isSubmitting || !editContent.trim()}
                  className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                    isSubmitting || !editContent.trim()
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content || "");
                  }}
                  disabled={isSubmitting}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap break-words">
                {(() => {
                  console.log("🔍 Comment mentions debug:", {
                    content: comment.content,
                    mentions: comment.mentions,
                    mentionsLength: comment.mentions?.length || 0,
                  });
                  return parseMentions(comment.content, comment.mentions);
                })()}
              </p>

              {/* Image */}
              {comment.mediaUrl && (
                <img
                  src={comment.mediaUrl}
                  alt="Comment attachment"
                  className="mt-2 rounded-lg max-w-full h-auto"
                  style={{ maxHeight: "300px" }}
                />
              )}

              {/* Actions (Like, Reply) */}
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                <button
                  onClick={handleLikeClick}
                  className={`flex items-center gap-1 hover:text-blue-600 transition-colors ${
                    comment.isLiked ? "text-blue-600 font-semibold" : ""
                  }`}
                >
                  <svg className="w-4 h-4" fill={comment.isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  <span>{comment.likeCount || 0}</span>
                </button>

                <button
                  onClick={() => setIsReplying(!isReplying)}
                  className="hover:text-blue-600 transition-colors"
                >
                  Reply
                </button>
              </div>
            </>
          )}

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="flex space-x-2">
                <Avatar
                  src={getAvatarUrl(null)}
                  alt="You"
                  size="xs"
                  fallbackText="You"
                  showMembershipBorder={false}
                />
                <div className="flex-1 space-y-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${authorName}...`}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleReplySubmit}
                      disabled={isSubmitting || !replyText.trim()}
                      className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                        isSubmitting || !replyText.trim()
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {isSubmitting ? "Sending..." : "Reply"}
                    </button>
                    <button
                      onClick={() => {
                        setIsReplying(false);
                        setReplyText("");
                      }}
                      disabled={isSubmitting}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recursively render children */}
      {comment.children && comment.children.length > 0 && (
        <div className="mt-2">
          {comment.children.map((child: any) => (
            <CommentItem
              key={child._id || child.id}
              comment={child}
              depth={depth + 1}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onLike={onLike}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}
    </div>
  );
}
