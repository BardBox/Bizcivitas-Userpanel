import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  _id: string;
  name?: string;
  fname?: string;
  lname?: string;
  avatar?: string;
  username?: string;
  role?: string;
}

interface Like {
  userId: User;
}

interface LikeState {
  loading: boolean;
  error: string | null;
  postLikes: { [key: string]: Like[] };
  commentLikes: { [key: string]: Like[] };
}

const initialState: LikeState = {
  loading: false,
  error: null,
  postLikes: {},
  commentLikes: {},
};

const likeSlice = createSlice({
  name: "likes",
  initialState,
  reducers: {
    toggleLikeStart(state) {
      state.loading = true;
      state.error = null;
    },
    togglePostLikeSuccess(
      state,
      action: PayloadAction<{ postId: string; likes: Like[]; userId?: string }>
    ) {
      const { postId, likes } = action.payload;
      state.loading = false;
      state.error = null;
      state.postLikes[postId] = likes;
    },
    toggleCommentLikeSuccess(
      state,
      action: PayloadAction<{
        postId: string;
        commentId: string;
        likes: Like[];
        userId?: string;
      }>
    ) {
      const { commentId, likes } = action.payload;
      state.loading = false;
      state.error = null;
      state.commentLikes[commentId] = likes;
    },
    toggleLikeFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  toggleLikeStart,
  togglePostLikeSuccess,
  toggleCommentLikeSuccess,
  toggleLikeFailure,
} = likeSlice.actions;

export const selectPostLikes = (
  state: { likes: LikeState } & Record<string, unknown>,
  postId: string
): Like[] => state.likes.postLikes[postId] || [];

export const selectCommentLikes = (
  state: { likes: LikeState } & Record<string, unknown>,
  commentId: string
): Like[] => state.likes.commentLikes[commentId] || [];

export const selectIsPostLikedByUser = (
  state: { likes: LikeState },
  postId: string,
  userId: string
): boolean => {
  const likes = selectPostLikes(state, postId);
  return likes.some((like) => like.userId._id === userId);
};

export const selectIsCommentLikedByUser = (
  state: { likes: LikeState },
  commentId: string,
  userId: string
): boolean => {
  const likes = selectCommentLikes(state, commentId);
  return likes.some((like) => like.userId._id === userId);
};

export const selectPostLikeCount = (
  state: { likes: LikeState },
  postId: string
): number => selectPostLikes(state, postId).length;

export const selectCommentLikeCount = (
  state: { likes: LikeState },
  commentId: string
): number => selectCommentLikes(state, commentId).length;

export default likeSlice.reducer;
