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
    id: string;
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
const transformCommentToMock = (
  comment: any,
  baseUrl: string
): TransformedComment => ({
  id: comment._id || "",
  content: comment.content || "",
  author: {
    id: comment.userId?._id || "",
    name: comment.userId
      ? `${comment.userId.fname || ""} ${comment.userId.lname || ""}`.trim() ||
        "Unknown User"
      : "Unknown User",
    avatar: comment.userId?.avatar
      ? `${baseUrl}/image/${comment.userId.avatar}?width=32&height=32&format=webp`
      : null,
  },
  timeAgo: comment.createdAt ? calculateTimeAgo(comment.createdAt) : "Recently",
  likes: 0, // Removing like functionality
});

/**
 * Transform backend BizPulsePost to frontend BizPulseMockPost format
 * This allows existing components to work with API data
 */
export function transformBizPulsePostToMock(
  post: WallFeedPost | BizPulsePost
): BizPulseMockPost {
  // Debug: log the incoming post structure
  console.log("Transform input post:", post);

  // Base URL for images - fail fast if env var is missing
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!BASE_URL) {
    throw new Error(
      "NEXT_PUBLIC_BACKEND_URL environment variable is not set. This is required for image URLs to work correctly."
    );
  }

  // Helper to safely construct image URLs with size optimization
  const getImageUrl = (
    path?: string,
    type: "avatar" | "post" | "thumbnail" = "post"
  ): string | undefined => {
    if (!path) return undefined;
    const sizes = {
      avatar: "width=32&height=32",
      post: "width=600&height=400",
      thumbnail: "width=150&height=150",
    };
    return `${BASE_URL}/image/${path}?${sizes[type]}&format=webp`;
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
      id: post._id || (post as any).id || String(Date.now()),
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
        avatar: post.userId?.avatar
          ? getImageUrl(post.userId.avatar, "avatar")
          : null,
      },
      image: (() => {
        // Try to get image from images array
        if (Array.isArray(post.images) && post.images.length > 0) {
          return getImageUrl(post.images[0], "post");
        }
        // Try to get from article image
        if (post.article?.image) {
          return getImageUrl(post.article.image, "post");
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
      // Sort comments by createdAt date (most recent first)
      const sortedComments = [...post.comments].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA; // Descending order (newest first)
      });

      transformedPost.comments = sortedComments.map((comment) =>
        transformCommentToMock(comment, BASE_URL)
      );
    }

    return transformedPost;
  } else {
    // Handle BizPulsePost type
    const transformedPost = {
      id: post._id || (post as any).id || String(Date.now()),
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
          ? getImageUrl(post.images[0], "post")
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
      // Sort comments by createdAt date (most recent first)
      const sortedComments = [...post.comments].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA; // Descending order (newest first)
      });

      transformedPost.comments = sortedComments.map((comment) =>
        transformCommentToMock(comment, BASE_URL)
      );
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
