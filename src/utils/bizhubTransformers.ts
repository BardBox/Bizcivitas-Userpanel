import { BizPulseMockPost, BizPulseCategory } from "../../types/bizpulse.types";

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

export function transformBizHubPostToMock(post: any): BizPulseMockPost {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!BASE_URL) {
    throw new Error(
      "NEXT_PUBLIC_BACKEND_URL environment variable is not set. This is required for image URLs to work correctly."
    );
  }

  const getImageUrl = (
    path?: string,
    type: "avatar" | "post" | "thumbnail" = "post"
  ): string | undefined => {
    if (!path) return undefined;
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    const sizes = {
      avatar: "width=32&height=32",
      post: "width=600&height=400",
      thumbnail: "width=150&height=150",
    } as const;
    return `${BASE_URL}/image/${path}?${sizes[type]}&format=webp`;
  };

  const imageFromMedia = Array.isArray(post.mediaUrls) && post.mediaUrls.length > 0
    ? getImageUrl(post.mediaUrls[0], "post")
    : (post.mediaUrl ? getImageUrl(post.mediaUrl, "post") : undefined);

  const authorName = post.user?.name || "BizCivitas Admin";

  const normalizeBizHubType = (t?: string): BizPulseCategory => {
    switch (t) {
      case "general-chatter":
        return "all";
      case "referral-exchange":
        return "all";
      case "business-deep-dive":
        return "all";
      case "travel-talks":
        return "travel-stories";
      case "biz-learnings":
        return "business-boosters";
      case "collab-corner":
        return "all";
      default:
        return "all";
    }
  };

  const mappedCategory = normalizeBizHubType(post.type);

  const base: BizPulseMockPost = {
    id: post._id || post.id,
    title: post.title || "Untitled Post",
    content:
      typeof post.description === "string"
        ? post.description
        : Array.isArray(post.description)
        ? post.description.join("\n\n")
        : "",
    author: {
      name: authorName,
      title: post.user?.role || post.user?.classification || "Member",
      avatar: post.user?.avatar ? getImageUrl(post.user.avatar, "avatar") || null : null,
    },
    image: imageFromMedia,
    stats: {
      likes: post.likeCount || 0,
      comments: post.commentCount || 0,
      shares: 0,
      views: 0,
    },
    timeAgo: post.timeAgo || (post.createdAt ? calculateTimeAgo(post.createdAt) : "Recently"),
    category: mappedCategory,
    tags: [],
    isLiked: post.isLiked || false,
    postType: "regular",
  } as BizPulseMockPost;

  return base;
}


