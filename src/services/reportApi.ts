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
  // Debug: log outgoing request (without sensitive headers)
  try {
    const safeBody = typeof (options as any).body === "string" ? (options as any).body : undefined;
    console.debug("[reportApi] Request:", { url, method: options.method || "GET", body: safeBody });
  } catch {}

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
    // Debug: log raw error text for easier diagnosis
    const rawText = await response.text().catch(() => "<no-text>");
    try {
      const parsed = JSON.parse(rawText);
      console.error("[reportApi] Response Error:", { url, status: response.status, body: parsed });
      throw new Error(parsed.error || `HTTP error! status: ${response.status}`);
    } catch {
      console.error("[reportApi] Response Error (non-JSON):", { url, status: response.status, body: rawText });
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  return response.json();
};

export const reportApi = {
  /**
   * Report a comment
   */
  reportComment: async (payload: ReportCommentPayload) => {
    try {
      console.debug("[reportApi] reportComment payload:", payload);
      const data = await makeRequest(`${BASE_URL}/report`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      console.debug("[reportApi] reportComment success:", data);
      return {
        success: true,
        data,
        message: "Comment reported successfully",
      };
    } catch (error: any) {
      console.error("[reportApi] reportComment failed:", error?.message || error);
      // Retry once without postId, so backend searches by commentId across Post/WallFeed
      try {
        const retryPayload = { commentId: payload.commentId, reason: payload.reason } as ReportCommentPayload;
        console.debug("[reportApi] reportComment retry without postId:", retryPayload);
        const data = await makeRequest(`${BASE_URL}/report`, {
          method: "POST",
          body: JSON.stringify(retryPayload),
        });
        console.debug("[reportApi] reportComment retry success:", data);
        return {
          success: true,
          data,
          message: "Comment reported successfully",
        };
      } catch (retryError: any) {
        console.error("[reportApi] reportComment retry failed:", retryError?.message || retryError);
        return {
          success: false,
          error: retryError.message || error.message || "Failed to report comment",
        };
      }
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