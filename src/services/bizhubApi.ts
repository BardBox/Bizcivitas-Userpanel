import { getAccessToken } from "../lib/auth";

class BizHubApiService {
  private baseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "https://backend.bizcivitas.com/api/v1";

  private getAuthHeaders(): Record<string, string> {
    const token = getAccessToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async fetchPosts(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/post/`, {
      headers: this.getAuthHeaders(),
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch BizHub posts: ${response.statusText}`);
    }
    const json = await response.json();
    return (json?.data?.posts || []) as any[];
  }
}

export const bizhubApi = new BizHubApiService();


