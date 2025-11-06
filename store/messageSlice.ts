import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Message } from "./api/messageApi";

interface TypingUser {
  chatId: string;
  userId: string;
  isTyping: boolean;
}

interface MessageState {
  messages: { [chatId: string]: Message[] };
  typing: TypingUser[];
  selectedChatId: string | null;
  onlineUsers: string[];
  notifications: Message[];
}

const initialState: MessageState = {
  messages: {},
  typing: [],
  selectedChatId: null,
  onlineUsers: [],
  notifications: [],
};

const messageSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    // Set messages for a specific chat
    setMessages: (
      state,
      action: PayloadAction<{ chatId: string; messages: Message[] }>
    ) => {
      state.messages[action.payload.chatId] = action.payload.messages;
    },

    // Add a new message to a chat
    addMessage: (
      state,
      action: PayloadAction<{ chatId: string; message: Message }>
    ) => {
      const { chatId, message } = action.payload;
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }

      // Check if message already exists (prevent duplicates)
      const exists = state.messages[chatId].some((m) => m._id === message._id);
      if (!exists) {
        state.messages[chatId].push(message);
      }
    },

    // Remove a message from a chat
    removeMessage: (
      state,
      action: PayloadAction<{ chatId: string; messageId: string }>
    ) => {
      const { chatId, messageId } = action.payload;
      if (state.messages[chatId]) {
        state.messages[chatId] = state.messages[chatId].filter(
          (m) => m._id !== messageId
        );
      }
    },

    // Set typing status
    setTyping: (state, action: PayloadAction<TypingUser>) => {
      const { chatId, userId, isTyping } = action.payload;

      // Remove existing typing status for this user in this chat
      state.typing = state.typing.filter(
        (t) => !(t.chatId === chatId && t.userId === userId)
      );

      // Add new typing status if typing
      if (isTyping) {
        state.typing.push(action.payload);
      }
    },

    // Set selected chat
    setSelectedChat: (state, action: PayloadAction<string | null>) => {
      state.selectedChatId = action.payload;
    },

    // Set online users
    setOnlineUsers: (state, action: PayloadAction<string[]>) => {
      state.onlineUsers = action.payload;
    },

    // Add notification
    addNotification: (state, action: PayloadAction<Message>) => {
      // Only add if not from selected chat
      if (action.payload.chatId !== state.selectedChatId) {
        state.notifications.push(action.payload);
      }
    },

    // Clear notifications for a chat
    clearNotifications: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.chatId !== action.payload
      );
    },

    // Clear all messages (on logout)
    clearAllMessages: (state) => {
      state.messages = {};
      state.typing = [];
      state.selectedChatId = null;
      state.onlineUsers = [];
      state.notifications = [];
    },
  },
});

export const {
  setMessages,
  addMessage,
  removeMessage,
  setTyping,
  setSelectedChat,
  setOnlineUsers,
  addNotification,
  clearNotifications,
  clearAllMessages,
} = messageSlice.actions;

export default messageSlice.reducer;
