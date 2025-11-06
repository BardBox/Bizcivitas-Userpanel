import { baseApi } from "./baseApi";

// Types for Messages and Chats
export interface Message {
  _id: string;
  chat?: string;
  chatId?: string;
  sender?: {
    _id: string;
    fname?: string;
    lname?: string;
    fullName?: string;
    avatar?: string;
  };
  senderId?: {
    _id: string;
    fname?: string;
    lname?: string;
    fullName?: string;
    avatar?: string;
  };
  content: string;
  readBy: boolean | Array<{
    userId: string;
    readAt: Date;
  }>;
  deletedBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Chat {
  _id: string;
  users?: Array<{
    _id: string;
    fname?: string;
    lname?: string;
    fullName?: string;
    avatar?: string;
    businessCategory?: string;
  }>;
  participants?: Array<{
    _id: string;
    fname?: string;
    lname?: string;
    fullName?: string;
    avatar?: string;
    businessCategory?: string;
  }>;
  isGroupChat: boolean;
  groupName?: string;
  groupAdmin?: string;
  latestMessage?: {
    content: string;
    sender: string;
    createdAt: string;
  };
  lastMessage?: {
    content: string;
    senderId: string;
    createdAt: string;
  };
  unseenMsg?: number;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserForChat {
  _id: string;
  id?: string;
  fname: string;
  lname: string;
  fullName?: string;
  avatar?: string;
  businessCategory?: string;
}

interface ApiResponse<T> {
  statusCode?: number;
  message?: string;
  success?: boolean;
  data: T;
}

// Message API endpoints
export const messageApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Get all chats for current user
    getUserChats: builder.query<Chat[], void>({
      query: () => "/chats",
      transformResponse: (response: any) => {
        // Backend returns { chats: [...] }
        return response.chats || response.data || [];
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Chat' as const, id: _id })),
              { type: 'Chat' as const, id: 'LIST' },
            ]
          : [{ type: 'Chat' as const, id: 'LIST' }],
    }),

    // Get or create chat with a user
    getOrCreateChat: builder.mutation<Chat, { userId: string }>({
      query: (data) => ({
        url: "/chats",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Chat>) => response.data,
      invalidatesTags: [{ type: 'Chat' as const, id: 'LIST' }],
    }),

    // Get messages for a specific chat
    // Backend uses singular `/message/{chatId}`
    // Accept an object so we can pass pagination params: { chatId, limit, before }
    getChatMessages: builder.query<Message[], { chatId: string; limit?: number; before?: string }>({
      query: ({ chatId, limit, before }) => {
        const q: string[] = [];
        if (limit) q.push(`limit=${limit}`);
        if (before) q.push(`before=${encodeURIComponent(before)}`);
        const qs = q.length ? `?${q.join('&')}` : '';
        return `/message/${chatId}${qs}`;
      },
      transformResponse: (response: any) => {
        // Mobile app receives response.data as direct array (not nested in ApiResponse wrapper)
        // Support both: direct array or nested { data: [...] }
        if (Array.isArray(response)) return response;
        if (Array.isArray(response.data)) return response.data;
        return [];
      },
      providesTags: (result, error, arg) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Message' as const, id: _id })),
              { type: 'Message' as const, id: arg.chatId },
            ]
          : [{ type: 'Message' as const, id: arg.chatId }],
    }),

    // Send a message (POST /message)
    sendMessage: builder.mutation<
      Message,
      { chatId: string; content: string }
    >({
      query: (data) => ({
        url: "/message",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Message>) => response.data,
      invalidatesTags: (result, error, { chatId }) => [
        { type: 'Message' as const, id: chatId },
        { type: 'Chat' as const, id: 'LIST' },
      ],
    }),

    // Delete messages (DELETE /message/delete with messageIds array)
    deleteMessage: builder.mutation<
      { message: string },
      { messageIds: string[]; chatId?: string }
    >({
      query: ({ messageIds }) => ({
        url: `/message/delete`,
        method: "DELETE",
        body: { messageIds },
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data,
      invalidatesTags: (result, error, { chatId }) =>
        chatId ? [{ type: 'Message' as const, id: chatId }] : [],
    }),

    // Mark messages as seen/read (POST /message/seen)
    // Accept either { chatId } or { targetUserId } depending on caller
    markMessagesAsRead: builder.mutation<
      { message: string },
      { chatId?: string; targetUserId?: string }
    >({
      query: (payload) => ({
        url: `/message/seen`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data,
      invalidatesTags: (result, error, { chatId }) =>
        chatId 
          ? [
              { type: 'Message' as const, id: chatId },
              { type: 'Chat' as const, id: chatId },
              { type: 'Chat' as const, id: 'LIST' },
            ] 
          : [{ type: 'Chat' as const, id: 'LIST' }],
    }),

    // Edit a message (PUT /message/edit/{messageId})
    editMessage: builder.mutation<Message, { messageId: string; content: string }>(
      {
        query: ({ messageId, content }) => ({
          url: `/message/edit/${messageId}`,
          method: "PUT",
          body: { content },
        }),
        transformResponse: (response: ApiResponse<Message>) => response.data,
        invalidatesTags: (result, error, { messageId }) => (
          result ? [{ type: 'Message' as const, id: messageId }] : []
        ),
      }
    ),

    // Delete a chat (DELETE /chats/:chatId)
    deleteChat: builder.mutation<
      { message: string },
      { chatId: string }
    >({
      query: ({ chatId }) => ({
        url: `/chats/${chatId}`,
        method: "DELETE",
      }),
      transformResponse: (response: any) => ({
        message: response.message || "Chat deleted successfully"
      }),
      invalidatesTags: [{ type: 'Chat' as const, id: 'LIST' }],
    }),

    // Search chats
    searchChats: builder.query<Chat[], string>({
      query: (searchTerm) => `/chats/search?q=${encodeURIComponent(searchTerm)}`,
      transformResponse: (response: ApiResponse<Chat[]>) => response.data,
    }),

    // Get all community members
    getCommunityMembers: builder.query<UserForChat[], void>({
      query: () => "/users/community-members",
      transformResponse: (response: any) => {
        const users = response.data?.users || response.users || [];
        return users;
      },
      providesTags: ['User'],
    }),

    // Search users
    searchUsers: builder.query<UserForChat[], string>({
      query: (searchTerm) => `/users/search?q=${encodeURIComponent(searchTerm)}`,
      transformResponse: (response: any) => {
        const users = response.data || response.users || [];
        return users;
      },
    }),
  }),
});

// Export hooks
export const {
  useGetUserChatsQuery,
  useGetOrCreateChatMutation,
  useGetChatMessagesQuery,
  useSendMessageMutation,
  useDeleteMessageMutation,
  useMarkMessagesAsReadMutation,
  useEditMessageMutation,
  useDeleteChatMutation,
  useSearchChatsQuery,
  useGetCommunityMembersQuery,
  useSearchUsersQuery,
  useLazySearchUsersQuery,
} = messageApi;
