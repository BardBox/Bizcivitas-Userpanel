// BizPulse Type Definitions
// Centralized type definitions for BizPulse (Posts Feed) functionality

import { User } from "./user.types";

/**
 * BizPulse Wallfeed Types (admin-created content)
 */
export type BizPulseWallfeedType =
  | "travelStories"
  | "lightPulse"
  | "spotlightStories"
  | "pulsePolls"
  | "businessBoosters"
  | "foundersDesk";

/**
 * Video Data Structure
 */
export interface VideoData {
  vimeoId?: string;
  embedLink?: string;
  thumbnailUrl?: string | null;
  title: string;
  description?: string;
  mimeType?: string;
  fileExtension?: string;
  sizeInBytes?: number;
  status?: string;
}

/**
 * BizPulse Visibility Levels
 */
export type BizPulseVisibility = "public" | "connections" | "community";

/**
 * BizPulse Tab Categories
 */
export type BizPulseCategory =
  | "all"
  | "founders-desk"
  | "business-boosters"
  | "pulse-polls"
  | "spotlight-stories"
  | "light-pulse"
  | "travel-stories";

/**
 * Poll Option Structure
 */
export interface BizPulsePollOption {
  text: string;
  votes: number;
}

/**
 * Poll Structure
 */
export interface BizPulsePoll {
  question: string;
  options: BizPulsePollOption[];
  totalVotes: number;
  voters: Array<{
    userId: string;
    optionIndex: number;
  }>;
}

/**
 * Comment Structure (matches backend response)
 */
export interface BizPulseComment {
  _id: string;
  userId: {
    _id: string;
    name: string;
    avatar: string | null;
    username: string | null;
    role: string | null;
  };
  content?: string;
  mediaUrl?: string;
  mediaUrls?: string[];
  mentions: Array<{
    _id: string;
    name: string;
    avatar: string | null;
    username: string | null;
    role: string | null;
  }>;
  likes: Array<{
    userId:
      | {
          _id: string;
          name: string;
          fname: string | null;
          lname: string | null;
          avatar: string | null;
          username: string | null;
          role: string | null;
        }
      | string;
  }>;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
  isHidden?: boolean;
  hiddenForUsers?: string[];
  edited?: boolean;
  editedAt?: string;
}

/**
 * Like Structure (matches backend response)
 */
export interface BizPulseLike {
  userId:
    | {
        _id: string;
        name: string;
        fname: string | null;
        lname: string | null;
        avatar: string | null;
        username: string | null;
        role: string | null;
      }
    | string;
}

/**
 * BizPulse Post Interface (matches wallfeed backend response structure)
 */
export interface BizPulsePost {
  _id: string;
  type: BizPulseWallfeedType;
  title?: string;
  description: string[] | string;
  images: string[];
  videos: VideoData[];
  createdAt: string;
  isDailyFeed?: boolean;
  badge?: string;
  poll?: BizPulsePoll;
  user?: {
    _id: string;
    fname: string;
    lname: string;
    username: string;
    avatar: string | null;
  };
}

/**
 * BizPulse Tab Configuration
 */
export interface BizPulseTab {
  id: BizPulseCategory;
  label: string;
}

/**
 * BizPulse Search and Filter State
 */
export interface BizPulseFilters {
  category: BizPulseCategory;
  searchQuery: string;
  sortBy?: "newest" | "oldest" | "most-liked" | "most-commented";
}

/**
 * BizPulse UI State
 */
export interface BizPulseUIState {
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  itemsPerPage: number;
}

/**
 * BizPulse Redux State
 */
export interface BizPulseState {
  posts: BizPulsePost[];
  filteredPosts: BizPulsePost[];
  activeCategory: BizPulseCategory;
  searchQuery: string;
  loading: boolean;
  error: string | null;
}

/**
 * API Response Types for BizPulse (wallfeed)
 */
export interface BizPulsePostsResponse {
  success: boolean;
  message: string;
  data: {
    wallFeeds: BizPulsePost[];
  };
}

export interface BizPulsePostResponse {
  statusCode: number;
  data: BizPulsePost;
  message: string;
  success: boolean;
}

/**
 * BizPulse Action Payloads
 */
export interface CreateBizPulsePostPayload {
  type: BizPulseWallfeedType;
  title?: string;
  description?: string;
  mediaUrls?: string[];
  visibility: BizPulseVisibility;
  communityId?: string;
  poll?: {
    question: string;
    options: string[];
  };
}

export interface UpdateBizPulsePostPayload {
  postId: string;
  title?: string;
  description?: string;
  mediaUrls?: string[];
  visibility?: BizPulseVisibility;
  communityId?: string;
  isDailyFeed?: boolean;
}

export interface BizPulseCommentPayload {
  postId: string;
  content?: string;
  mediaUrl?: string;
  mentions?: string[];
}

export interface BizPulseVotePayload {
  postId: string;
  optionIndex: number;
}

/**
 * BizPulse Component Props
 */
export interface BizPulseCardProps {
  post: BizPulsePost;
  onLike?: (postId: string) => void;
  onComment?: (postId: string, comment: string) => void;
  onShare?: (postId: string) => void;
  onVote?: (postId: string, optionIndex: number) => void;
  isLiked?: boolean;
  currentUserVote?: number;
}

export interface BizPulseTabNavigationProps {
  activeTab: BizPulseCategory;
  onTabChange: (tab: BizPulseCategory) => void;
  tabs: BizPulseTab[];
}

export interface BizPulseSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
}

/**
 * BizPulse Constants
 */
export const BIZPULSE_TABS: BizPulseTab[] = [
  { id: "all", label: "All" },
  { id: "founders-desk", label: "Founder's Desk" },
  { id: "business-boosters", label: "Business Boosters" },
  { id: "pulse-polls", label: "Pulse Polls" },
  { id: "spotlight-stories", label: "Spotlight Stories" },
  { id: "light-pulse", label: "Light Pulse" },
  { id: "travel-stories", label: "Travel Stories" },
];

export const BIZPULSE_POST_TYPES: Record<BizPulseWallfeedType, string> = {
  travelStories: "Travel Stories",
  lightPulse: "Light Pulse",
  spotlightStories: "Spotlight Stories",
  pulsePolls: "Pulse Polls",
  businessBoosters: "Business Boosters",
  foundersDesk: "Founder's Desk",
};

export const BIZPULSE_VISIBILITY_LABELS: Record<BizPulseVisibility, string> = {
  public: "Public",
  connections: "Connections Only",
  community: "Community Only",
};

/**
 * Frontend Mock Post Interface (for development/testing)
 * This represents the structure used in Redux mock data
 * Note: This is different from BizPulsePost which is for API data
 */
export interface BizPulseMockPost {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    title: string;
    avatar?: string | null; // Allow null values from backend
  };
  image?: string; // Add this for component compatibility
  stats: {
    likes: number;
    comments: number;
    shares: number;
    views?: number;
  };
  timeAgo: string;
  category: BizPulseCategory;
  tags: string[];
  comments?: Array<{
    id: string;
    content: string;
    author: {
      name: string;
      avatar?: string | null;
    };
    timeAgo: string;
    likes: number;
  }>;
}
