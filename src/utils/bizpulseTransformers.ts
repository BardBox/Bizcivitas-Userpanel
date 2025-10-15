import {
  BizPulsePost,
  BizPulseMockPost,
  BizPulseWallfeedType,
  BizPulseCategory,
} from "../../types/bizpulse.types";

/**
 * Transform backend BizPulsePost to frontend BizPulseMockPost format
 * This allows existing components to work with API data
 */
export function transformBizPulsePostToMock(
  post: BizPulsePost
): BizPulseMockPost {
  // Base URL for images
  const BASE_URL = "https://backend.bizcivitas.com/api/v1";

  return {
    id: post._id,
    title: post.title || "Untitled Post",
    content: Array.isArray(post.description)
      ? post.description
          .map((desc) => desc.trim())
          .filter((desc) => desc)
          .join("<br><br>")
      : post.description || "",
    author: {
      name: "BizCivitas Admin", // Wallfeed content is from admin
      title: "Administrator",
      avatar: null,
    },
    image:
      Array.isArray(post.images) && post.images.length > 0
        ? `${BASE_URL}/image/${post.images[0]}`
        : undefined,
    stats: {
      likes: 0, // Wallfeed doesn't have likes
      comments: 0, // Wallfeed doesn't have comments
      shares: 0,
      views: 0,
    },
    timeAgo: post.createdAt ? calculateTimeAgo(post.createdAt) : "Recently",
    category: mapPostTypeToCategory(post.type),
    tags: [],
  };
}

/**
 * Transform array of BizPulsePost to BizPulseMockPost
 */
export function transformBizPulsePostsToMock(
  posts: BizPulsePost[]
): BizPulseMockPost[] {
  return posts.map(transformBizPulsePostToMock);
}

/**
 * Map backend wallfeed type to frontend category
 */
export function mapPostTypeToCategory(
  type: BizPulseWallfeedType
): BizPulseCategory {
  const typeMap: Record<BizPulseWallfeedType, BizPulseCategory> = {
    travelStories: "travel-stories",
    lightPulse: "light-pulse",
    spotlightStories: "spotlight-stories",
    pulsePolls: "pulse-polls",
    businessBoosters: "business-boosters",
    foundersDesk: "founders-desk",
  };

  return typeMap[type] || "all";
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
