"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Send, Loader2, Search, X, Smile } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamic import for emoji picker to avoid SSR issues
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });
import {
  useGetChatMessagesQuery,
  useSendMessageMutation,
  useDeleteMessageMutation,
  useMarkMessagesAsReadMutation,
  type Message,
} from "../../../../../store/api/messageApi";
import { useGetCurrentUserQuery } from "../../../../../store/api/userApi";
import { useAppDispatch, useAppSelector } from "../../../../../store/hooks";
import {
  addMessage,
  removeMessage,
} from "../../../../../store/messageSlice";
import { getSocket } from "@/lib/socket";
import toast from "react-hot-toast";

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const chatId = params.chatId as string;
  const dispatch = useAppDispatch();

  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const messageInputRef = useRef<HTMLInputElement | null>(null);

  // Get current user
  const { data: currentUser } = useGetCurrentUserQuery();
  const currentUserId = currentUser?._id || currentUser?.id;

  // Fetch chat messages (request more with a larger limit)
  const { data: messages = [], isLoading } = useGetChatMessagesQuery({ chatId, limit: 1000 });

  // Get messages from Redux (real-time updates)
  const reduxMessages = useAppSelector(
    (state) => state.messages.messages[chatId] || []
  );

  // Mutations
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [deleteMessage] = useDeleteMessageMutation();
  const [markAsRead] = useMarkMessagesAsReadMutation();

  // Combine API messages with Redux messages
  const allMessages = [
    ...messages,
    ...reduxMessages.filter(
      (rm) => !messages.some((m) => m._id === rm._id)
    ),
  ].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Filter messages by search query
  const filteredMessages = searchQuery.trim()
    ? allMessages.filter((msg) =>
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allMessages;

  // Initialize Socket.io
  useEffect(() => {
    if (!currentUserId) return;

    const socket = getSocket();
    if (!socket) return;

    // Join chat room
    socket.emit("join chat", chatId);

    // Listen for new messages
    socket.on("message received", (newMessage: Message) => {
      if (newMessage.chatId === chatId) {
        dispatch(addMessage({ chatId, message: newMessage }));
        scrollToBottom();
      }
    });

    // Listen for typing
    socket.on("typing", (typingChatId: string) => {
      if (typingChatId === chatId) {
        setIsTyping(true);
      }
    });

    // Listen for stop typing
    socket.on("stop typing", (typingChatId: string) => {
      if (typingChatId === chatId) {
        setIsTyping(false);
      }
    });

    // Listen for message deletion
    socket.on(
      "message deleted",
      (data: { messageId: string; chatId: string }) => {
        if (data.chatId === chatId) {
          dispatch(removeMessage({ chatId, messageId: data.messageId }));
        }
      }
    );

    return () => {
      socket.off("message received");
      socket.off("typing");
      socket.off("stop typing");
      socket.off("message deleted");
    };
  }, [chatId, currentUserId, dispatch]);

  // Mark messages as read when chat opens
  useEffect(() => {
    if (chatId && currentUserId) {
      markAsRead({ chatId: chatId }).catch((err) => {
        console.log("Could not mark as read:", err);
      });
    }
  }, [chatId, currentUserId, markAsRead]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [allMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle typing indicator
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);

    const socket = getSocket();
    if (!socket) return;

    // Emit typing event
    socket.emit("typing", chatId);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop typing", chatId);
    }, 2000);
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || isSending) return;

    const content = messageInput.trim();
    setMessageInput("");

    try {
      const socket = getSocket();
      if (socket) {
        socket.emit("stop typing", chatId);
      }

      await sendMessage({ chatId, content }).unwrap();
      scrollToBottom();
    } catch (error: any) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again.");
    }
  };

  // Handle delete messages
  const handleDeleteMessages = async () => {
    if (selectedMessages.length === 0) return;

    try {
      await Promise.all(
        selectedMessages.map((msgId) =>
          // API expects messageIds array
          deleteMessage({ messageIds: [msgId], chatId }).unwrap()
        )
      );
      setSelectedMessages([]);
      setIsSelectionMode(false);
      toast.success("Messages deleted");
    } catch (error: any) {
      console.error("Failed to delete messages:", error);
      toast.error("Failed to delete messages. Please try again.");
    }
  };

  // Handle message selection
  const toggleMessageSelection = (messageId: string) => {
    setSelectedMessages((prev) =>
      prev.includes(messageId)
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId]
    );
  };

  const handleLongPress = (messageId: string) => {
    if (showSearch) return;
    setIsSelectionMode(true);
    toggleMessageSelection(messageId);
  };

  const handlePress = (message: Message) => {
    if (showSearch) return;
    if (isSelectionMode) {
      toggleMessageSelection(message._id);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle emoji selection
  const handleEmojiClick = (emojiData: any) => {
    const emoji = emojiData.emoji;
    const input = messageInputRef.current;

    if (input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const currentValue = messageInput;
      const newValue = currentValue.slice(0, start) + emoji + currentValue.slice(end);

      setMessageInput(newValue);

      // Set cursor position after emoji
      setTimeout(() => {
        input.focus();
        const newPosition = start + emoji.length;
        input.setSelectionRange(newPosition, newPosition);
      }, 0);
    } else {
      // Fallback if ref is not available
      setMessageInput(messageInput + emoji);
    }

    setShowEmojiPicker(false);
  };

  // Click-outside handler to close emoji picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Format message time
  const formatMessageTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-5xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-200 bg-white h-20">
        <button
          onClick={() => router.push("/feeds/messages")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>

        {!showSearch ? (
          <>
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900">Chat</h2>
            </div>
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Search className="w-5 h-5 text-blue-600" />
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <button
              onClick={() => {
                setShowSearch(false);
                setSearchQuery("");
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-blue-600" />
            </button>
          </>
        )}

        {isSelectionMode && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsSelectionMode(false);
                setSelectedMessages([]);
              }}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteMessages}
              disabled={selectedMessages.length === 0}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete ({selectedMessages.length})
            </button>
          </div>
        )}
      </div>

      {/* Messages Area with background */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-2"
        style={{
          backgroundImage: "url('/chatbg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading messages...</p>
            </div>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500">
                {searchQuery.trim()
                  ? "No messages found"
                  : "No messages yet. Start the conversation!"}
              </p>
            </div>
          </div>
        ) : (
          <>
            {searchQuery.trim() && (
              <div className="bg-gray-200 text-gray-700 text-sm px-4 py-2 rounded-lg mb-4 text-center">
                {filteredMessages.length} result
                {filteredMessages.length !== 1 ? "s" : ""} found
              </div>
            )}

            {filteredMessages.map((message) => {
              const isCurrentUser = (
                (message.sender === currentUserId) ||
                (message.senderId && (message.senderId._id === currentUserId || (message.senderId as any).id === currentUserId)) ||
                ((message as any).from === currentUserId) ||
                ((message as any).userId === currentUserId)
              );
              const isSelected = selectedMessages.includes(message._id);
              const isHighlighted =
                searchQuery.trim() &&
                message.content.toLowerCase().includes(searchQuery.toLowerCase());

              return (
                <div
                  key={message._id}
                  onClick={() => handlePress(message)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleLongPress(message._id);
                  }}
                  className={`flex ${
                    isCurrentUser ? "justify-end" : "justify-start"
                  } mb-1 cursor-pointer`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-xl ${
                      isSelected
                        ? "bg-yellow-200 border-2 border-yellow-400"
                        : isHighlighted
                        ? "border-2 border-blue-500 bg-blue-50"
                        : isCurrentUser
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-100 text-gray-900 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm break-words whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <p className="text-sm italic text-gray-600 px-4 py-2">
                Someone is typing...
              </p>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 relative">
          <div className="flex-1 relative">
            <input
              ref={messageInputRef}
              type="text"
              value={messageInput}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              disabled={isSending}
            />
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
              title="Add emoji"
              disabled={isSending}
            >
              <Smile className="w-5 h-5 text-gray-600" />
            </button>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div
                ref={emojiPickerRef}
                className="absolute bottom-full right-0 mb-2 z-50"
              >
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  searchDisabled={false}
                  skinTonesDisabled={false}
                  width={350}
                  height={400}
                />
              </div>
            )}
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || isSending}
            className={`p-3 rounded-full transition-colors flex-shrink-0 ${
              messageInput.trim() && !isSending
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            title="Send message"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
