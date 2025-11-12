"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Send, Loader2, Search, X, Smile } from "lucide-react";
import dynamic from "next/dynamic";
import ConfirmDialog from "@/components/Dashboard/Connections/ConfirmDialog";

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

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

  // Combine API messages with Redux messages (sorted newest to oldest for reverse display)
  const allMessages = [
    ...messages,
    ...reduxMessages.filter(
      (rm) => !messages.some((m) => m._id === rm._id)
    ),
  ].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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

  // Only scroll on new real-time messages (not on initial load)
  const previousMessageCountRef = useRef(0);

  useEffect(() => {
    // Only scroll if messages were added (new message received), not on initial load
    if (allMessages.length > previousMessageCountRef.current && previousMessageCountRef.current > 0) {
      scrollToBottom();
    }
    previousMessageCountRef.current = allMessages.length;
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

  // Handle delete messages - show confirmation modal
  const handleDeleteMessages = () => {
    if (selectedMessages.length === 0) return;
    setMessageToDelete(selectedMessages[0]); // Store first message for modal
    setShowDeleteModal(true);
  };

  // Confirm and execute delete
  const confirmDeleteMessage = async () => {
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
      setShowDeleteModal(false);
      setMessageToDelete(null);
      toast.success("Messages deleted");
    } catch (error: any) {
      console.error("Failed to delete messages:", error);
      toast.error("Failed to delete messages. Please try again.");
      setShowDeleteModal(false);
      setMessageToDelete(null);
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
        className="flex-1 overflow-y-auto p-4 flex flex-col-reverse gap-2"
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
            {/* Anchor for scrolling - appears at bottom visually due to flex-col-reverse */}
            <div ref={messagesEndRef} />

            {isTyping && (
              <p className="text-sm italic text-gray-600 px-4 py-2">
                Someone is typing...
              </p>
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

            {searchQuery.trim() && (
              <div className="bg-gray-200 text-gray-700 text-sm px-4 py-2 rounded-lg text-center">
                {filteredMessages.length} result
                {filteredMessages.length !== 1 ? "s" : ""} found
              </div>
            )}
          </>
        )}
      </div>

      {/* Input Area - SUPER COLORFUL & STYLISH DESIGN */}
      <div className="relative border-t border-transparent bg-gradient-to-r from-purple-50 via-blue-50 to-pink-50 p-6 shadow-2xl backdrop-blur-sm">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 animate-pulse"></div>

        <div className="flex items-end gap-4 relative max-w-5xl mx-auto">
          <div className="flex-1 relative">
            {/* Colorful gradient border wrapper */}
            <div className="relative p-[3px] rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300">
              <input
                ref={messageInputRef}
                type="text"
                value={messageInput}
                onChange={handleTyping}
                onKeyPress={handleKeyPress}
                placeholder="✨ Type your message..."
                className="w-full pl-6 pr-16 py-5  focus:ring-4 focus:ring-purple-300 bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 transition-all duration-300 text-base font-semibold shadow-inner disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-purple-500 placeholder:font-normal outline-none"
                disabled={isSending}
              />

              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 rounded-full transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg hover:scale-110 active:scale-95 z-10"
                title="Add emoji"
                disabled={isSending}
              >
                <Smile className="w-5 h-5 text-white drop-shadow" />
              </button>
            </div>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div
                ref={emojiPickerRef}
                className="absolute bottom-full right-0 mb-3 z-50 shadow-2xl rounded-2xl overflow-hidden border-4 border-purple-200"
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

          {/* ULTRA COLORFUL SEND BUTTON */}
          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || isSending}
            className={`relative p-5 rounded-full transition-all duration-500 transform flex-shrink-0 ${
              messageInput.trim() && !isSending
                ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white hover:scale-125 active:scale-90 shadow-2xl hover:shadow-purple-500/50 animate-pulse"
                : "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 cursor-not-allowed shadow-lg"
            }`}
            style={{
              boxShadow: messageInput.trim() && !isSending
                ? '0 0 30px rgba(147, 51, 234, 0.6), 0 0 60px rgba(59, 130, 246, 0.4)'
                : 'none'
            }}
            title="Send message"
          >
            {/* Spinning gradient ring */}
            {messageInput.trim() && !isSending && (
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 opacity-75 blur-sm animate-spin"></div>
            )}

            <div className="relative">
              {isSending ? (
                <Loader2 className="w-7 h-7 animate-spin drop-shadow-lg" />
              ) : (
                <Send className="w-7 h-7 drop-shadow-lg" />
              )}
            </div>
          </button>
        </div>

        {/* Colorful Character Counter */}
        {messageInput.length > 0 && (
          <div className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-right mt-3 max-w-5xl mx-auto animate-pulse">
            ✨ {messageInput.length} characters
          </div>
        )}
      </div>

      {/* Delete Message Confirmation Modal */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setMessageToDelete(null);
        }}
        onConfirm={confirmDeleteMessage}
        title="Delete Message"
        message={
          selectedMessages.length > 1
            ? `Are you sure you want to delete ${selectedMessages.length} messages? This action cannot be undone.`
            : "Are you sure you want to delete this message? This action cannot be undone."
        }
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        warningText="Deleted messages cannot be recovered."
      />
    </div>
  );
}
