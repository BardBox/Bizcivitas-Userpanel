import { getAccessToken, refreshAccessToken } from "../lib/auth";

export interface ReportCommentPayload {
  commentId: string;
  postId?: string; // Optional: helps backend find the comment faster
  reason: "spam" | "inappropriate" | "hate speech" | "misinformation" | "other";
}

export interface ReportPostPayload {
  postId: string;
  reason: "spam" | "inappropriate" | "hate speech" | "misinformation" | "other";
}

export interface CheckReportedResponse {
  isReported: boolean;
}

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3010/api/v1";

const makeRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<any> => {
  let token = getAccessToken();

  let headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers as Record<string, string>),
  };

  let response = await fetch(url, { ...options, headers });

  // Handle 401 - try to refresh token
  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      token = newToken;
      headers = {
        ...headers,
        Authorization: `Bearer ${token}`,
      };
      response = await fetch(url, { ...options, headers });
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const reportApi = {
  /**
   * Report a comment
   */
  reportComment: async (payload: ReportCommentPayload) => {
    try {
      const data = await makeRequest(`${BASE_URL}/report`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return {
        success: true,
        data,
        message: "Comment reported successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to report comment",
      };
    }
  },

  /**
   * Report a post
   */
  reportPost: async (payload: ReportPostPayload) => {
    try {
      const data = await makeRequest(`${BASE_URL}/report`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return {
        success: true,
        data,
        message: "Post reported successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to report post",
      };
    }
  },

  /**
   * Check if user has already reported a comment or post
   */
  checkReported: async (params: { commentId?: string; postId?: string }) => {
    try {
      const queryString = new URLSearchParams(
        params as Record<string, string>
      ).toString();
      const data = await makeRequest(`${BASE_URL}/report/check?${queryString}`);
      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to check report status",
        data: { isReported: false },
      };
    }
  },
};