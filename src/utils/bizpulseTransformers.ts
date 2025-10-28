import {
  BizPulsePost,
  BizPulseMockPost,
  BizPulseWallfeedType,
  BizPulseCategory,
} from "../../types/bizpulse.types";
import { WallFeedPost } from "../types/bizpulse.types";

interface TransformedComment {
  id: string;
  content: string;
  author: {
    name: string;
    avatar: string | null;
  };
  timeAgo: string;
  likes: number;
}

/**
 * Calculate time ago from ISO date string
 */
function calculateTimeAgo(dateString: string): string {
  try {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMs = now.getTime() - postDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return postDate.toLocaleDateString();
  } catch {
    return "Recently";
  }
}

/**
 * Transform a comment to the frontend format
 */
const transformCommentToMock = (comment: any): TransformedComment => ({
  id: comment._id || "",
  content: comment.content || "",
  author: {
    name: comment.userId
      ? `${comment.userId.fname || ""} ${comment.userId.lname || ""}`.trim() ||
        "Unknown User"
      : "Unknown User",
    avatar: comment.userId?.avatar || null,
  },
  timeAgo: comment.createdAt ? calculateTimeAgo(comment.createdAt) : "Recently",
  likes: comment.likeCount || comment.likes?.length || 0,
});

/**
 * Transform backend BizPulsePost to frontend BizPulseMockPost format
 * This allows existing components to work with API data
 */
export function transformBizPulsePostToMock(
  post: WallFeedPost | BizPulsePost
): BizPulseMockPost {
  // Base URL for images - fail fast if env var is missing
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!BASE_URL) {
    throw new Error(
      "NEXT_PUBLIC_BACKEND_URL environment variable is not set. This is required for image URLs to work correctly."
    );
  }

  // Helper to safely construct image URLs
  const getImageUrl = (path?: string): string | undefined => {
    if (!path) return undefined;
    return `${BASE_URL}/image/${path}`;
  };

  const isWallFeedPost = (p: any): p is WallFeedPost => {
    return "userId" in p && "likeCount" in p;
  };

  const normalizeCategory = (type: string): BizPulseCategory => {
    const map: Record<string, BizPulseCategory> = {
      travelStories: "travel-stories",
      lightPulse: "light-pulse",
      article: "spotlight-stories" as BizPulseCategory,
      poll: "pulse-polls",
      pulsePolls: "pulse-polls",
      businessBoosters: "business-boosters",
      foundersDesk: "founders-desk",
    };
    return map[type] || "all";
  };

  if (isWallFeedPost(post)) {
    const transformedPost = {
      id: post._id,
      title: post.title || "Untitled Post",
      content: Array.isArray(post.description)
        ? post.description
            .map((desc) => desc.trim())
            .filter((desc) => desc)
            .join("<br><br>")
        : post.description || "",
      author: {
        name: post.userId
          ? `${post.userId.fname} ${post.userId.lname}`
          : "BizCivitas Admin",
        title: post.userId?.role || "Member",
        avatar: post.userId?.avatar || null,
      },
      image: (() => {
        // Try to get image from images array
        if (Array.isArray(post.images) && post.images.length > 0) {
          return getImageUrl(post.images[0]);
        }
        // Try to get from article image
        if (post.article?.image) {
          return getImageUrl(post.article.image);
        }
        return undefined;
      })(),
      stats: {
        likes: post.likeCount || 0,
        comments: post.commentCount || 0,
        shares: 0,
        views: 0,
      },
      timeAgo:
        post.timeAgo ||
        (post.createdAt ? calculateTimeAgo(post.createdAt) : "Recently"),
      category: normalizeCategory(post.type),
      tags: [],
      isLiked: post.isLiked || false,
      poll: post.poll,
      postType: post.poll ? "poll" : "regular",
    } as BizPulseMockPost;

    if (post.comments && post.comments.length > 0) {
      transformedPost.comments = post.comments.map(transformCommentToMock);
    }

    return transformedPost;
  } else {
    // Handle BizPulsePost type
    const transformedPost = {
      id: post._id,
      title: post.title || "Untitled Post",
      content: Array.isArray(post.description)
        ? post.description
            .map((desc) => desc.trim())
            .filter((desc) => desc)
            .join("<br><br>")
        : post.description || "",
      author: {
        name: "BizCivitas Admin",
        title: "Administrator",
        avatar: null,
      },
      image:
        Array.isArray(post.images) && post.images.length > 0
          ? getImageUrl(post.images[0])
          : undefined,
      stats: {
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
      },
      timeAgo: post.createdAt ? calculateTimeAgo(post.createdAt) : "Recently",
      category: normalizeCategory(post.type || "all"),
      tags: [],
    } as BizPulseMockPost;

    if (post.comments && post.comments.length > 0) {
      transformedPost.comments = post.comments.map(transformCommentToMock);
    }

    return transformedPost;
  }
}

/**
 * Transform WallFeedPost (from API) to BizPulseMockPost format
 * This is used when fetching from the new WallFeed API
 */
export function transformWallFeedPostToMock(
  post: WallFeedPost
): BizPulseMockPost {
  return transformBizPulsePostToMock(post);
}

/**
 * Transform array of BizPulsePost to BizPulseMockPost
 */
export function transformBizPulsePostsToMock(
  posts: BizPulsePost[] | WallFeedPost[]
): BizPulseMockPost[] {
  return posts.map((post) => transformBizPulsePostToMock(post));
}

/**
 * Map backend wallfeed type to frontend category
 */
export function mapPostTypeToCategory(
  type: BizPulseCategory
): BizPulseCategory {
  const categoryMap: Record<string, BizPulseCategory> = {
    travelStories: "travel-stories",
    lightPulse: "light-pulse",
    article: "spotlight-stories",
    poll: "pulse-polls",
    pulsePolls: "pulse-polls",
    businessBoosters: "business-boosters",
    foundersDesk: "founders-desk",
    trip: "travel-stories",
    upcomingEvent: "all",
    announcement: "all",
  };

  return categoryMap[type] || "all";
}
