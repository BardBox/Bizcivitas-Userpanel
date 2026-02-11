"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import { getAvatarUrl } from "@/utils/Feeds/connections/userHelpers";
import toast from "react-hot-toast";
import { parseMentions } from "@/utils/parseMentions";
import { useUserSearch } from "@/hooks/useUserSearch";
import { useTimeAgo } from "@/utils/timeAgo";

interface CommentItemProps {
  comment: any;
  depth: number;
  currentUserId?: string;
  currentUserRole?: string;
  onReply: (commentId: string, content: string, mentions?: string[]) => Promise<void>;
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

  // Mention autocomplete state for reply
  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionStartIndex, setMentionStartIndex] = useState(0);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [mentionedUsers, setMentionedUsers] = useState<{ id: string; username: string }[]>([]);
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);

  const { users: mentionUsers } = useUserSearch(showMentionDropdown ? mentionQuery : "");

  // Get author data
  const author = comment.userId || comment.author;
  const authorId = author._id || author.id;
  const authorName = author.name || `${author.fname || ""} ${author.lname || ""}`.trim();
  const authorAvatar = author.avatar;

  // Dynamic time ago
  const dynamicTimeAgo = useTimeAgo(comment.createdAt || comment.timestamp);

  const isCurrentUser = authorId === currentUserId;
  const isAdmin = ["admin", "master-franchise", "area-franchise", "dcp", "cgc"].includes(
    currentUserRole || ""
  );
  const canEdit = isCurrentUser;
  const canDelete = isCurrentUser || isAdmin;

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
      const mentions = mentionedUsers.map((u) => u.id);
      await onReply(comment._id || comment.id, replyText, mentions.length > 0 ? mentions : undefined);
      setReplyText("");
      setIsReplying(false);
      setMentionedUsers([]);
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
    } catch (error) {
      console.error("Failed to delete comment:", error);
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

  // Mention detection in reply textarea
  const handleReplyTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const cursorPos = e.target.selectionStart;
    setReplyText(text);

    const textBeforeCursor = text.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      if (!textAfterAt.includes(" ") && textAfterAt.length >= 0) {
        setMentionQuery(textAfterAt);
        setMentionStartIndex(lastAtIndex);
        setShowMentionDropdown(true);
        setSelectedMentionIndex(0);
        return;
      }
    }

    setShowMentionDropdown(false);
  };

  // Handle mention selection
  const handleMentionSelect = (user: any) => {
    const textarea = replyTextareaRef.current;
    if (!textarea) return;

    const displayName = `${user.fname} ${user.lname}`.trim() || user.username || "User";
    const beforeMention = replyText.substring(0, mentionStartIndex);
    const afterMention = replyText.substring(textarea.selectionStart);
    const newText = `${beforeMention}@${displayName} ${afterMention}`;

    setReplyText(newText);
    setShowMentionDropdown(false);
    setMentionedUsers([...mentionedUsers, { id: user.id, username: displayName }]);

    setTimeout(() => {
      if (textarea) {
        const newCursorPos = beforeMention.length + displayName.length + 2;
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Keyboard navigation for mention dropdown
  const handleReplyKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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

  const isReply = depth > 0;
  const parentAuthorName = comment.parentAuthorName || null;

  return (
    <div className={`${isReply ? "mt-1" : "mb-3"}`}>
      <div
        className={`flex space-x-3 ${
          isReply
            ? "ml-10 pl-3 py-2.5 border-l-2 border-blue-200 bg-gray-50/60 rounded-r-lg"
            : "p-3 bg-white rounded-lg border border-gray-200"
        }`}
      >
        <Link href={profileUrl} className="flex-shrink-0">
          <Avatar
            src={getAvatarUrl(authorAvatar)}
            alt={authorName}
            size={isReply ? "xs" : "sm"}
            fallbackText={authorName}
            showMembershipBorder={false}
            className="cursor-pointer"
          />
        </Link>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={profileUrl}
                className={`font-semibold hover:text-blue-600 transition-colors ${
                  isReply ? "text-xs text-gray-800" : "text-sm text-gray-900"
                }`}
              >
                {authorName}
              </Link>
              <span className={`text-gray-400 ${isReply ? "text-[10px]" : "text-xs"}`}>
                {dynamicTimeAgo}
              </span>
              {isReply && parentAuthorName && (
                <span className="text-[10px] text-gray-400">
                  <svg className="w-3 h-3 inline -mt-0.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v6M3 10l6 6M3 10l6-6" />
                  </svg>
                  {parentAuthorName}
                </span>
              )}
            </div>

            {/* Edit/Delete Buttons */}
            {(canEdit || canDelete) && !isEditing && (
              <div className="flex gap-1 ml-2">
                {canEdit && (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setEditContent(comment.content || "");
                    }}
                    className="text-gray-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50 transition-colors"
                    title="Edit comment"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                    className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Delete comment"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
                rows={2}
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
              <p className={`text-gray-700 mt-0.5 whitespace-pre-wrap break-words ${isReply ? "text-xs" : "text-sm"}`}>
                {parseMentions(comment.content, comment.mentions)}
              </p>

              {/* Image */}
              {comment.mediaUrl && (
                <img
                  src={comment.mediaUrl}
                  alt="Comment attachment"
                  className="mt-2 rounded-lg max-w-full h-auto"
                  style={{ maxHeight: "200px" }}
                />
              )}

              {/* Actions (Like, Reply) */}
              <div className={`flex items-center gap-3 mt-1.5 text-gray-500 ${isReply ? "text-[11px]" : "text-xs"}`}>
                <button
                  onClick={handleLikeClick}
                  className={`flex items-center gap-1 hover:text-blue-600 transition-colors ${
                    comment.isLiked ? "text-blue-600 font-semibold" : ""
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill={comment.isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  <span>{comment.likeCount || 0}</span>
                </button>

                <button
                  onClick={() => setIsReplying(!isReplying)}
                  className="hover:text-blue-600 transition-colors font-medium"
                >
                  Reply
                </button>
              </div>
            </>
          )}

          {/* Reply Form with Mention Autocomplete */}
          {isReplying && (
            <div className="mt-2 p-2.5 bg-white rounded-lg border border-gray-200">
              <div className="flex space-x-2">
                <Avatar
                  src={getAvatarUrl(undefined)}
                  alt="You"
                  size="xs"
                  fallbackText="You"
                  showMembershipBorder={false}
                />
                <div className="flex-1 space-y-2 relative">
                  <textarea
                    ref={replyTextareaRef}
                    value={replyText}
                    onChange={handleReplyTextChange}
                    onKeyDown={handleReplyKeyDown}
                    placeholder={`Reply to ${authorName}... (type @ to mention)`}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-xs bg-gray-50"
                  />

                  {/* Mention Dropdown */}
                  {showMentionDropdown && mentionUsers.length > 0 && (
                    <div className="absolute bottom-full left-0 mb-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                      {mentionUsers.map((user: any, index: number) => (
                        <button
                          key={user.id}
                          onClick={() => handleMentionSelect(user)}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-blue-50 transition-colors ${
                            index === selectedMentionIndex ? "bg-blue-50" : ""
                          }`}
                        >
                          <Avatar
                            src={getAvatarUrl(user.avatar)}
                            alt={`${user.fname} ${user.lname}`}
                            size="xs"
                            fallbackText={`${user.fname} ${user.lname}`}
                            showMembershipBorder={false}
                          />
                          <div>
                            <span className="font-medium text-gray-900">
                              {user.fname} {user.lname}
                            </span>
                            {user.username && (
                              <span className="text-gray-400 ml-1">@{user.username}</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={handleReplySubmit}
                      disabled={isSubmitting || !replyText.trim()}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        isSubmitting || !replyText.trim()
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {isSubmitting ? "Sending..." : "Reply"}
                    </button>
                    <button
                      onClick={() => {
                        setIsReplying(false);
                        setReplyText("");
                        setMentionedUsers([]);
                        setShowMentionDropdown(false);
                      }}
                      disabled={isSubmitting}
                      className="px-3 py-1 text-gray-500 rounded-full text-xs hover:bg-gray-100 disabled:opacity-50"
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
        <div className="mt-0.5">
          {comment.children.map((child: any) => (
            <CommentItem
              key={child._id || child.id}
              comment={{ ...child, parentAuthorName: authorName }}
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
