import { WallFeedPost } from "../types/bizpulse.types";
import { getAccessToken, refreshAccessToken } from "../lib/auth";

// Response Types
interface WallFeedResponse {
  success: boolean;
  data: {
    wallFeeds: WallFeedPost[];
    totalCount?: number;
  };
  message?: string;
}

interface SingleWallFeedResponse {
  success: boolean;
  data: {
    wallFeed: WallFeedPost;
  };
  message?: string;
}

class BizPulseApiService {
  private baseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://backend.bizcivitas.com/api/v1";

  private getAuthHeaders(): Record<string, string> {
    const token = getAccessToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  /**
   * Fetch all wallfeeds (BizPulse posts)
   * GET /api/wallfeed
   */
  async fetchWallFeeds(params?: {
    type?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<WallFeedResponse> {
    const queryParams = new URLSearchParams();

    if (params?.type && params.type !== "all") {
      queryParams.append("type", params.type);
    }
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);

    const url = `${this.baseUrl}/wallfeed${
      queryParams.toString() ? `?${queryParams}` : ""
    }`;

    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication required. Please log in again.");
      }
      throw new Error(`Failed to fetch wallfeeds: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Fetch single wallfeed by ID
   * GET /api/wallfeed/:id
   */
  async fetchWallFeedById(wallfeedId: string): Promise<SingleWallFeedResponse> {
    const response = await fetch(`${this.baseUrl}/wallfeed/${wallfeedId}`, {
      headers: this.getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication required. Please log in again.");
      }
      throw new Error(`Failed to fetch wallfeed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Like/Unlike a wallfeed
   * POST /api/wallfeed/like
   */
  async likeWallFeed(wallfeedId: string): Promise<SingleWallFeedResponse> {
    const response = await fetch(`${this.baseUrl}/wallfeed/like`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify({ wallFeedId: wallfeedId }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication required. Please log in again.");
      }
      throw new Error(`Failed to like wallfeed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Vote on a poll
   * PUT /api/wallfeed/vote/:id
   */
  async voteOnPoll(
    wallfeedId: string,
    optionIndex: number
  ): Promise<SingleWallFeedResponse> {
    console.log("Voting on poll:", { wallfeedId, optionIndex });
    console.log("Auth headers:", this.getAuthHeaders());

    try {
      const response = await fetch(
        `${this.baseUrl}/wallfeed/vote/${wallfeedId}`,
        {
          method: "PUT",
          headers: this.getAuthHeaders(),
          credentials: "include",
          body: JSON.stringify({ optionIndex }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Vote failed:", {
          status: response.status,
          statusText: response.statusText,
          errorText,
          headers: response.headers,
        });

        if (response.status === 401) {
          // Try to refresh token
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            // Retry the vote with new token
            return this.voteOnPoll(wallfeedId, optionIndex);
          }
          throw new Error("Authentication required. Please log in again.");
        }
        throw new Error(`Failed to vote: ${errorText || response.statusText}`);
      }

      const result = await response.json();
      console.log("Vote successful:", result);
      return result;
    } catch (error) {
      console.error("Vote error:", error);
      throw error;
    }
  }

  /**
   * Remove vote from a poll
   * PUT /api/wallfeed/vote/remove/:id
   */
  async removeVote(wallfeedId: string): Promise<SingleWallFeedResponse> {
    const response = await fetch(
      `${this.baseUrl}/wallfeed/vote/remove/${wallfeedId}`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
        credentials: "include",
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication required. Please log in again.");
      }
      throw new Error(`Failed to remove vote: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Add comment to wallfeed
   * POST /api/wallfeed/comment/:id
   */
  async addComment(
    wallfeedId: string,
    content: string,
    mentions?: string[]
  ): Promise<SingleWallFeedResponse> {
    const response = await fetch(
      `${this.baseUrl}/wallfeed/comment/${wallfeedId}`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ content, mentions }),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication required. Please log in again.");
      }
      throw new Error(`Failed to add comment: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Like/Unlike a comment on wallfeed
   * POST /api/wallfeed/:wallFeedId/comments/:commentId/like
   */
  async likeComment(
    wallfeedId: string,
    commentId: string
  ): Promise<SingleWallFeedResponse> {
    const response = await fetch(
      `${this.baseUrl}/wallfeed/${wallfeedId}/comments/${commentId}/like`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        credentials: "include",
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication required. Please log in again.");
      }
      throw new Error(`Failed to like comment: ${response.statusText}`);
    }

    return response.json();
  }
}

export const bizpulseApi = new BizPulseApiService();
