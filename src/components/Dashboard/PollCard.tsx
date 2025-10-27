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

  // Check if user has already voted - use local state if available, otherwise fall back to post data
  // IMPORTANT: voter.userId can be either a string or an object with _id property
  console.log("🔍 Poll Details:", {
    pollId: post._id,
    pollQuestion: poll.question,
    votersCount: poll.voters.length,
    voters: poll.voters.map((v) => ({
      userId: v.userId,
      userIdType: typeof v.userId,
      userIdValue:
        typeof v.userId === "object" ? (v.userId as any)?._id : v.userId,
    })),
    currentUserId,
    currentUserIdType: typeof currentUserId,
  });

  const userVote = poll.voters.find((voter) => {
    // Normalize voter.userId to string
    const voterId =
      typeof voter.userId === "object" && voter.userId !== null
        ? String((voter.userId as any)?._id ?? voter.userId)
        : String(voter.userId);

    // Normalize currentUserId to string
    const normalizedCurrentUserId = String(currentUserId);

    console.log("🔍 Vote Check:", {
      voter: voter,
      voterUserId: voter.userId,
      voterUserIdType: typeof voter.userId,
      voterIdObject: typeof voter.userId === "object" ? voter.userId : null,
      extractedVoterId: voterId,
      currentUserId: normalizedCurrentUserId,
      matches: voterId === normalizedCurrentUserId,
    });

    const matches = voterId === normalizedCurrentUserId;
    if (matches) {
      console.log("✅ Found matching vote:", {
        voterId,
        currentUserId: normalizedCurrentUserId,
        optionIndex: voter.optionIndex,
      });
    }
    return matches;
  });

  const hasVoted =
    localHasVoted !== null ? localHasVoted : post.hasVoted ?? !!userVote;
  const votedOptionIndex =
    localVotedOptionIndex !== null
      ? localVotedOptionIndex
      : post.userVotedOptionIndex ?? userVote?.optionIndex;

  // Debug logging
  console.log("🗳️ Poll Vote Status:", {
    postId: post._id,
    pollQuestion: poll.question,
    currentUserId,
    hasVoted,
    votedOptionIndex,
    postHasVoted: post.hasVoted,
    postUserVotedOptionIndex: post.userVotedOptionIndex,
    votersArray: poll.voters,
    userVoteFromArray: userVote,
    localHasVoted,
    localVotedOptionIndex,
  });

  // Calculate percentage for each option
  const calculatePercentage = (votes: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  // Handle vote submission or change vote
  const handleVote = async (optionIndex: number) => {
    if (isVoting) return;

    // Check if currentUserId is available
    if (!currentUserId) {
      setError("Unable to vote. Please try refreshing the page.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    // If user already voted on this exact option, do nothing
    if (hasVoted && votedOptionIndex === optionIndex) {
      setError("You've already voted for this option");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsVoting(true);
    setError(null);

    // Immediately update UI state before API call
    setSelectedOption(poll.options[optionIndex]._id);
    setLocalHasVoted(true);
    setLocalVotedOptionIndex(optionIndex);

    try {
      // If user has already voted, we need to remove the old vote first, then vote again
      if (hasVoted) {
        console.log(
          "🔄 Changing vote from option",
          votedOptionIndex,
          "to option",
          optionIndex
        );

        // Step 1: Remove old vote and WAIT for it to complete
        try {
          const removeResponse = await bizpulseApi.removeVote(post._id);
          console.log("✅ Vote removed successfully:", removeResponse);

          // Step 2: Verify the vote was actually removed
          if (!removeResponse.success) {
            throw new Error("Failed to remove previous vote");
          }

          // Step 3: Update local state immediately
          setLocalHasVoted(false);
          setLocalVotedOptionIndex(null);

          // Step 4: Update the post state with the response from remove vote
          if (removeResponse.data?.wallFeed) {
            onVoteSuccess?.(removeResponse.data.wallFeed);
          }

          // Step 5: Add a delay to ensure backend state is fully updated
          await new Promise((resolve) => setTimeout(resolve, 300));
        } catch (removeErr: any) {
          console.error("❌ Failed to remove previous vote:", removeErr);
          throw new Error(
            "Cannot change vote: " +
              (removeErr.message || "Failed to remove previous vote")
          );
        }
      }

      // Now submit the new vote
      console.log("📮 Submitting new vote for option", optionIndex);
      const response = await bizpulseApi.voteOnPoll(post._id, optionIndex);
      console.log("✅ New vote submitted:", response);

      if (response.success && response.data.wallFeed) {
        // Update local state immediately
        setLocalHasVoted(true);
        setLocalVotedOptionIndex(optionIndex);

        onVoteSuccess?.(response.data.wallFeed);
      }
    } catch (err: any) {
      console.error("❌ Vote error:", err);
      // Reset all local state on error
      setLocalHasVoted(false);
      setLocalVotedOptionIndex(null);
      setSelectedOption(null);
      setError(err.message || "Failed to submit vote");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsVoting(false);
    }
  };

  // Handle vote removal
  const handleRemoveVote = async () => {
    if (!hasVoted || isVoting) return;

    setIsVoting(true);
    setError(null);

    try {
      console.log("🗑️ Removing vote from poll:", post._id);
      const response = await bizpulseApi.removeVote(post._id);
      console.log("✅ Vote removed successfully:", response);

      if (response.success && response.data.wallFeed) {
        if (response.success) {
          // Update local state immediately
          setLocalHasVoted(false);
          setLocalVotedOptionIndex(null);
          setSelectedOption(null);
          onVoteSuccess?.(response.data.wallFeed);
        } else {
          throw new Error(response.message || "Failed to remove vote");
        }
      }
    } catch (err: any) {
      console.error("❌ Remove vote error:", err);
      setError(err.message || "Failed to remove vote");
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
                disabled={isVoting}
                className={`w-full text-left transition-all ${
                  isVotedOption
                    ? "bg-blue-500 border-blue-600 ring-2 ring-blue-400 shadow-md"
                    : hasVoted
                    ? "bg-white border-gray-200 text-gray-700 opacity-75"
                    : "bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm"
                } ${
                  isSelected ? "bg-blue-50 border-blue-300 shadow-sm" : ""
                } border rounded-lg p-4 relative overflow-hidden cursor-pointer disabled:cursor-not-allowed`}
              >
                {/* Progress Bar Background - show for all options when hasVoted */}
                {hasVoted && (
                  <div
                    className={`absolute inset-0 transition-all duration-500 ${
                      isVotedOption ? "bg-blue-400/20" : "bg-gray-100"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                )}

                {/* Option Content */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        isVotedOption ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {option.text}
                    </p>
                    {hasVoted && (
                      <p
                        className={`text-sm mt-1 ${
                          isVotedOption ? "text-blue-100" : "text-gray-600"
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
                          isVotedOption ? "text-white" : "text-gray-700"
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
            <button
              onClick={handleRemoveVote}
              className="text-sm text-red-600 hover:text-red-700 font-medium hover:underline"
            >
              Remove my vote
            </button>
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
              <span>{post.likeCount || 0}</span>
            </button>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MessageSquare className="w-4 h-4" />
              <span>{post.commentCount || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
