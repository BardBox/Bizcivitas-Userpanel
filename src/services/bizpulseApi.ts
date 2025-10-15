import {
  BizPulsePost,
  BizPulsePostsResponse,
  BizPulsePostResponse,
  CreateBizPulsePostPayload,
  BizPulseCommentPayload,
  BizPulseVotePayload,
} from "../../types/bizpulse.types";
import { getAccessToken } from "../lib/auth";

class BizPulseApiService {
  private baseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

  private getAuthHeaders(): Record<string, string> {
    const token = getAccessToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async fetchPosts(params?: {
    category?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<BizPulsePostsResponse> {
    const queryParams = new URLSearchParams();

    if (params?.category && params.category !== "all") {
      queryParams.append("category", params.category);
    }
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);

    const response = await fetch(`${this.baseUrl}/wallfeed?${queryParams}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication required. Please log in again.");
      }
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }

    const result = await response.json();

    // Transform the response to match expected structure
    return {
      success: result.success,
      message: result.message,
      data: {
        wallFeeds: result.data.wallFeeds || [],
      },
    };
  }

  async fetchPostById(postId: string): Promise<BizPulsePostResponse> {
    const response = await fetch(`${this.baseUrl}/post/${postId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication required. Please log in again.");
      }
      throw new Error(`Failed to fetch post: ${response.statusText}`);
    }

    return response.json();
  }

  async createPost(
    postData: CreateBizPulsePostPayload
  ): Promise<BizPulsePostResponse> {
    const response = await fetch(`${this.baseUrl}/post`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication required. Please log in again.");
      }
      throw new Error(`Failed to create post: ${response.statusText}`);
    }

    return response.json();
  }

  async likePost(postId: string): Promise<BizPulsePostResponse> {
    const response = await fetch(`${this.baseUrl}/post/${postId}/like`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication required. Please log in again.");
      }
      throw new Error(`Failed to like post: ${response.statusText}`);
    }

    return response.json();
  }

  async addComment(
    postId: string,
    commentData: BizPulseCommentPayload
  ): Promise<BizPulsePostResponse> {
    const response = await fetch(`${this.baseUrl}/post/${postId}/comment`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(commentData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication required. Please log in again.");
      }
      throw new Error(`Failed to add comment: ${response.statusText}`);
    }

    return response.json();
  }

  async voteOnPoll(
    postId: string,
    voteData: BizPulseVotePayload
  ): Promise<BizPulsePostResponse> {
    const response = await fetch(`${this.baseUrl}/post/${postId}/vote`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(voteData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication required. Please log in again.");
      }
      throw new Error(`Failed to vote on poll: ${response.statusText}`);
    }

    return response.json();
  }
}

export const bizpulseApi = new BizPulseApiService();
