import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    title: string;
    avatar?: string;
  };
  image?: string;
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
  timeAgo: string;
  category:
    | "all"
    | "founders-desk"
    | "business-boosters"
    | "pulse-polls"
    | "spotlight-stories"
    | "light-pulse"
    | "travel-stories";
  tags?: string[];
}

interface PostsState {
  posts: Post[];
  filteredPosts: Post[];
  activeCategory: string;
  searchQuery: string;
  loading: boolean;
  error: string | null;
}

const initialState: PostsState = {
  posts: [
    {
      id: "1",
      title: "Business Networking Excellence",
      content:
        "Egestas libero nulla facilisis ac diam rhoncus feugiat. Building strong business relationships is the foundation of sustainable growth.",
      author: {
        name: "Sarah Wilson",
        title: "Business Development Expert",
      },
      // image: '/contact.jpg', // Removed - image not available
      stats: {
        likes: 42,
        comments: 8,
        shares: 5,
      },
      timeAgo: "2h ago",
      category: "business-boosters",
      tags: ["networking", "business", "growth"],
    },
    {
      id: "2",
      title: "Founder's Vision for 2025",
      content:
        "Our journey continues with innovative solutions and strategic partnerships that drive meaningful connections.",
      author: {
        name: "John Doe",
        title: "Founder & CEO",
      },
      stats: {
        likes: 89,
        comments: 15,
        shares: 12,
      },
      timeAgo: "4h ago",
      category: "founders-desk",
      tags: ["vision", "leadership", "strategy"],
    },
    {
      id: "3",
      title: "Community Poll: Best Networking Events",
      content:
        "What type of networking events do you find most valuable for your business growth?",
      author: {
        name: "BizCivitas Team",
        title: "Community Manager",
      },
      stats: {
        likes: 23,
        comments: 45,
        shares: 3,
      },
      timeAgo: "6h ago",
      category: "pulse-polls",
      tags: ["poll", "community", "events"],
    },
    {
      id: "4",
      title: "Success Story: From Startup to Scale",
      content:
        "How one of our members transformed their startup into a thriving enterprise through strategic networking.",
      author: {
        name: "Maria Garcia",
        title: "Success Story Editor",
      },
      stats: {
        likes: 156,
        comments: 28,
        shares: 34,
      },
      timeAgo: "8h ago",
      category: "spotlight-stories",
      tags: ["success", "startup", "growth"],
    },
    {
      id: "5",
      title: "Quick Tip: Elevator Pitch Mastery",
      content:
        "Master your 30-second elevator pitch with these proven techniques.",
      author: {
        name: "Alex Chen",
        title: "Business Coach",
      },
      stats: {
        likes: 67,
        comments: 12,
        shares: 8,
      },
      timeAgo: "12h ago",
      category: "light-pulse",
      tags: ["tips", "pitch", "communication"],
    },
    {
      id: "6",
      title: "Networking While Traveling: Global Opportunities",
      content:
        "Discover how to build meaningful business connections while exploring new destinations.",
      author: {
        name: "David Kim",
        title: "Travel Business Expert",
      },
      stats: {
        likes: 91,
        comments: 19,
        shares: 15,
      },
      timeAgo: "1d ago",
      category: "travel-stories",
      tags: ["travel", "global", "networking"],
    },
  ],
  filteredPosts: [],
  activeCategory: "all",
  searchQuery: "",
  loading: false,
  error: null,
};

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    setActiveCategory: (state, action: PayloadAction<string>) => {
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
