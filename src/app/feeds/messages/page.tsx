"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import {
  useGetUserChatsQuery,
  useGetCommunityMembersQuery,
  useGetOrCreateChatMutation,
  useGetChatMessagesQuery,
  useSendMessageMutation,
  useDeleteMessageMutation,
  useEditMessageMutation,
  useMarkMessagesAsReadMutation,
  type Chat,
  type UserForChat,
} from "../../../../store/api/messageApi";
import { useGetCurrentUserQuery } from "../../../../store/api/userApi";
import { formatDistanceToNow } from "date-fns";
import { initializeSocket } from "@/lib/socket";
import { skipToken } from "@reduxjs/toolkit/query/react";
import toast from "react-hot-toast";

export default function MessagesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [menuOpenForMessage, setMenuOpenForMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Get current user
  const { data: currentUser } = useGetCurrentUserQuery();
  const currentUserId = currentUser?._id || currentUser?.id;

  // Fetch user chats and all members
  const { data: chats = [], isLoading: chatsLoading, refetch } = useGetUserChatsQuery();
  const { data: allMembers = [], isLoading: membersLoading } = useGetCommunityMembersQuery();

  // Mutations
  const [getOrCreateChat] = useGetOrCreateChatMutation();
  const [sendMessage] = useSendMessageMutation();
  const [deleteMessage] = useDeleteMessageMutation();
  const [editMessage] = useEditMessageMutation();
  const [markAsRead] = useMarkMessagesAsReadMutation();

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
            try { refetchChatMessages && refetchChatMessages(); } catch {}
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
        // Members without chats matching search
        ...membersWithoutChats
          .map((member) => {
            const fullName = member.fullName || `${member.fname} ${member.lname}`.trim();
            if (fullName.toLowerCase().includes(searchQuery.toLowerCase())) {
              return { type: "member" as const, data: member };
            }
            return null;
          })
          .filter(Boolean),
      ]
    : chats.map((chat) => ({ type: "chat" as const, data: chat }));

  // Handler for starting a conversation with a member
  const handleStartConversation = async (member: UserForChat) => {
    try {
      // Create or get existing chat
      const chat = await getOrCreateChat({ userId: member._id }).unwrap();

      // set selected chat in UI instead of navigating away
      setSelectedChat(chat as Chat);
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

    // Mark messages as read when opening chat
    if (c) {
      const other = (c.users || c.participants || []).find((u) => u._id !== currentUserId);
      if (other?._id) {
        // Mark as read by sending targetUserId or chatId
        markAsRead({ chatId: c._id, targetUserId: other._id }).catch((err) => {
          console.log("Could not mark as read:", err);
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

  const isLoading = chatsLoading || membersLoading;
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between py-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-1">Chat with your connections</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[72vh]">
        {/* Sidebar */}
        <div className="col-span-4 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search conversations or members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading conversations...</p>
                </div>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {searchQuery ? "No results found" : "No messages yet"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery
                      ? "Try searching for a different name"
                      : "Start a conversation with your connections"}
                  </p>
                </div>
              </div>
            ) : (
        <div className="divide-y divide-gray-200">
                {searchResults.map((result: any) => {
                  if (result.type === "chat") {
                    const chat = result.data;
                    const otherParticipant = getOtherParticipant(chat);
                    const isUnread = (chat.unseenMsg || chat.unreadCount || 0) > 0;
                    const lastMessage = chat.latestMessage || chat.lastMessage;

                    return (
                      <div
                        key={chat._id}
                        onClick={() => handleChatClick(chat._id)}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-start gap-4 ${
                          selectedChat?._id === chat._id ? "bg-gray-50" : ""
                        }`}
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
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className={`font-semibold text-gray-900 truncate ${isUnread ? "font-bold" : ""}`}>
                                {getUserFullName(otherParticipant)}
                              </h3>
                              {otherParticipant?.businessCategory && (
                                <p className="text-xs text-gray-500 truncate">{otherParticipant.businessCategory}</p>
                              )}
                            </div>

                            {lastMessage && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>{formatTimestamp(lastMessage.createdAt)}</span>
                              </div>
                            )}
                          </div>

                          {lastMessage && (
                            <div className="flex items-center gap-2 mt-1">
                              {lastMessage.sender === currentUserId && (
                                <CheckCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              )}
                              <p className={`text-sm truncate ${isUnread ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                                {lastMessage.content}
                              </p>
                            </div>
                          )}
                        </div>

                        {isUnread && (
                          <div className="flex-shrink-0">
                            <div className="bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
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

                    return (
                      <div
                        key={`member-${member._id}`}
                        onClick={() => handleStartConversation(member)}
                        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 border-green-500 flex items-start gap-4"
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
                            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold text-sm">
                              {fullName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{fullName}</h3>
                          {member.businessCategory && <p className="text-xs text-gray-500 truncate">{member.businessCategory}</p>}
                          <p className="text-sm text-green-600 italic mt-1">Click to start conversation</p>
                        </div>

                        <div className="flex-shrink-0">
                          <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">New</span>
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

        {/* Chat panel */}
        <div className="col-span-8 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          {selectedChat ? (
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b flex items-center gap-4">
                <div className="flex-shrink-0">
                  {(() => {
                    const other = getOtherParticipant(selectedChat);
                    if (other?.avatar) {
                      return (
                        <img
                          src={other.avatar.startsWith("https") ? other.avatar : `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/${other.avatar}`}
                          alt={getUserFullName(other)}
                          className="w-12 h-12 rounded-full object-cover"
                          style={{ width: 48, height: 48, objectFit: 'cover' }}
                        />
                      );
                    }
                    return (
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                        {getUserFullName(other).charAt(0).toUpperCase()}
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <div className="font-semibold">{getUserFullName(getOtherParticipant(selectedChat))}</div>
                  {getOtherParticipant(selectedChat)?.businessCategory && (
                    <div className="text-xs text-gray-500">{getOtherParticipant(selectedChat)?.businessCategory}</div>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 min-h-0" id="messages-area" style={{ maxHeight: 'calc(72vh - 200px)' }}>
                {/* Render message thread: left = received, right = sent */}
                {(() => {
                  const other = getOtherParticipant(selectedChat);
                  // Use getMessagesList helper which merges fetched messages with chat-attached messages
                  const messagesList = getMessagesList(selectedChat);

                  if (!messagesList || messagesList.length === 0) {
                    return (
                      <div className="text-center text-gray-500 mt-8">No messages yet. Start the conversation below.</div>
                    );
                  }

                  return (
                    <div className="space-y-4 pb-4">
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

                            <div className="relative flex items-center gap-2 max-w-[80%]">
                              <div className={`break-words inline-block ${isSent ? 'text-white bg-blue-600 rounded-lg rounded-tr-none' : 'bg-gray-200 text-gray-900 rounded-lg rounded-tl-none'} p-3`}> 
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
                                      className="text-sm bg-white text-gray-900 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      autoFocus
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleEditMessage(msg._id)}
                                        className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
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
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded-full transition-opacity"
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

              <div className="p-4 border-t">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!messageInput.trim() || !selectedChat) return;
                    try {
                      await sendMessage({ chatId: selectedChat._id, content: messageInput }).unwrap();
                      setMessageInput("");
                      // refresh chats list and the messages for the selected chat
                      try { refetch(); } catch {}
                      try { refetchChatMessages && refetchChatMessages(); } catch {}
                      // scroll to bottom
                      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                    } catch (err: any) {
                        // Safely serialize errors (handles circular refs) and log as a string
                        try {
                          const safeStringify = (obj: any) => {
                            const seen = new WeakSet();
                            return JSON.stringify(obj, function (_key, value) {
                              if (typeof value === "object" && value !== null) {
                                if (seen.has(value)) return "[Circular]";
                                seen.add(value);
                              }
                              return value;
                            });
                          };

                          const payload = typeof err === "string" ? err : safeStringify(err);
                          // Use console.log to avoid potential overridden error handlers
                          if (typeof console !== "undefined" && console.log) console.log("sendMessage error:", payload);
                        } catch (loggingErr) {
                          // swallow any logging errors
                        }

                        const message = err?.data?.message || err?.message || (typeof err === "string" ? err : "Failed to send message");
                        toast.error(message);
                      }
                  }}
                  className="flex gap-2"
                >
                  <input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Type a message"
                  />
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Send</button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500">
              <MessageCircle className="w-20 h-20 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
              <p>Choose a chat on the left or start a new conversation with a member.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
