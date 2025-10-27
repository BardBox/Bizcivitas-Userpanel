import { axiosInstance } from "@/lib/axios";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface User {
  _id: string;
  name?: string;
  fname?: string;
  lname?: string;
  avatar?: string;
  username?: string;
  role?: string;
}

export interface Like {
  userId: User;
}

export interface Post {
  _id: string;
  userId: User;
  title?: string;
  description?: string;
  mediaUrls?: string[];
  likes: Like[];
  comments: Comment[];
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  createdAt: string;
  timeAgo: string;
}

interface Comment {
  _id: string;
  userId: User;
  content: string;
  mediaUrl?: string;
  likes: Like[];
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
}

export const likeCommentService = {
  // Toggle post like
  togglePostLike: async (postId: string): Promise<Post> => {
    const response = await axiosInstance.post<ApiResponse<Post>>(
      "/posts/like",
      { postId }
    );
    return response.data.data;
  },

  // Toggle comment like
  toggleCommentLike: async (
    postId: string,
    commentId: string
  ): Promise<Post> => {
    const response = await axiosInstance.post<ApiResponse<Post>>(
      `/posts/${postId}/comments/${commentId}/like`
    );
    return response.data.data;
  },

  // Add comment
  addComment: async (postId: string, data: FormData): Promise<Post> => {
    const response = await axiosInstance.post<ApiResponse<Post>>(
      `/posts/${postId}/comment`,
      data
    );
    return response.data.data;
  },

  // Delete comment
  deleteComment: async (
    postId: string,
    commentId: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete<ApiResponse<null>>(
      `/posts/${postId}/comments/${commentId}`
    );
    return {
      success: response.data.success,
      message: response.data.message,
    };
  },
};
