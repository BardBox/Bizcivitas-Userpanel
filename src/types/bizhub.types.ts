export type BizHubCategory =
    | "all"
    | "general-chatter"
    | "referral-exchange"
    | "business-deep-dive"
    | "travel-talks"
    | "biz-learnings"
    | "collab-corner";

export interface UserInfo {
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
