"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MessageCircle,
  Search,
  Loader2,
  Plus,
  Clock,
  CheckCheck,
  MoreVertical,
  Edit2,
  Trash2,
  X,
  ChevronDown,
} from "lucide-react";
import ConfirmDialog from "@/components/Dashboard/Connections/ConfirmDialog";
import MessageInput from "@/components/MessageInput";
import {
  useGetUserChatsQuery,
  useGetOrCreateChatMutation,
  useGetChatMessagesQuery,
  useSendMessageMutation,
  useDeleteMessageMutation,
  useEditMessageMutation,
  useMarkMessagesAsReadMutation,
  useDeleteChatMutation,
  type Chat,
  type UserForChat,
} from "../../../../store/api/messageApi";
import { useGetCurrentUserQuery } from "../../../../store/api/userApi";
import { useGetSuggestionsAllQuery } from "../../../../store/api/connectionsApi";
import { formatDistanceToNow } from "date-fns";
import { initializeSocket } from "@/lib/socket";
import { skipToken } from "@reduxjs/toolkit/query/react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/Breadcrumb";

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [menuOpenForMessage, setMenuOpenForMessage] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [chatMenuOpenForChatId, setChatMenuOpenForChatId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDeleteChatModal, setShowDeleteChatModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<{ chatId: string; chat: Chat } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesAreaRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const chatMenuRef = useRef<HTMLDivElement | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const messageInputRef = useRef<HTMLInputElement | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Get current user
  const { data: currentUser } = useGetCurrentUserQuery();
  const currentUserId = currentUser?._id || currentUser?.id;

  // Fetch user chats and all members
  const { data: chats = [], isLoading: chatsLoading, refetch } = useGetUserChatsQuery();
  const { data: allMembers = [], isLoading: membersLoading } = useGetSuggestionsAllQuery();

  // Debug: Log member count and search for "pritesh"
  useEffect(() => {
    if (allMembers && allMembers.length > 0) {

      // Search for "pritesh" in the members list
      const priteshUsers = allMembers.filter((member) => {
        const fullName = `${member.fname || ""} ${member.lname || ""}`.trim().toLowerCase();
        return fullName.includes("pritesh");
      });

      if (priteshUsers.length > 0) {
        priteshUsers.forEach((user) => {
          // Process user
        });
      }
    }
  }, [allMembers]);

  // Mutations
  const [getOrCreateChat] = useGetOrCreateChatMutation();
  const [sendMessage] = useSendMessageMutation();
  const [deleteMessage] = useDeleteMessageMutation();
  const [editMessage] = useEditMessageMutation();
  const [markAsRead] = useMarkMessagesAsReadMutation();
  const [deleteChat] = useDeleteChatMutation();

  // Fetch messages for selected chat (loads full thread)
  const { data: chatMessages = [], isLoading: chatMessagesLoading, refetch: refetchChatMessages } = useGetChatMessagesQuery(
    selectedChat?._id ? { chatId: selectedChat._id, limit: 1000 } : skipToken
  );

  // Auto-scroll to bottom when chat is opened or messages change
  useEffect(() => {
    if (selectedChat && messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [selectedChat?._id, chatMessages]);

  // Auto-open chat when userId query parameter is present
  useEffect(() => {
    const userId = searchParams?.get('userId');
    if (userId && currentUserId && !selectedChat) {
      // Wait a bit for chats to load
      const timer = setTimeout(() => {
        // Try to find existing chat with this user
        const existingChat = chats.find((chat) => {
          const users = chat.users || chat.participants || [];
          return users.some((u) => u._id === userId);
        });

        if (existingChat) {
          // Open existing chat by setting it directly
          setSelectedChat(existingChat as Chat);
          toast.success("Chat opened");

          // Mark as read
          const other = (existingChat.users || existingChat.participants || []).find((u) => u._id !== currentUserId);
          if (other?._id) {
            markAsRead({ chatId: existingChat._id, targetUserId: other._id }).catch((err) => {
            });
          }

          // Clean up URL after opening chat
          router.replace('/feeds/messages', { scroll: false });
        } else {
          // Create new chat with this user
          getOrCreateChat({ userId })
            .unwrap()
            .then(async (createdChat) => {
              // Refetch chats to update the sidebar with new chat
              const refetchResult = await refetch();

              // Find the newly created chat in the refetched list
              const updatedChats = refetchResult.data || [];
              const newChat = updatedChats.find((chat: Chat) => {
                const users = chat.users || chat.participants || [];
                return users.some((u) => u._id === userId);
              });

              // Set selected chat using the chat from refetched list
              if (newChat) {
                setSelectedChat(newChat as Chat);
                toast.success("Chat opened");
              } else {
                // Fallback to the created chat if not found in list
                setSelectedChat(createdChat as Chat);
                toast.success("Chat opened");
              }

              // Clean up URL after opening chat
              router.replace('/feeds/messages', { scroll: false });
            })
            .catch((error) => {
              console.error("Failed to open chat:", error);
              toast.error("Failed to open chat");

              // Clean up URL even on error
              router.replace('/feeds/messages', { scroll: false });
            });
        }
      }, 800); // Increased to 800ms to ensure chats are loaded

      return () => clearTimeout(timer);
    }
  }, [searchParams, currentUserId, chats, selectedChat, getOrCreateChat, router, markAsRead, refetch]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      // Clear selected chat when navigating back
      setSelectedChat(null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Initialize Socket.io when user is available (optional for real-time updates)
  useEffect(() => {
    if (currentUserId) {
      try {
        const socket = initializeSocket(currentUserId);

        // Listen for new messages to update chat list
        socket.on("message received", (payload: any) => {
          // refetch chats list
          refetch();

          // if selected chat matches incoming message's chat, refetch chat details or append
          if (selectedChat && payload?.chatId === selectedChat._id) {
            // refetch the selected chat's messages
            try { refetchChatMessages && refetchChatMessages(); } catch { }
          }
        });

        return () => {
          socket.off("message received");
        };
      } catch (error) {
        console.warn("Socket.io not available, using polling for updates");
        // Fallback: Refetch every 10 seconds if socket fails
        const interval = setInterval(() => {
          refetch();
        }, 10000);

        return () => clearInterval(interval);
      }
    }
  }, [currentUserId, refetch, selectedChat, refetchChatMessages]);

  // Get existing chat user IDs
  const existingChatUserIds = chats.map((chat) => {
    const users = chat.users || chat.participants || [];
    const otherUser = users.find((u) => u._id !== currentUserId);
    return otherUser?._id;
  });

  // Filter members who don't have existing chats (for search results)
  const membersWithoutChats = allMembers.filter(
    (member) => member._id !== currentUserId && !existingChatUserIds.includes(member._id)
  );

  // Combine chats and members for search
  const searchResults = searchQuery.trim()
    ? [
      // Existing chats matching search
      ...chats
        .map((chat) => {
          const users = chat.users || chat.participants || [];
          const otherUser = users.find((u) => u._id !== currentUserId);
          const fullName = otherUser?.fullName || `${otherUser?.fname || ""} ${otherUser?.lname || ""}`.trim();

          if (fullName.toLowerCase().includes(searchQuery.toLowerCase())) {
            return { type: "chat" as const, data: chat };
          }
          return null;
        })
        .filter(Boolean),
      // Only show members WITHOUT existing chats (prevent duplicates)
      ...allMembers
        .filter((member) =>
          member && member._id && // Ensure member and ID exist
          member._id !== currentUserId &&
          !existingChatUserIds.includes(member._id) // Exclude members with existing chats
        )
        .map((member) => {
          const fullName = `${member.fname || ""} ${member.lname || ""}`.trim();
          if (fullName.toLowerCase().includes(searchQuery.toLowerCase())) {
            // Ensure member has fullName property
            const mappedMember = {
              ...member,
              fullName: fullName,
            };
            return { type: "member" as const, data: mappedMember as any, hasExistingChat: false };
          }
          return null;
        })
        .filter(Boolean),
    ]
    : chats.map((chat) => ({ type: "chat" as const, data: chat }));

  // Control dropdown visibility based on search query
  useEffect(() => {
    if (searchQuery.trim().length > 0 && searchResults.length > 0) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [searchQuery, searchResults.length]);

  // Click-outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

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

  // Click-outside handler to close chat menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatMenuRef.current &&
        !chatMenuRef.current.contains(event.target as Node)
      ) {
        setShowChatMenu(false);
      }
    };

    if (showChatMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showChatMenu]);

  // Handle scroll to bottom visibility
  useEffect(() => {
    const container = messagesAreaRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Show button if we are more than 200px away from bottom
      const isNotAtBottom = scrollHeight - scrollTop - clientHeight > 200;
      setShowScrollBottom(isNotAtBottom);
    };

    container.addEventListener("scroll", handleScroll);
    // Check initial state
    handleScroll();

    return () => container.removeEventListener("scroll", handleScroll);
  }, [selectedChat, chatMessages]); // Re-bind when chat or messages change

  // Handler for starting a conversation with a member
  const handleStartConversation = async (member: UserForChat) => {
    try {
      // Create or get existing chat
      const chat = await getOrCreateChat({ userId: member._id }).unwrap();

      // set selected chat in UI instead of navigating away
      setSelectedChat(chat as Chat);

      // Clear search and close dropdown
      setSearchQuery("");
      setShowDropdown(false);

      toast.success("Chat opened");
    } catch (error: any) {
      console.error("Failed to start conversation:", error);
      toast.error("Failed to start conversation. Please try again.");
    }
  };

  // Handler for chat click — open in right panel
  const handleChatClick = (chatId: string) => {
    const c = chats.find((ch) => ch._id === chatId) || null;
    // Immediately update UI with local chat so the right panel responds instantly
    setSelectedChat(c as Chat | null);

    // Push state to browser history so back button works
    if (c) {
      window.history.pushState({ chatOpen: true }, '', window.location.pathname + window.location.search);
    }

    // Mark messages as read when opening chat
    if (c) {
      const other = (c.users || c.participants || []).find((u) => u._id !== currentUserId);
      if (other?._id) {
        // Mark as read by sending targetUserId or chatId
        markAsRead({ chatId: c._id, targetUserId: other._id }).catch((err) => {
        });
      }
    }

    // Then try to resolve canonical chat from server in case mobile created a different chat id.
    // Prefer using getOrCreateChat with the other participant so server returns the canonical chat and its messages.
    const other = c ? (c.users || c.participants || []).find((u) => u._id !== currentUserId) : null;
    if (other && other._id) {
      // call server to get canonical chat for this participant and update selection when available
      getOrCreateChat({ userId: other._id })
        .unwrap()
        .then((serverChat) => {
          // If server returned a different chat id, update selectedChat so messages fetch for correct id
          if (serverChat && serverChat._id && serverChat._id !== (c?._id)) {
            setSelectedChat(serverChat as Chat);
          }
        })
        .catch(() => {
          // ignore errors — UI already shows local chat
        });
    }
  };

  // Get other participant in a chat (for 1-on-1 chats)
  const getOtherParticipant = (chat: Chat) => {
    const users = chat.users || chat.participants || [];
    return users.find((p) => p._id !== currentUserId);
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return "";
    }
  };

  // Helper to extract messages array from chat object or from freshly fetched chatMessages
  const getMessagesList = (chat: Chat | null) => {
    if (!chat) return [];
    // Merge fetched messages from the API with any messages already attached to the chat object.
    const fetched = Array.isArray(chatMessages) ? chatMessages.slice() : [];
    const attached = (chat as any).messages || (chat as any).messagesThread || (chat as any).messagesList || (chat.latestMessage ? [chat.latestMessage] : []);

    // If no fetched nor attached, return empty
    if ((!fetched || fetched.length === 0) && (!attached || attached.length === 0)) return [];

    // Merge and dedupe by _id (keep fetched messages first)
    const byId: Record<string, any> = {};
    const push = (m: any) => {
      const id = m?._id || m?.id || JSON.stringify(m);
      if (!id) return;
      if (!byId[id]) byId[id] = m;
    };

    // prefer fetched items first (they are authoritative), then attached
    fetched.forEach(push);
    (attached || []).forEach(push);

    const merged = Object.values(byId);
    // sort chronologically (oldest -> newest)
    merged.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return merged;
  };


  // Get user's full name
  const getUserFullName = (user: any) => {
    return user?.fullName || `${user?.fname || ""} ${user?.lname || ""}`.trim() || "Unknown User";
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

  // Handle delete message
  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedChat) return;

    // Confirmation dialog
    const confirmed = window.confirm("Are you sure you want to delete this message?");
    if (!confirmed) {
      setMenuOpenForMessage(null);
      return;
    }

    try {
      await deleteMessage({ messageIds: [messageId], chatId: selectedChat._id }).unwrap();
      toast.success("Message deleted");
      setMenuOpenForMessage(null);
      refetchChatMessages();
    } catch (error: any) {
      console.error("Failed to delete message:", error);
      const errorMessage = error?.data?.message || error?.message || "Failed to delete message";
      toast.error(errorMessage);
    }
  };

  // Handle edit message
  const handleEditMessage = async (messageId: string) => {
    if (!editingContent.trim()) return;
    try {
      await editMessage({ messageId, content: editingContent }).unwrap();
      toast.success("Message edited");
      setEditingMessageId(null);
      setEditingContent("");
      setMenuOpenForMessage(null);
      refetchChatMessages();
    } catch (error: any) {
      console.error("Failed to edit message:", error);
      toast.error("Failed to edit message");
    }
  };

  // Start editing
  const startEditing = (messageId: string, currentContent: string) => {
    setEditingMessageId(messageId);
    setEditingContent(currentContent);
    setMenuOpenForMessage(null);
  };

  // Handle delete chat - open modal
  const handleDeleteChat = (chatId?: string, chatToDeleteParam?: Chat) => {
    // If no chatId provided, use selected chat
    const targetChatId = chatId || selectedChat?._id;
    const targetChat = chatToDeleteParam || selectedChat;

    if (!targetChatId || !targetChat) return;

    // Close the menus
    setShowChatMenu(false);
    setChatMenuOpenForChatId(null);

    // Open confirmation modal
    setChatToDelete({ chatId: targetChatId, chat: targetChat });
    setShowDeleteChatModal(true);
  };

  // Confirm delete chat
  const confirmDeleteChat = async () => {
    if (!chatToDelete) return;

    try {
      await deleteChat({ chatId: chatToDelete.chatId }).unwrap();
      toast.success("Chat deleted successfully");

      // If the deleted chat was selected, clear selection
      if (selectedChat?._id === chatToDelete.chatId) {
        setSelectedChat(null);
      }

      refetch(); // Refresh chat list
      setShowDeleteChatModal(false);
      setChatToDelete(null);
    } catch (error: any) {
      console.error("Failed to delete chat:", error);
      const errorMessage = error?.data?.message || error?.message || "Failed to delete chat";
      toast.error(errorMessage);
    }
  };

  const isLoading = chatsLoading || membersLoading;

  // Get other participant for breadcrumb when chat is selected
  const otherParticipantForBreadcrumb = selectedChat ? getOtherParticipant(selectedChat) : null;

  // Breadcrumb items
  const breadcrumbItems = [
    {
      label: "Back",
      onClick: () => router.back()
    },
    { label: "Messages", href: selectedChat ? "/feeds/messages" : undefined },
    ...(selectedChat && otherParticipantForBreadcrumb
      ? [{ label: getUserFullName(otherParticipantForBreadcrumb), isActive: true }]
      : []),
  ];

  return (
    <div className="fixed inset-0 md:relative md:inset-auto md:h-full flex flex-col bg-gray-50 overflow-hidden pt-16 md:pt-0 ">
      {/* Breadcrumb - Hidden on mobile when chat is selected */}
      <div className={`flex-shrink-0 bg-white border-b border-gray-200 ${selectedChat ? 'hidden lg:block' : 'block'}`}>
        <Breadcrumb items={breadcrumbItems} />
      </div>



      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Full width on mobile, fixed width on larger screens */}
        <div className={`${selectedChat ? 'hidden lg:flex' : 'flex'} lg:w-80 xl:w-96 w-full bg-white border-r border-gray-200 flex-col overflow-hidden`}>
          {/* Sidebar Header */}
          <div className="bg-teal-600 p-3 sm:p-4 text-white">
            <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Chats</h2>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-white/70" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search or start new chat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim().length > 0 && searchResults.length > 0) {
                    setShowDropdown(true);
                  }
                }}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-[#0D1B2A] text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 border border-gray-700 transition-all"
              />

              {/* Autocomplete Dropdown */}
              {showDropdown && searchQuery.trim().length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[400px] overflow-y-auto z-50"
                >
                  {searchResults.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No results found
                    </div>
                  ) : (
                    <div className="py-1">
                      {searchResults.map((result: any, index: number) => {
                        if (result.type === "chat") {
                          const chat = result.data;
                          const otherParticipant = getOtherParticipant(chat);
                          const lastMessage = chat.latestMessage || chat.lastMessage;
                          const isUnread = (chat.unseenMsg || chat.unreadCount || 0) > 0;

                          return (
                            <div
                              key={chat._id || `chat-${index}`}
                              onClick={() => {
                                handleChatClick(chat._id);
                                setSearchQuery("");
                                setShowDropdown(false);
                              }}
                              className="px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex-shrink-0 w-10 h-10">
                                {otherParticipant?.avatar ? (
                                  <img
                                    src={
                                      otherParticipant.avatar.startsWith("https")
                                        ? otherParticipant.avatar
                                        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/${otherParticipant.avatar}`
                                    }
                                    alt={getUserFullName(otherParticipant)}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                                    {getUserFullName(otherParticipant).charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className={`text-sm text-gray-900 truncate ${isUnread ? "font-semibold" : "font-medium"}`}>
                                    {getUserFullName(otherParticipant)}
                                  </h3>
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Chat</span>
                                </div>
                                {lastMessage && (
                                  <p className="text-xs text-gray-500 truncate mt-0.5">
                                    {lastMessage.content}
                                  </p>
                                )}
                              </div>

                              {isUnread && (
                                <div className="flex-shrink-0">
                                  <div className="bg-green-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
                                    {chat.unseenMsg || chat.unreadCount}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        }

                        if (result.type === "member") {
                          const member = result.data;
                          const fullName = getUserFullName(member);
                          const hasChat = (result as any).hasExistingChat;

                          return (
                            <div
                              key={`member-${member._id || index}`}
                              onClick={() => handleStartConversation(member)}
                              className="px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex-shrink-0 w-10 h-10">
                                {member.avatar ? (
                                  <img
                                    src={
                                      member.avatar.startsWith("https")
                                        ? member.avatar
                                        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/${member.avatar}`
                                    }
                                    alt={fullName}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className={`w-10 h-10 rounded-full ${hasChat ? "bg-blue-600" : "bg-green-600"} flex items-center justify-center text-white font-semibold text-sm`}>
                                    {fullName.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium text-sm text-gray-900 truncate">{fullName}</h3>
                                  <span className={`text-xs ${hasChat ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"} px-2 py-0.5 rounded-full`}>
                                    {hasChat ? "Chat" : "New"}
                                  </span>
                                </div>
                                {member.businessCategory && (
                                  <p className="text-xs text-gray-500 truncate mt-0.5">{member.businessCategory}</p>
                                )}
                              </div>
                            </div>
                          );
                        }

                        return null;
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-white">
            {/* Hide sidebar list when dropdown is showing */}
            {showDropdown && searchQuery.trim().length > 0 ? null : isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-5 h-5 text-teal-600 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Loading...</p>
                </div>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center px-4">
                  <MessageCircle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    {searchQuery ? "No results found" : "No messages yet"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {searchQuery
                      ? "Try a different name"
                      : "Search to start chatting"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {searchResults.map((result: any, index: number) => {
                  if (result.type === "chat") {
                    const chat = result.data;
                    const otherParticipant = getOtherParticipant(chat);
                    const isUnread = (chat.unseenMsg || chat.unreadCount || 0) > 0;
                    const lastMessage = chat.latestMessage || chat.lastMessage;

                    return (
                      <div
                        key={chat._id || `chat-${index}`}
                        className={`p-3 hover:bg-gray-50 transition-colors flex items-center gap-3 group relative border-b border-gray-100 last:border-b-0 ${selectedChat?._id === chat._id ? "bg-teal-50 border-l-4 border-l-teal-600" : "bg-white"
                          }`}
                      >
                        <div
                          onClick={() => handleChatClick(chat._id)}
                          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                        >
                          <div className="flex-shrink-0 w-10 h-10">
                            {otherParticipant?.avatar ? (
                              <img
                                src={
                                  otherParticipant.avatar.startsWith("https")
                                    ? otherParticipant.avatar
                                    : `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/${otherParticipant.avatar}`
                                }
                                alt={getUserFullName(otherParticipant)}
                                className="w-10 h-10 rounded-full object-cover"
                                style={{ width: 40, height: 40, objectFit: 'cover' }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                                {getUserFullName(otherParticipant).charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex-1 min-w-0">
                                <h3 className={`text-sm text-gray-900 truncate ${isUnread ? "font-semibold" : "font-medium"}`}>
                                  {getUserFullName(otherParticipant)}
                                </h3>
                              </div>

                              {lastMessage && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                                  <Clock className="w-3 h-3" />
                                  <span className="text-xs whitespace-nowrap">{formatTimestamp(lastMessage.createdAt)}</span>
                                </div>
                              )}
                            </div>

                            {lastMessage && (
                              <div className="flex items-center gap-1.5">
                                {lastMessage.sender === currentUserId && (
                                  <CheckCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                )}
                                <p className={`text-xs truncate ${isUnread ? "text-gray-900 font-medium" : "text-gray-500"}`}>
                                  {lastMessage.content}
                                </p>
                              </div>
                            )}
                          </div>

                          {isUnread && (
                            <div className="flex-shrink-0">
                              <div className="bg-green-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
                                {chat.unseenMsg || chat.unreadCount}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Three-dot menu */}
                        <div className="relative flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setChatMenuOpenForChatId(chatMenuOpenForChatId === chat._id ? null : chat._id);
                            }}
                            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>

                          {chatMenuOpenForChatId === chat._id && (
                            <div className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-lg border border-gray-200 py-1 z-50 min-w-[220px]">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteChat(chat._id, chat);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete Conversation
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  if (result.type === "member") {
                    const member = result.data;
                    const fullName = getUserFullName(member);
                    const hasChat = (result as any).hasExistingChat;

                    return (
                      <div
                        key={`member-${member._id || index}`}
                        onClick={() => handleStartConversation(member)}
                        className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-3 ${hasChat ? "border-l-2 border-blue-300" : "border-l-2 border-green-500"
                          }`}
                      >
                        <div className="flex-shrink-0 w-10 h-10">
                          {member.avatar ? (
                            <img
                              src={
                                member.avatar.startsWith("https")
                                  ? member.avatar
                                  : `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/${member.avatar}`
                              }
                              alt={fullName}
                              className="w-10 h-10 rounded-full object-cover"
                              style={{ width: 40, height: 40, objectFit: 'cover' }}
                            />
                          ) : (
                            <div className={`w-10 h-10 rounded-full ${hasChat ? "bg-blue-600" : "bg-green-600"} flex items-center justify-center text-white font-semibold text-sm`}>
                              {fullName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm text-gray-900 truncate">{fullName}</h3>
                          {member.businessCategory && <p className="text-xs text-gray-500 truncate">{member.businessCategory}</p>}
                          <p className={`text-xs ${hasChat ? "text-blue-600" : "text-green-600"} italic mt-0.5`}>
                            {hasChat ? "Open existing chat" : "Click to start conversation"}
                          </p>
                        </div>

                        <div className="flex-shrink-0 self-start">
                          <span className={`${hasChat ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"} text-xs font-medium px-2 py-0.5 rounded-full`}>
                            {hasChat ? "Chat" : "New"}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat panel - Full width on mobile when chat selected */}
        <div className={`${selectedChat ? 'flex' : 'hidden lg:flex'} flex-1 bg-white flex-col overflow-hidden h-full`}>
          {selectedChat ? (
            <div className="flex flex-col h-full relative">
              {/* Chat Header - WhatsApp style with back button - FIXED */}
              <div className="flex-shrink-0 bg-teal-700 p-2 sm:p-3 flex items-center gap-2 sm:gap-3 shadow-sm">
                {/* Back button - only on mobile */}
                <button
                  onClick={() => {
                    setSelectedChat(null);
                    router.back();
                  }}
                  className="lg:hidden p-2 hover:bg-teal-600 rounded-full transition-colors"
                  aria-label="Back to chats"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    const other = getOtherParticipant(selectedChat);
                    if (other?._id) {
                      router.push(`/feeds/connections/${other._id}?from=messages`);
                    }
                  }}
                  className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {(() => {
                    const other = getOtherParticipant(selectedChat);
                    if (other?.avatar) {
                      return (
                        <img
                          src={other.avatar.startsWith("https") ? other.avatar : `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/${other.avatar}`}
                          alt={getUserFullName(other)}
                          className="w-10 h-10 rounded-full object-cover"
                          style={{ width: 40, height: 40, objectFit: 'cover' }}
                        />
                      );
                    }
                    return (
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                        {getUserFullName(other).charAt(0).toUpperCase()}
                      </div>
                    );
                  })()}
                </button>
                <div className="flex-1">
                  <button
                    onClick={() => {
                      const other = getOtherParticipant(selectedChat);
                      if (other?._id) {
                        router.push(`/feeds/connections/${other._id}?from=messages`);
                      }
                    }}
                    className="text-sm font-semibold text-white hover:text-teal-100 transition-colors text-left cursor-pointer"
                  >
                    {getUserFullName(getOtherParticipant(selectedChat))}
                  </button>
                  {getOtherParticipant(selectedChat)?.businessCategory && (
                    <div className="text-xs text-teal-100">{getOtherParticipant(selectedChat)?.businessCategory}</div>
                  )}
                </div>
                <div className="relative" ref={chatMenuRef}>
                  <button
                    onClick={() => setShowChatMenu(!showChatMenu)}
                    className="p-2 hover:bg-teal-600 rounded-full transition-colors"
                    title="More options"
                  >
                    <MoreVertical className="w-5 h-5 text-white" />
                  </button>

                  {showChatMenu && (
                    <div className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-lg border border-gray-200 py-1 z-10 min-w-[220px]">
                      <button
                        onClick={() => handleDeleteChat()}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Conversation
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages Area - SCROLLABLE */}
              <div
                ref={messagesAreaRef}
                className="flex-1 overflow-y-auto p-3 sm:p-4"
                id="messages-area"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(
                      45deg,
                      rgba(229, 231, 235, 0.1) 0px,
                      rgba(229, 231, 235, 0.1) 10px,
                      rgba(243, 244, 246, 0.1) 10px,
                      rgba(243, 244, 246, 0.1) 20px
                    ),
                    linear-gradient(to bottom, #e5ddd5 0%, #f0ebe5 100%)
                  `,
                  backgroundColor: '#e5ddd5'
                }}
              >
                {/* Render message thread: left = received, right = sent */}
                {(() => {
                  const other = getOtherParticipant(selectedChat);
                  // Use getMessagesList helper which merges fetched messages with chat-attached messages
                  const messagesList = getMessagesList(selectedChat);

                  if (!messagesList || messagesList.length === 0) {
                    return (
                      <div className="text-center text-gray-600 mt-8 bg-white bg-opacity-60 p-4 rounded-lg">No messages yet. Start the conversation below.</div>
                    );
                  }

                  return (
                    <div className="space-y-2 pb-4">
                      {messagesList.map((msg: any, idx: number) => {
                        // Robust check for message sender — support multiple shapes
                        const isSent = (() => {
                          if (!currentUserId) return false;
                          // direct id
                          if (msg.sender === currentUserId) return true;
                          if (msg.from === currentUserId) return true;
                          if (msg.userId === currentUserId) return true;
                          // nested sender object
                          if (msg.sender && typeof msg.sender === 'object') {
                            if (msg.sender._id === currentUserId || msg.sender.id === currentUserId) return true;
                          }
                          // sometimes sender is an object nested in `from` or `user`
                          if (msg.from && typeof msg.from === 'object') {
                            if (msg.from._id === currentUserId || msg.from.id === currentUserId) return true;
                          }
                          return false;
                        })();

                        const isEditing = editingMessageId === msg._id;

                        return (
                          <div key={msg._id || idx} className={`flex items-end group ${isSent ? 'justify-end' : 'justify-start'} w-full`}>
                            {/* Avatar for received messages */}
                            {!isSent && (
                              <div className="flex-shrink-0 mr-2">
                                {other?.avatar ? (
                                  <img
                                    src={other.avatar.startsWith('https') ? other.avatar : `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/${other.avatar}`}
                                    alt={getUserFullName(other)}
                                    className="w-8 h-8 rounded-full object-cover"
                                    style={{ width: 32, height: 32, objectFit: 'cover' }}
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm text-white">{getUserFullName(other).charAt(0).toUpperCase()}</div>
                                )}
                              </div>
                            )}

                            <div className="relative flex items-center gap-2 max-w-[75%]">
                              <div className={`break-words inline-block shadow-md ${isSent ? 'bg-white text-gray-900 border border-gray-200 rounded-lg rounded-tr-none' : 'bg-gray-50 text-gray-900 border border-gray-200 rounded-lg rounded-tl-none'} px-4 py-2.5`}>
                                {isEditing ? (
                                  <div className="flex flex-col gap-2">
                                    <input
                                      type="text"
                                      value={editingContent}
                                      onChange={(e) => setEditingContent(e.target.value)}
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                          handleEditMessage(msg._id);
                                        } else if (e.key === 'Escape') {
                                          setEditingMessageId(null);
                                          setEditingContent("");
                                        }
                                      }}
                                      className="text-sm bg-white text-gray-900 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                      autoFocus
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleEditMessage(msg._id)}
                                        className="text-xs px-2 py-1 bg-brand-green-dark text-white rounded hover:opacity-90"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingMessageId(null);
                                          setEditingContent("");
                                        }}
                                        className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="text-sm">{msg.content}</div>
                                    <div className={`text-xs mt-1 ${isSent ? 'text-white/80' : 'text-gray-500'}`}>{formatTimestamp(msg.createdAt)}</div>
                                  </>
                                )}
                              </div>

                              {/* Three-dot menu for sent messages */}
                              {isSent && !isEditing && (
                                <div className="relative">
                                  <button
                                    onClick={() => setMenuOpenForMessage(menuOpenForMessage === msg._id ? null : msg._id)}
                                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1 hover:bg-gray-200 rounded-full transition-opacity"
                                  >
                                    <MoreVertical className="w-4 h-4 text-gray-600" />
                                  </button>

                                  {menuOpenForMessage === msg._id && (
                                    <div className="absolute right-0 top-8 bg-white shadow-lg rounded-lg border border-gray-200 py-1 z-10 min-w-[120px]">
                                      <button
                                        onClick={() => startEditing(msg._id, msg.content)}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDeleteMessage(msg._id)}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Optionally show sender avatar for sent messages */}
                            {isSent && (
                              <div className="flex-shrink-0 ml-3">
                                {currentUser?.avatar ? (
                                  <img
                                    src={currentUser.avatar.startsWith('https') ? currentUser.avatar : `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/${currentUser.avatar}`}
                                    alt={getUserFullName(currentUser)}
                                    className="w-8 h-8 rounded-full object-cover"
                                    style={{ width: 32, height: 32, objectFit: 'cover' }}
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm text-white">{getUserFullName(currentUser).charAt(0).toUpperCase()}</div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Area - Colorful & Stylish - FIXED */}
              <div className="flex-shrink-0 bg-gradient-to-r from-purple-50 via-blue-50 to-pink-50 p-2 sm:p-3 md:p-4 border-t border-gray-200">
                <MessageInput
                  onSendMessage={async (message) => {
                    if (!message.trim() || !selectedChat) return;

                    try {
                      await sendMessage({
                        chatId: selectedChat._id,
                        content: message,
                      }).unwrap();

                      setMessageInput("");

                      // refresh chats list and the messages for the selected chat
                      try { refetch(); } catch { }
                      try { refetchChatMessages && refetchChatMessages(); } catch { }

                      // scroll to bottom
                      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                    } catch (err: any) {
                      console.error("Send error:", err);
                      const errorMessage = err?.data?.message || err?.message || (typeof err === "string" ? err : "Failed to send message");
                      toast.error(errorMessage);
                    }
                  }}
                  placeholder="Type a message..."
                  showEmojiPicker={true}
                  showFileUpload={false}
                  size="md"
                  variant="rounded"
                />
              </div>

              {/* Scroll to Bottom Button */}
              {showScrollBottom && (
                <button
                  onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
                  className="absolute bottom-24 right-4 z-50 p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                  aria-label="Scroll to bottom"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              )}
            </div>
          ) : (
            <div className="hidden lg:flex flex-1 flex-col items-center justify-center text-center p-8 text-gray-500">
              <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 mb-3 text-gray-300" />
              <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-1">Select a conversation</h3>
              <p className="text-xs sm:text-sm text-gray-500">Choose a chat on the left or search for a member to start chatting.</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Chat Confirmation Modal */}
      <ConfirmDialog
        isOpen={showDeleteChatModal}
        onClose={() => {
          setShowDeleteChatModal(false);
          setChatToDelete(null);
        }}
        onConfirm={confirmDeleteChat}
        title="Delete Conversation"
        message={
          chatToDelete
            ? `Are you sure you want to delete this conversation with ${getUserFullName(
              getOtherParticipant(chatToDelete.chat)
            )}?`
            : "Are you sure you want to delete this conversation?"
        }
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        warningText="This will permanently delete all messages in this chat."
      />

      {/* Scroll to Top Button - only shows in chat view */}

    </div>
  );
}
