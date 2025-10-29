"use client";

import { useState } from "react";
import { WallFeedPost, PollOption } from "@/types/bizpulse.types";
import { bizpulseApi } from "@/services/bizpulseApi";
import Avatar from "@/components/ui/Avatar";
import { Calendar, ThumbsUp, MessageSquare, X } from "lucide-react";
import Image from "next/image";

interface PollCardProps {
  post: WallFeedPost;
  currentUserId: string;
  onVoteSuccess?: (updatedPost: WallFeedPost) => void;
  onLike?: (postId: string) => void;
}

export default function PollCard({
  post,
  currentUserId,
  onVoteSuccess,
  onLike,
}: PollCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Track local vote state that updates immediately
  const [localHasVoted, setLocalHasVoted] = useState<boolean | null>(null);
  const [localVotedOptionIndex, setLocalVotedOptionIndex] = useState<
    number | null
  >(null);

  const poll = post.poll;
  if (!poll) return null;

  // Check if user has already voted - Simple logic like mobile app
  const userVote = poll.voters.find((voter) => {
    // Handle both string and object userId formats
    const voterId =
      typeof voter.userId === "object" && voter.userId !== null
        ? (voter.userId as any)?._id
        : voter.userId;

    return String(voterId) === String(currentUserId);
  });

  // Use local state if available, otherwise check voters array
  const hasVoted = localHasVoted !== null ? localHasVoted : !!userVote;
  const votedOptionIndex =
    localVotedOptionIndex !== null
      ? localVotedOptionIndex
      : userVote?.optionIndex;

  // Calculate percentage for each option
  const calculatePercentage = (votes: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  // Handle vote submission - Same logic as mobile app
  const handleVote = async (optionIndex: number) => {
    if (isVoting) return;

    // Check if currentUserId is available
    if (!currentUserId) {
      setError("Unable to vote. Please log in first.");
      setTimeout(() => setError(null), 3000);
      console.error("❌ Vote failed: currentUserId is empty", {
        currentUserId,
        hasVoted,
        votedOptionIndex,
      });
      return;
    }

    // Check if user has already voted - prevent duplicate votes (mobile app logic)
    if (hasVoted) {
      setError("You have already voted!");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsVoting(true);
    setError(null);

    console.log("🗳️ Starting vote process:", {
      optionIndex,
      currentUserId,
      postId: post._id,
    });

    // Optimistically update UI
    setSelectedOption(poll.options[optionIndex]._id);
    setLocalHasVoted(true);
    setLocalVotedOptionIndex(optionIndex);

    try {
      // Submit vote to backend
      console.log("📮 Submitting vote for option", optionIndex);
      const response = await bizpulseApi.voteOnPoll(post._id, optionIndex);
      console.log("✅ Vote submitted, full response:", response);
      console.log("Response structure:", {
        success: response.success,
        hasData: !!response.data,
        message: response.message,
      });

      if (response.success && response.data) {
        // Update with fresh data from server (backend returns wallFeed directly in data)
        onVoteSuccess?.(response.data);
        console.log("🎉 Vote successfully saved to backend!");
      } else {
        // Revert optimistic update if failed
        setLocalHasVoted(null);
        setLocalVotedOptionIndex(null);
        setSelectedOption(null);
        throw new Error(response.message || "Vote failed");
      }
    } catch (err: any) {
      console.error("❌ Vote error:", err);

      // Rollback optimistic update
      setLocalHasVoted(null);
      setLocalVotedOptionIndex(null);
      setSelectedOption(null);

      setError(err.message || "Failed to submit vote. Please try again.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsVoting(false);
    }
  };

  // Handle vote removal - Same logic as mobile app
  const handleRemoveVote = async () => {
    if (!hasVoted || isVoting) return;

    setIsVoting(true);
    setError(null);

    try {
      console.log("🗑️ Removing vote from poll:", post._id);
      const response = await bizpulseApi.removeVote(post._id);
      console.log("✅ Vote removed successfully:", response);

      if (response.success && response.data) {
        // Clear the selected option
        setLocalHasVoted(null);
        setLocalVotedOptionIndex(null);
        setSelectedOption(null);

        // Update with fresh data from server (backend returns wallFeed directly in data)
        onVoteSuccess?.(response.data);
      } else {
        throw new Error(response.message || "Failed to remove vote");
      }
    } catch (err: any) {
      console.error("❌ Remove vote error:", err);

      const errorMessage = err.message || "Failed to remove vote";

      // Check if user hasn't voted yet
      if (err.message && err.message.includes("not voted")) {
        setError("You have not voted yet on this poll.");
      } else {
        setError(errorMessage);
      }

      setTimeout(() => setError(null), 3000);
    } finally {
      setIsVoting(false);
    }
  };

  const getAuthorName = () => {
    return `${post.userId.fname} ${post.userId.lname}`;
  };

  const getAuthorCompany = () => {
    return "BizCivitas Member";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Poll Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <Avatar
              src={post.userId.avatar}
              alt={getAuthorName()}
              size="md"
              fallbackText={getAuthorName()}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900 truncate">
                  {getAuthorName()}
                </h3>
                {post.badge && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {post.badge}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 truncate">
                {getAuthorCompany()}
              </p>
              <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>
                  {post.timeAgo ||
                    new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Poll Question */}
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {poll.question}
        </h2>

        {/* Poll Image (if exists) */}
        {post.images && post.images.length > 0 && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <Image
              src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/image/${post.images[0]}`}
              alt="Poll image"
              width={800}
              height={400}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2">
            <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Poll Options */}
        <div className="space-y-3">
          {poll.options.map((option: PollOption, index: number) => {
            const percentage = calculatePercentage(
              option.votes,
              poll.totalVotes
            );
            const isSelected = selectedOption === option._id;
            const isVotedOption = hasVoted && votedOptionIndex === index;

            return (
              <button
                key={option._id}
                onClick={() => handleVote(index)}
                disabled={isVoting || (hasVoted && !isVotedOption)}
                className={`w-full text-left transition-all ${
                  isVotedOption
                    ? "bg-green-500 border-green-600 ring-2 ring-green-400 shadow-md"
                    : hasVoted
                    ? "bg-gray-100 border-gray-300 text-gray-500 opacity-60 cursor-not-allowed"
                    : "bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm"
                } ${
                  isSelected ? "bg-blue-50 border-blue-300 shadow-sm" : ""
                } border rounded-lg p-4 relative overflow-hidden ${
                  hasVoted && !isVotedOption
                    ? "cursor-not-allowed"
                    : "cursor-pointer"
                } disabled:cursor-not-allowed`}
              >
                {/* Progress Bar Background - show for all options when hasVoted */}
                {hasVoted && (
                  <div
                    className={`absolute inset-0 transition-all duration-500 ${
                      isVotedOption ? "bg-green-400/30" : "bg-gray-200"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                )}

                {/* Option Content */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        isVotedOption
                          ? "text-white"
                          : hasVoted
                          ? "text-gray-500"
                          : "text-gray-900"
                      }`}
                    >
                      {option.text}
                    </p>
                    {hasVoted && (
                      <p
                        className={`text-sm mt-1 ${
                          isVotedOption ? "text-green-100" : "text-gray-500"
                        }`}
                      >
                        {option.votes} {option.votes === 1 ? "vote" : "votes"}
                      </p>
                    )}
                  </div>
                  {hasVoted && (
                    <div className="ml-4">
                      <span
                        className={`text-lg font-bold ${
                          isVotedOption ? "text-white" : "text-gray-500"
                        }`}
                      >
                        {percentage}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Loading Indicator */}
                {isVoting && isSelected && (
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Total Votes & Remove Vote */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">{poll.totalVotes}</span> total{" "}
            {poll.totalVotes === 1 ? "vote" : "votes"}
          </p>
          {hasVoted && !isVoting && (
            <a
              onClick={handleRemoveVote}
              className="text-sm text-red-600 hover:text-red-700 underline cursor-pointer transition-colors"
            >
              Remove vote
            </a>
          )}
        </div>
      </div>

      {/* Poll Footer - Like & Comment */}
      <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => onLike?.(post._id)}
              className={`flex items-center space-x-2 text-sm transition-colors ${
                post.isLiked
                  ? "text-blue-600 font-medium"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              <ThumbsUp
                className={`w-4 h-4 ${post.isLiked ? "fill-current" : ""}`}
              />
              {post.likeCount > 0 && <span>{post.likeCount}</span>}
            </button>
           
          </div>
        </div>
      </div>
    </div>
  );
}
