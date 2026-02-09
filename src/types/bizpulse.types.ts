export interface User {
  _id: string;
  fname: string;
  lname: string;
  avatar?: string;
  username: string;
  role?: string;
  classification?: string;
}

// User info for likes (populated from backend)
export interface LikeUser {
  _id: string;
  fname: string;
  lname: string;
  avatar?: string;
  username?: string;
  role?: string;
  classification?: string;
}

export interface Like {
  userId: string | LikeUser;  // Can be string (ID) or populated user object
}

export interface Comment {
  _id: string;
  content: string;
  userId: User;
  createdAt: string;
  likes: Like[];
  likeCount: number;
  isLiked: boolean;
  mediaUrl?: string;
  mentions?: User[];
  edited?: boolean;
  editedAt?: string;
  parentCommentId?: string | null;
  replyCount?: number;
}

export interface Post {
  _id: string;
  userId: User;
  content: string;
  mediaUrls?: string[];
  likes: Like[];
  likeCount: number;
  isLiked: boolean;
  comments: Comment[];
  createdAt: string;
  updatedAt?: string;
  visibility: "public" | "connections" | "community";
  communityId?: string;
}

// ==========================================
// BIZPULSE WALLFEED TYPES
// ==========================================

export type BizPulseCategory =
  | "all"
  | "founders-desk"
  | "business-boosters"
  | "pulse-polls"
  | "spotlight-stories"
  | "light-pulse"
  | "travel-stories"
  | "trip"
  | "upcomingEvent"
  | "announcement"
  | "poll";

export interface BizPulseTab {
  id: BizPulseCategory;
  label: string;
  icon?: string;
}

export const BIZPULSE_TABS: BizPulseTab[] = [
  { id: "all", label: "All" },
  { id: "founders-desk", label: "Founders Desk" },
  { id: "business-boosters", label: "Business Boosters" },
  { id: "pulse-polls", label: "Pulse Polls" },
  { id: "spotlight-stories", label: "Spotlight Stories" },
  { id: "light-pulse", label: "Light Pulse" },
  { id: "travel-stories", label: "Travel Stories" },
];

// Poll Types
export interface PollOption {
  _id: string;
  text: string;
  votes: number;
}

export interface PollVoter {
  _id: string;
  userId: string;
  optionIndex: number;
  votedAt?: string;
}

export interface Poll {
  _id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  voters: PollVoter[];
  createdAt?: string;
  updatedAt?: string;
}

// Video Types
export interface VimeoVideo {
  vimeoId: string;
  embedLink: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
}

// WallFeed Comment Types
export interface WallFeedComment {
  _id: string;
  userId: User;
  content: string;
  mediaUrl?: string;
  mentions?: string[];
  likes: Like[];
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt?: string;
  parentCommentId?: string | null;
  replyCount?: number;
}

// Event, Article, Announcement Types
export interface EventRef {
  _id: string;
  title?: string;
  name?: string;
  eventDate?: string;
  location?: string;
}

export interface Article {
  _id: string;
  title: string;
  content: string;
  author?: string;
  image?: string;
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  priority?: "low" | "medium" | "high";
}

// Main WallFeed Post Interface
export interface WallFeedPost {
  _id: string;
  type: BizPulseCategory;
  userId: User;

  // Content fields
  title?: string;
  description?: string | string[];
  images?: string[];
  videos?: VimeoVideo[];

  // Referenced content
  eventRef?: EventRef;
  eventModel?: "TripEvent" | "OnlineEvent" | "OneDayEvent";
  poll?: Poll;
  article?: Article;
  announcement?: Announcement;

  // Metadata
  icon?: string;
  badge: string;
  visibility: "public" | "connections" | "community";
  communityId?: string;
  isDailyFeed?: boolean;

  // Engagement
  likes: Like[];
  likeCount: number;
  isLiked: boolean;
  comments: WallFeedComment[];
  commentCount: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  timeAgo?: string;

  // User interaction flags
  hasVoted?: boolean;
  userVotedOptionIndex?: number;
}
