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

  // Base URL for images - fail fast if env var is missing
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!BASE_URL) {
    throw new Error(
      "NEXT_PUBLIC_BACKEND_URL environment variable is not set. This is required for image URLs to work correctly."
    );
  }

  // Use production backend for images if local backend is being used
  // This is useful for development when images don't exist locally
  const IMAGE_BASE_URL = BASE_URL.includes('localhost')
    ? 'https://backend.bizcivitas.com/api/v1'
    : BASE_URL;

  // Helper to safely construct image URLs with size optimization
  const getImageUrl = (
    path?: string,
    type: "avatar" | "post" | "thumbnail" = "post"
  ): string | undefined => {
    if (!path) return undefined;

    console.log('[BizPulse Image Debug] Raw path:', path, 'Type:', type, 'BASE_URL:', BASE_URL);

    // Check if it's an absolute URL
    if (path.startsWith("http://") || path.startsWith("https://")) {
      // For external URLs, check if they're from allowed domains
      try {
        const url = new URL(path);
        const allowedDomains = [
          "backend.bizcivitas.com",
          "images.unsplash.com",
          "icon-library.com",
          "s3.ap-south-1.amazonaws.com" // AWS S3 for uploaded media
        ];

        // Also allow the configured BASE_URL and IMAGE_BASE_URL hostnames
        try {
          const baseUrlHost = new URL(BASE_URL).hostname;
          if (baseUrlHost && !allowedDomains.includes(baseUrlHost)) {
            allowedDomains.push(baseUrlHost);
          }
          const imageBaseUrlHost = new URL(IMAGE_BASE_URL).hostname;
          if (imageBaseUrlHost && !allowedDomains.includes(imageBaseUrlHost)) {
            allowedDomains.push(imageBaseUrlHost);
          }
        } catch (e) {
          // invalid BASE_URL, ignore
        }

        if (allowedDomains.includes(url.hostname)) {
          console.log('[BizPulse Image Debug] Using absolute URL:', path);
          return path;
        }
        // For other external URLs, return undefined to use fallback
        console.log('[BizPulse Image Debug] Blocked external URL:', path);
        return undefined;
      } catch {
        console.log('[BizPulse Image Debug] Invalid URL:', path);
        return undefined;
      }
    }
    const sizes = {
      avatar: "width=32&height=32",
      post: "width=600&height=400",
      thumbnail: "width=150&height=150",
    };

    // Ensure path doesn't start with a slash
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;

    // For now, don't encode the path - let the browser handle it naturally
    // or let Next.js Image component handle encoding if needed
    // Backend should handle the raw path with spaces
    const finalUrl = `${IMAGE_BASE_URL}/image/${cleanPath}?${sizes[type]}&format=webp`;
    console.log('[BizPulse Image Debug] Raw path:', path);
    console.log('[BizPulse Image Debug] Using IMAGE_BASE_URL:', IMAGE_BASE_URL);
    console.log('[BizPulse Image Debug] Final constructed URL:', finalUrl);
    return finalUrl;
  };

  const isWallFeedPost = (p: any): p is WallFeedPost => {
    return "userId" in p && "likeCount" in p;
  };

  const normalizeCategory = (type: string): BizPulseCategory => {
    console.log('[BizPulse Category Debug] Input type:', type);

    const map: Record<string, BizPulseCategory> = {
      travelStories: "travel-stories",
      lightPulse: "light-pulse",
      article: "spotlight-stories",
      spotlightStories: "spotlight-stories",  // Backend sends this for spotlight stories
      poll: "pulse-polls",
      pulsePolls: "pulse-polls",
      businessBoosters: "business-boosters",
      foundersDesk: "founders-desk",
      // Also handle if backend sends hyphenated format already
      "travel-stories": "travel-stories",
      "light-pulse": "light-pulse",
      "spotlight-stories": "spotlight-stories",
      "pulse-polls": "pulse-polls",
      "business-boosters": "business-boosters",
      "founders-desk": "founders-desk",
    };

    const result = map[type] || "all";
    console.log('[BizPulse Category Debug] Mapped to:', result);
    return result;
  };

  if (isWallFeedPost(post)) {
    const transformedPost = {
      id: post._id || (post as any).id || String(Date.now()),
      title: post.title || post.poll?.question || "Untitled Post",
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
          : "/favicon.ico",
      },
      image: (() => {
        // Try to get image from images array
        if (Array.isArray(post.images) && post.images.length > 0) {
          const imageUrl = getImageUrl(post.images[0], "post");
          return imageUrl;
        }
        // Try to get from article image
        if (post.article?.image) {
          const imageUrl = getImageUrl(post.article.image, "post");
          return imageUrl;
        }
        // Try to get from direct image field
        if ((post as any).image) {
          const imageUrl = getImageUrl((post as any).image, "post");
          return imageUrl;
        }
        return undefined;
      })(),
      images: (() => {
        // Return all images if available
        if (Array.isArray(post.images) && post.images.length > 0) {
          return post.images.map(img => getImageUrl(img, "post")).filter(Boolean) as string[];
        }
        return undefined;
      })(),
      videos: post.videos, // Pass through Vimeo videos
      stats: {
        likes: post.likeCount || 0,
        // Use actual comments array length if available, otherwise fall back to commentCount
        comments: (post.comments && post.comments.length) || post.commentCount || 0,
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
      sourceType: "bizpulse", // Mark this as a BizPulse post
    } as BizPulseMockPost;

    if (post.comments && post.comments.length > 0) {
      // Sort comments by createdAt date (most recent first)
      const sortedComments = [...post.comments].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA; // Descending order (newest first)
      });

      transformedPost.comments = sortedComments.map((comment) =>
        transformCommentToMock(comment, IMAGE_BASE_URL)
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
        // Use actual comments array length if available
        comments: (post.comments && post.comments.length) || 0,
        shares: 0,
        views: 0,
      },
      timeAgo: post.createdAt ? calculateTimeAgo(post.createdAt) : "Recently",
      category: normalizeCategory(post.type || "all"),
      tags: [],
      sourceType: "bizpulse", // Mark this as a BizPulse post
    } as BizPulseMockPost;

    if (post.comments && post.comments.length > 0) {
      // Sort comments by createdAt date (most recent first)
      const sortedComments = [...post.comments].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA; // Descending order (newest first)
      });

      transformedPost.comments = sortedComments.map((comment) =>
        transformCommentToMock(comment, IMAGE_BASE_URL)
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

/**
 * Transform BizHub Post (from /post endpoint) to BizPulseMockPost format
 */
// BizHub-related transformers moved to utils/bizhubTransformers.ts