import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LikeState {
  loading: boolean;
  error: string | null;
  likedPosts: { [postId: string]: boolean };
  likedComments: { [commentId: string]: boolean };
}

const initialState: LikeState = {
  loading: false,
  error: null,
  likedPosts: {},
  likedComments: {},
};

const likeSlice = createSlice({
  name: "likes",
  initialState,
  reducers: {
    toggleLikeStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    togglePostLikeSuccess: (
      state,
      action: PayloadAction<{ postId: string; isLiked: boolean }>
    ) => {
      state.loading = false;
      state.error = null;
      state.likedPosts[action.payload.postId] = action.payload.isLiked;
    },
    toggleCommentLikeSuccess: (
      state,
      action: PayloadAction<{ commentId: string; isLiked: boolean }>
    ) => {
      state.loading = false;
      state.error = null;
      state.likedComments[action.payload.commentId] = action.payload.isLiked;
    },
    toggleLikeFailure: (state, action: PayloadAction<string>) => {
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

export default likeSlice.reducer;
