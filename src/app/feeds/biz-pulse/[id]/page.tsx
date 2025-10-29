"use client";

import { useSelector, useDispatch } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { Heart, MessageSquare, Share2, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { RootState } from "../../../../../store/store";
import { bizpulseApi } from "../../../../../src/services/bizpulseApi";
import { updatePost } from "../../../../../store/postsSlice";
import { transformBizPulsePostToMock } from "../../../../../src/utils/bizpulseTransformers";
import toast from "react-hot-toast";

export default function BizPulseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const postId = params?.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const post = useSelector((state: RootState) =>
    state.posts.posts.find((p) => p.id === postId)
  );

  const [isLiked, setIsLiked] = useState(post?.isLiked || false);
  const [newComment, setNewComment] = useState("");

  if (!post) {
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    try {
      const updatedPost = await bizpulseApi.likeWallFeed(postId);
      if (updatedPost.success) {
        const transformedPost = transformBizPulsePostToMock(updatedPost.data);
        dispatch(updatePost(transformedPost));
        setIsLiked(!isLiked);
      }
    } catch (error) {
      console.error("Failed to like post:", error);
      toast.error("Failed to update like status");
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await bizpulseApi.addComment(postId, newComment.trim());

      // Refresh the post to get updated comments
      const updatedPost = await bizpulseApi.fetchWallFeedById(postId);
      if (updatedPost.success) {
        const transformedPost = transformBizPulsePostToMock(updatedPost.data);
        dispatch(updatePost(transformedPost));
        setNewComment("");
        toast.success("Comment added successfully");
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
      setError(
        error instanceof Error ? error.message : "Failed to add comment"
      );
      toast.error("Failed to add comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-0">
      {/* Header with title and breadcrumb */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4">
        <div className="flex items-center space-x-2 text-sm mb-2 opacity-90">
          <button onClick={() => router.back()} className="hover:underline">
            Biz Hub
          </button>
          <span>›</span>
          <span className="truncate">{post.title}</span>
        </div>
        <h1 className="text-xl font-semibold">{post.title}</h1>
      </div>

      {/* Main Content */}
      <div className="bg-white">
        {/* Hero Image */}
        {post.image && (
          <div className="px-6 pt-6">
            <div className="w-full max-w-4xl mx-auto relative">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-64 md:h-80 lg:h-96 object-cover rounded-xl shadow-sm"
              />
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="px-6 py-6 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {post.title}
          </h2>

          <div className="prose max-w-none text-gray-700 mb-6">
            <div
              className="mb-4"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* Post Meta */}
          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full font-medium">
                {post.category
                  .replace("-", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </span>
              <span className="text-sm text-gray-500">{post.timeAgo}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <MessageSquare className="w-4 h-4" />
                <span>{post.stats.comments}</span>
              </div>
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center space-x-1 text-sm ${
                  isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
                } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLiking ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Heart
                    className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`}
                  />
                )}
                <span>{post.stats.likes}</span>
              </button>
            </div>
          </div>

          {/* Comment Form */}
          <div className="py-6">
            <div className="flex space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                YJ
              </div>
              <div className="flex-1">
                <div className="relative">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a message..."
                    disabled={isSubmitting}
                    className={`w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12 ${
                      error ? "border-red-300" : "border-gray-300"
                    } ${isSubmitting ? "bg-gray-50" : ""}`}
                    rows={3}
                  />
                  <button
                    onClick={handleCommentSubmit}
                    disabled={!newComment.trim() || isSubmitting}
                    className={`absolute bottom-3 right-3 p-2 rounded-lg transition-colors ${
                      isSubmitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-blue-600">
                Replies ({post.stats.comments})
              </h3>
              <button className="text-sm text-gray-500 hover:text-gray-700">
                See all ↓
              </button>
            </div>

            <div className="space-y-6">
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-4">
                    <Link
                      href={`/feeds/connections/profile/${comment.author.id}`}
                    >
                      {comment.author.avatar ? (
                        <img
                          src={comment.author.avatar}
                          alt={comment.author.name}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {getInitials(comment.author.name)}
                        </div>
                      )}
                    </Link>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Link
                          href={`/feeds/connections/profile/${comment.author.id}`}
                          className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {comment.author.name}
                        </Link>
                        <span className="text-sm text-gray-500">
                          {comment.timeAgo}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-4">{comment.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No comments yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
