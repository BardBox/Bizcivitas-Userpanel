import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { BizPulseMockPost, BizPulseCategory } from "../types/bizpulse.types";
import { bizpulseApi } from "../src/services/bizpulseApi";
import { transformBizPulsePostsToMock } from "../src/utils/bizpulseTransformers";

interface BizPulseState {
  posts: BizPulseMockPost[];
  filteredPosts: BizPulseMockPost[];
  activeCategory: BizPulseCategory;
  searchQuery: string;
  loading: boolean;
  error: string | null;
}

// Async thunks for API calls
export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async (
    params: { category?: string; search?: string } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const response = await bizpulseApi.fetchWallFeeds({
        type: params?.category,
        search: params?.search,
      });
      // Wallfeed response structure: { data: { wallFeeds: [...] } }
      const wallFeeds = response.data?.wallFeeds || [];
      const transformedPosts = transformBizPulsePostsToMock(wallFeeds);
      return transformedPosts;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPostById = createAsyncThunk(
  "posts/fetchPostById",
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await bizpulseApi.fetchWallFeedById(postId);
      const transformedPost = transformBizPulsePostsToMock([response.data.wallFeed])[0];
      return transformedPost;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const likePostAsync = createAsyncThunk(
  "posts/likePost",
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await bizpulseApi.likeWallFeed(postId);
      const transformedPost = transformBizPulsePostsToMock([response.data.wallFeed])[0];
      return { postId, updatedPost: transformedPost };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState: BizPulseState = {
  posts: [],
  filteredPosts: [],
  activeCategory: "all" as BizPulseCategory,
  searchQuery: "",
  loading: false,
  error: null,
};

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    setActiveCategory: (state, action: PayloadAction<BizPulseCategory>) => {
      state.activeCategory = action.payload;
      postsSlice.caseReducers.filterPosts(state);
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      postsSlice.caseReducers.filterPosts(state);
    },
    filterPosts: (state) => {
      let filtered = state.posts;

      // Filter by category
      if (state.activeCategory !== "all") {
        filtered = filtered.filter(
          (post) => post.category === state.activeCategory
        );
      }

      // Filter by search query
      if (state.searchQuery.trim()) {
        const query = state.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (post) =>
            post.title.toLowerCase().includes(query) ||
            post.content.toLowerCase().includes(query) ||
            post.author.name.toLowerCase().includes(query) ||
            post.tags?.some((tag) => tag.toLowerCase().includes(query))
        );
      }

      state.filteredPosts = filtered;
    },
    likePost: (state, action: PayloadAction<string>) => {
      const post = state.posts.find((p) => p.id === action.payload);
      if (post) {
        post.stats.likes += 1;
      }
    },
    unlikePost: (state, action: PayloadAction<string>) => {
      const post = state.posts.find((p) => p.id === action.payload);
      if (post && post.stats.likes > 0) {
        post.stats.likes -= 1;
      }
    },
    addComment: (state, action: PayloadAction<string>) => {
      const post = state.posts.find((p) => p.id === action.payload);
      if (post) {
        post.stats.comments += 1;
      }
    },
    sharePost: (state, action: PayloadAction<string>) => {
      const post = state.posts.find((p) => p.id === action.payload);
      if (post) {
        post.stats.shares += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
        // Re-apply filtering after fetching new posts
        postsSlice.caseReducers.filterPosts(state);
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPostById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.loading = false;
        // Handle single post fetch if needed
        const existingIndex = state.posts.findIndex(
          (p) => p.id === action.payload.id
        );
        if (existingIndex >= 0) {
          state.posts[existingIndex] = action.payload;
        } else {
          state.posts.push(action.payload);
        }
        postsSlice.caseReducers.filterPosts(state);
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(likePostAsync.pending, (state) => {
        // Optional: could set loading for specific post
      })
      .addCase(likePostAsync.fulfilled, (state, action) => {
        const { postId, updatedPost } = action.payload;
        const existingIndex = state.posts.findIndex((p) => p.id === postId);
        if (existingIndex >= 0) {
          state.posts[existingIndex] = updatedPost;
          postsSlice.caseReducers.filterPosts(state);
        }
      })
      .addCase(likePostAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setActiveCategory,
  setSearchQuery,
  filterPosts,
  likePost,
  unlikePost,
  addComment,
  sharePost,
} = postsSlice.actions;

export default postsSlice.reducer;
