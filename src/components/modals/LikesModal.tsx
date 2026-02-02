"use client";

import React, { useState, useMemo, useCallback } from "react";
import { X, Heart, Search, UserPlus, Check, Clock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import { Like, LikeUser } from "../../types/bizpulse.types";
import {
  useGetConnectionsQuery,
  useGetConnectionRequestsQuery,
  useSendConnectionRequestMutation,
  useAcceptConnectionRequestMutation,
} from "../../../store/api/connectionsApi";
import { useAppDispatch } from "../../../store/hooks";
import { addToast } from "../../../store/toastSlice";
import Avatar from "../ui/Avatar";

interface LikesModalProps {
  isOpen: boolean;
  onClose: () => void;
  likes: Like[];
  postId: string;
}

type ConnectionStatus = "self" | "connected" | "pending_sent" | "pending_received" | "none";

export default function LikesModal({ isOpen, onClose, likes, postId }: LikesModalProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // Get current user
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const currentUserId = currentUser?._id || currentUser?.id;

  // Get connections data for status checking
  const { data: connections } = useGetConnectionsQuery();
  const { data: sentRequests } = useGetConnectionRequestsQuery("sent");
  const { data: receivedRequests } = useGetConnectionRequestsQuery("received");

  // Mutations
  const [sendConnectionRequest] = useSendConnectionRequestMutation();
  const [acceptConnectionRequest] = useAcceptConnectionRequestMutation();

  // Build sets for quick lookup - connections can have _id or id
  const connectedIds = useMemo(() => {
    const ids = new Set<string>();
    connections?.forEach((c: any) => {
      if (c._id) ids.add(c._id);
      if (c.id) ids.add(c.id);
    });
    console.log('[LikesModal] Connected IDs:', Array.from(ids));
    return ids;
  }, [connections]);

  const pendingSentIds = useMemo(() => {
    return new Set(
      sentRequests?.data?.connections?.map((r: any) => r.receiver?.id) || []
    );
  }, [sentRequests]);

  const pendingReceivedMap = useMemo(() => {
    const map = new Map<string, string>();
    receivedRequests?.data?.connections?.forEach((r: any) => {
      if (r.sender?.id) {
        map.set(r.sender.id, r.connectionId);
      }
    });
    return map;
  }, [receivedRequests]);

  // Helper to get avatar URL
  const getAvatarUrl = useCallback((avatarPath?: string) => {
    if (!avatarPath) return undefined;
    if (avatarPath.startsWith("http")) return avatarPath;
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    return `${baseUrl}/image/${avatarPath}`;
  }, []);

  // Extract user info from like
  const getUserFromLike = useCallback((like: Like): LikeUser | null => {
    if (typeof like.userId === "object" && like.userId !== null) {
      return like.userId as LikeUser;
    }
    return null;
  }, []);

  // Get connection status for a user
  const getConnectionStatus = useCallback((userId: string): ConnectionStatus => {
    console.log('[LikesModal] Checking status for userId:', userId, 'currentUserId:', currentUserId);
    console.log('[LikesModal] Is in connectedIds?', connectedIds.has(userId));
    if (userId === currentUserId) return "self";
    if (connectedIds.has(userId)) return "connected";
    if (pendingSentIds.has(userId)) return "pending_sent";
    if (pendingReceivedMap.has(userId)) return "pending_received";
    return "none";
  }, [currentUserId, connectedIds, pendingSentIds, pendingReceivedMap]);

  // Filter likes based on search
  const filteredLikes = useMemo(() => {
    if (!searchQuery.trim()) return likes;

    const query = searchQuery.toLowerCase();
    return likes.filter((like) => {
      const user = getUserFromLike(like);
      if (!user) return false;
      const fullName = `${user.fname || ""} ${user.lname || ""}`.toLowerCase();
      return fullName.includes(query) || user.username?.toLowerCase().includes(query);
    });
  }, [likes, searchQuery, getUserFromLike]);

  // Handle user click - navigate to profile
  const handleUserClick = useCallback((userId: string) => {
    onClose();
    if (userId === currentUserId) {
      router.push("/feeds/myprofile");
    } else {
      router.push(`/feeds/connections/${userId}?from=likes-modal`);
    }
  }, [currentUserId, onClose, router]);

  // Handle connect button click
  const handleConnect = useCallback(async (userId: string) => {
    setProcessingIds((prev) => new Set(prev).add(userId));
    try {
      await sendConnectionRequest({ receiverId: userId }).unwrap();
      dispatch(
        addToast({
          type: "success",
          message: "Connection request sent!",
          duration: 3000,
        })
      );
    } catch (error: any) {
      dispatch(
        addToast({
          type: "error",
          message: error?.data?.message || "Failed to send request",
          duration: 3000,
        })
      );
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  }, [sendConnectionRequest, dispatch]);

  // Handle accept button click
  const handleAccept = useCallback(async (userId: string) => {
    const connectionId = pendingReceivedMap.get(userId);
    if (!connectionId) return;

    setProcessingIds((prev) => new Set(prev).add(userId));
    try {
      await acceptConnectionRequest({ connectionId }).unwrap();
      dispatch(
        addToast({
          type: "success",
          message: "Connection accepted!",
          duration: 3000,
        })
      );
    } catch (error: any) {
      dispatch(
        addToast({
          type: "error",
          message: error?.data?.message || "Failed to accept request",
          duration: 3000,
        })
      );
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  }, [acceptConnectionRequest, pendingReceivedMap, dispatch]);

  // Render connect button based on status
  const renderConnectButton = useCallback((userId: string, status: ConnectionStatus) => {
    const isProcessing = processingIds.has(userId);

    switch (status) {
      case "self":
        return null;

      case "connected":
        return (
          <span className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-full">
            <Check className="w-3 h-3" />
            Connected
          </span>
        );

      case "pending_sent":
        return (
          <span className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );

      case "pending_received":
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAccept(userId);
            }}
            disabled={isProcessing}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-full transition-colors disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Check className="w-3 h-3" />
            )}
            Accept
          </button>
        );

      case "none":
      default:
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleConnect(userId);
            }}
            disabled={isProcessing}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <UserPlus className="w-3 h-3" />
            )}
            Connect
          </button>
        );
    }
  }, [processingIds, handleConnect, handleAccept]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30 p-4">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fadeIn max-h-[80vh] flex flex-col">
        {/* Decorative gradient header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-red-500 to-pink-500" />

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-pink-100 to-red-100 rounded-xl">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Liked by</h2>
              <p className="text-xs text-gray-500">{likes.length} {likes.length === 1 ? 'person' : 'people'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search Bar */}
        {likes.length > 5 && (
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          {filteredLikes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Heart className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm text-center">
                {searchQuery ? "No users found matching your search" : "No likes yet"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredLikes.map((like, index) => {
                const user = getUserFromLike(like);
                if (!user) return null;

                const userId = user._id || (user as any).id;
                const userName = `${user.fname || ""} ${user.lname || ""}`.trim() || "Unknown User";
                const status = getConnectionStatus(userId);
                console.log('[LikesModal] User:', userName, 'userId:', userId, 'status:', status);

                return (
                  <div
                    key={userId || index}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleUserClick(userId)}
                  >
                    {/* Avatar */}
                    <Avatar
                      src={getAvatarUrl(user.avatar)}
                      alt={userName}
                      size="sm"
                      fallbackText={userName}
                      showMembershipBorder={false}
                    />

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate hover:text-blue-600">
                        {userName}
                        {status === "self" && (
                          <span className="ml-1 text-xs font-normal text-gray-500">(You)</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.classification || user.role || "Business Professional"}
                      </p>
                    </div>

                    {/* Connect Button */}
                    <div onClick={(e) => e.stopPropagation()}>
                      {renderConnectButton(userId, status)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
