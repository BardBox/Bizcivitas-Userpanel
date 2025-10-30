import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { bizhubApi } from "../src/services/bizhubApi";

export type BizHubCategory =
  | "all"
  | "general-chatter"
  | "referral-exchange"
  | "business-deep-dive"
  | "travel-talks"
  | "biz-learnings"
  | "collab-corner";

interface UserInfo {
  _id: string;
  name: string;
  avatar: string;
  username: string;
  classification: string;
}

export interface BizHubPost {
  _id: string;
  userId?: UserInfo;
  user?: UserInfo; // Some endpoints return 'user' instead of 'userId'
  type: string;
  title: string;
  description: string;
  mediaUrls: string[];
  badge: string;
  visibility: string;
  comments: any[];
  likes: { userId: string }[];
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  timeAgo: string;
  createdAt: string;
}

interface BizHubState {
  posts: BizHubPost[];
  filteredPosts: BizHubPost[];
  currentPost: BizHubPost | null;
  activeCategory: BizHubCategory;
  searchQuery: string;
  loading: boolean;
  error: string | null;
}

const initialState: BizHubState = {
  posts: [],
  filteredPosts: [],
  currentPost: null,
  activeCategory: "all",
  searchQuery: "",
  loading: false,
  error: null,
};

// Async thunks for API calls
export const fetchBizHubPosts = createAsyncThunk(
  "bizhub/fetchPosts",
  async (_, { rejectWithValue }) => {
    try {
      const posts = await bizhubApi.fetchPosts();
      return posts;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBizHubPostById = createAsyncThunk(
  "bizhub/fetchPostById",
  async (postId: string, { rejectWithValue }) => {
    try {
      const post = await bizhubApi.fetchPostById(postId);
      return post;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const likeBizHubPost = createAsyncThunk(
  "bizhub/likePost",
  async (postId: string, { rejectWithValue }) => {
    try {
      const updatedPost = await bizhubApi.likePost(postId);
      return updatedPost;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createBizHubPost = createAsyncThunk(
  "bizhub/createPost",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const newPost = await bizhubApi.createPost(formData);
      return newPost;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addBizHubComment = createAsyncThunk(
  "bizhub/addComment",
  async (
    { postId, content }: { postId: string; content: string },
    { rejectWithValue }
  ) => {
    try {
      const updatedPost = await bizhubApi.addComment(postId, content);
      return updatedPost;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteBizHubComment = createAsyncThunk(
  "bizhub/deleteComment",
  async (
    { postId, commentId }: { postId: string; commentId: string },
    { rejectWithValue }
  ) => {
    try {
      const updatedPost = await bizhubApi.deleteComment(postId, commentId);
      return updatedPost;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const editBizHubComment = createAsyncThunk(
  "bizhub/editComment",
  async (
    {
      postId,
      commentId,
      content,
    }: { postId: string; commentId: string; content: string },
    { rejectWithValue }
  ) => {
    try {
      const updatedPost = await bizhubApi.editComment(
        postId,
        commentId,
        content
      );
      return updatedPost;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const likeBizHubComment = createAsyncThunk(
  "bizhub/likeComment",
  async (
    { postId, commentId }: { postId: string; commentId: string },
    { rejectWithValue }
  ) => {
    try {
      const updatedPost = await bizhubApi.likeComment(postId, commentId);
      return updatedPost;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteBizHubPost = createAsyncThunk(
  "bizhub/deletePost",
  async (postId: string, { rejectWithValue }) => {
    try {
      await bizhubApi.deletePost(postId);
      return postId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const editBizHubPost = createAsyncThunk(
  "bizhub/editPost",
  async (
    { postId, data }: { postId: string; data: { title?: string; description?: string; type?: string } },
    { rejectWithValue }
  ) => {
    try {
      const updatedPost = await bizhubApi.editPost(postId, data);
      return updatedPost;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const bizhubSlice = createSlice({
  name: "bizhub",
  initialState,
  reducers: {
    setActiveCategory: (state, action: PayloadAction<BizHubCategory>) => {
      state.activeCategory = action.payload;
      bizhubSlice.caseReducers.filterPosts(state);
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      bizhubSlice.caseReducers.filterPosts(state);
    },
    filterPosts: (state) => {
      let filtered = state.posts;

      // Filter by category
      if (state.activeCategory !== "all") {
        filtered = filtered.filter(
          (post) => post.type === state.activeCategory
        );
      }

      // Filter by search query
      if (state.searchQuery.trim()) {
        const query = state.searchQuery.toLowerCase();
        filtered = filtered.filter((post) => {
          // Safe access to user name with fallbacks
          const userName = post.userId?.name || post.user?.name || "";
          const title = post.title || "";
          const description = post.description || "";

          return (
            title.toLowerCase().includes(query) ||
            description.toLowerCase().includes(query) ||
            userName.toLowerCase().includes(query)
          );
        });
      }

      state.filteredPosts = filtered;
    },
    updateBizHubPost: (state, action: PayloadAction<BizHubPost>) => {
      const existingIndex = state.posts.findIndex(
        (p) => p._id === action.payload._id
      );
      if (existingIndex >= 0) {
        state.posts[existingIndex] = action.payload;
      }
      bizhubSlice.caseReducers.filterPosts(state);
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all posts
      .addCase(fetchBizHubPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBizHubPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
        bizhubSlice.caseReducers.filterPosts(state);
      })
      .addCase(fetchBizHubPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch post by ID
      .addCase(fetchBizHubPostById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBizHubPostById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPost = action.payload;
        // Also update in posts array if it exists
        const existingIndex = state.posts.findIndex(
          (p) => p._id === action.payload._id
        );
        if (existingIndex >= 0) {
          state.posts[existingIndex] = action.payload;
        }
      })
      .addCase(fetchBizHubPostById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Like post
      .addCase(likeBizHubPost.fulfilled, (state, action) => {
        // Add null check for action.payload
        if (!action.payload || !action.payload._id) {
          console.error("Like post returned null or invalid data");
          return;
        }

        const existingIndex = state.posts.findIndex(
          (p) => p._id === action.payload._id
        );
        if (existingIndex >= 0) {
          // Preserve existing user data, only update like-related fields
          const existingPost = state.posts[existingIndex];
          state.posts[existingIndex] = {
            ...existingPost,
            ...action.payload,
            // Preserve user data if new payload is missing profile info
            userId: action.payload.userId || existingPost.userId,
            user: action.payload.user || existingPost.user,
          };
        }
        // Safe version
        if (state.currentPost && state.currentPost._id === action.payload._id) {
          const existingPost = state.currentPost;
          state.currentPost = {
            ...existingPost,
            ...action.payload,
            userId: action.payload.userId || existingPost.userId,
            user: action.payload.user || existingPost.user,
          };
        }

        bizhubSlice.caseReducers.filterPosts(state);
      })
      .addCase(likeBizHubPost.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Create post
      .addCase(createBizHubPost.fulfilled, (state, action) => {
        if (action.payload) {
          state.posts.unshift(action.payload);
          bizhubSlice.caseReducers.filterPosts(state);
        }
      })
      // Add comment
      .addCase(addBizHubComment.fulfilled, (state, action) => {
        if (!action.payload || !action.payload._id) return;

        const existingIndex = state.posts.findIndex(
          (p) => p._id === action.payload._id
        );
        if (existingIndex >= 0) {
          state.posts[existingIndex] = action.payload;
        }
        if (state.currentPost?._id === action.payload._id) {
          state.currentPost = action.payload;
        }
        bizhubSlice.caseReducers.filterPosts(state);
      })
      // Delete comment
      .addCase(deleteBizHubComment.fulfilled, (state, action) => {
        if (!action.payload || !action.payload._id) return;

        const existingIndex = state.posts.findIndex(
          (p) => p._id === action.payload._id
        );
        if (existingIndex >= 0) {
          state.posts[existingIndex] = action.payload;
        }
        if (state.currentPost?._id === action.payload._id) {
          state.currentPost = action.payload;
        }
        bizhubSlice.caseReducers.filterPosts(state);
      })
      // Edit comment
      .addCase(editBizHubComment.fulfilled, (state, action) => {
        if (!action.payload || !action.payload._id) return;

        const existingIndex = state.posts.findIndex(
          (p) => p._id === action.payload._id
        );
        if (existingIndex >= 0) {
          state.posts[existingIndex] = action.payload;
        }
        if (state.currentPost?._id === action.payload._id) {
          state.currentPost = action.payload;
        }
        bizhubSlice.caseReducers.filterPosts(state);
      })
      // Like comment
      .addCase(likeBizHubComment.fulfilled, (state, action) => {
        if (!action.payload || !action.payload._id) return;

        const existingIndex = state.posts.findIndex(
          (p) => p._id === action.payload._id
        );
        if (existingIndex >= 0) {
          state.posts[existingIndex] = action.payload;
        }
        if (state.currentPost?._id === action.payload._id) {
          state.currentPost = action.payload;
        }
        bizhubSlice.caseReducers.filterPosts(state);
      })
      // Delete post
      .addCase(deleteBizHubPost.fulfilled, (state, action) => {
        const postId = action.payload;
        state.posts = state.posts.filter((p) => p._id !== postId);
        if (state.currentPost?._id === postId) {
          state.currentPost = null;
        }
        bizhubSlice.caseReducers.filterPosts(state);
      })
      .addCase(deleteBizHubPost.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Edit post
      .addCase(editBizHubPost.fulfilled, (state, action) => {
        if (!action.payload || !action.payload._id) return;

        const existingIndex = state.posts.findIndex(
          (p) => p._id === action.payload._id
        );
        if (existingIndex >= 0) {
          state.posts[existingIndex] = action.payload;
        }
        if (state.currentPost?._id === action.payload._id) {
          state.currentPost = action.payload;
        }
        bizhubSlice.caseReducers.filterPosts(state);
      })
      .addCase(editBizHubPost.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setActiveCategory,
  setSearchQuery,
  filterPosts,
  updateBizHubPost,
  clearCurrentPost,
} = bizhubSlice.actions;

export default bizhubSlice.reducer;
