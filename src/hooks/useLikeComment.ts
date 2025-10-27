import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { RootState } from "@/store";
import {
  toggleLikeStart,
  togglePostLikeSuccess,
  toggleCommentLikeSuccess,
  toggleLikeFailure,
} from "@/store/slices/likeSlice";
import { likeCommentService } from "@/services/likeComment.service";
import { toast } from "react-hot-toast";

export const useLikeComment = (postId: string) => {
  const dispatch = useAppDispatch();
  const [commentLoading, setCommentLoading] = useState(false);
  const likeState = useAppSelector((state: RootState) => state.likes);

  const handlePostLike = async () => {
    dispatch(toggleLikeStart());
    try {
      const response = await likeCommentService.togglePostLike(postId);
      dispatch(
        togglePostLikeSuccess({
          postId,
          isLiked: response.isLiked,
        })
      );
      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to like post";
      dispatch(toggleLikeFailure(message));
      toast.error(message);
      throw error;
    }
  };

  const handleCommentLike = async (commentId: string) => {
    dispatch(toggleLikeStart());
    try {
      const response = await likeCommentService.toggleCommentLike(
        postId,
        commentId
      );
      dispatch(
        toggleCommentLikeSuccess({
          commentId,
          isLiked: response.isLiked,
        })
      );
      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to like comment";
      dispatch(toggleLikeFailure(message));
      toast.error(message);
      throw error;
    }
  };

  const handleAddComment = async (data: FormData) => {
    setCommentLoading(true);
    try {
      const response = await likeCommentService.addComment(postId, data);
      toast.success("Comment added successfully");
      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to add comment";
      toast.error(message);
      throw error;
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await likeCommentService.deleteComment(postId, commentId);
      toast.success("Comment deleted successfully");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete comment";
      toast.error(message);
      throw error;
    }
  };

  return {
    handlePostLike,
    handleCommentLike,
    handleAddComment,
    handleDeleteComment,
    loading: likeState.loading,
    error: likeState.error,
    commentLoading,
  };
};
