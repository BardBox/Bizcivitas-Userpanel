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

  private getMultipartHeaders(): Record<string, string> {
    const token = getAccessToken();
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // Fetch all posts
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

  // Fetch single post by ID
  async fetchPostById(postId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/post/${postId}`, {
      headers: this.getAuthHeaders(),
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch post: ${response.statusText}`);
    }
    const json = await response.json();
    // Backend returns post directly in data
    return json?.data || null;
  }

  // Create new post
  async createPost(formData: FormData): Promise<any> {
    const response = await fetch(`${this.baseUrl}/post/create`, {
      method: "POST",
      headers: this.getMultipartHeaders(),
      credentials: "include",
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Failed to create post: ${response.statusText}`);
    }
    const json = await response.json();
    // Backend returns post directly in data
    return json?.data || null;
  }

  // Like/Unlike post
  async likePost(postId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/post/like`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify({ postId }),
    });
    if (!response.ok) {
      throw new Error(`Failed to like post: ${response.statusText}`);
    }
    const json = await response.json();
    // Backend returns the post directly in data, not nested in data.post
    return json?.data || null;
  }

  // Add comment to post
  async addComment(postId: string, content: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/post/${postId}/comment`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify({ content }),
    });
    if (!response.ok) {
      throw new Error(`Failed to add comment: ${response.statusText}`);
    }
    const json = await response.json();
    // Backend returns post directly in data
    return json?.data || null;
  }

  // Edit comment
  async editComment(
    postId: string,
    commentId: string,
    content: string
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}/post/comments/edit`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify({ postId, commentId, content }),
    });
    if (!response.ok) {
      throw new Error(`Failed to edit comment: ${response.statusText}`);
    }
    const json = await response.json();
    // Backend returns post directly in data
    return json?.data || null;
  }

  // Delete comment
  async deleteComment(postId: string, commentId: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/post/${postId}/comments/${commentId}`,
      {
        method: "DELETE",
        headers: this.getAuthHeaders(),
        credentials: "include",
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to delete comment: ${response.statusText}`);
    }
    const json = await response.json();
    // Backend returns post directly in data
    return json?.data || null;
  }

  // Like comment
  async likeComment(postId: string, commentId: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/post/${postId}/comments/${commentId}/like`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        credentials: "include",
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to like comment: ${response.statusText}`);
    }
    const json = await response.json();
    // Backend returns post directly in data
    return json?.data || null;
  }

  // Delete post
  async deletePost(postId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/post/${postId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(`Failed to delete post: ${response.statusText}`);
    }
  }

  // Edit post
  async editPost(postId: string, data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/post/${postId}`, {
      method: "PATCH",
      headers: this.getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to edit post: ${response.statusText}`);
    }
    const json = await response.json();
    // Backend returns post directly in data
    return json?.data || null;
  }

  // Report comment
  async reportComment(postId: string, commentId: string, reason: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/report`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify({ postId, commentId, reason }),
    });
    if (!response.ok) {
      const json = await response.json();
      throw new Error(json?.error || `Failed to report comment: ${response.statusText}`);
    }
    const json = await response.json();
    return json;
  }
}

export const bizhubApi = new BizHubApiService();


