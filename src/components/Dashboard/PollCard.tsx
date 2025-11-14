"use client";

import { useState } from "react";
import Link from "next/link";
import { WallFeedPost, PollOption } from "@/types/bizpulse.types";
import { bizpulseApi } from "@/services/bizpulseApi";
import { Calendar, ThumbsUp, X, Activity } from "lucide-react";
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

  const [localHasVoted, setLocalHasVoted] = useState<boolean | null>(null);
  const [localVotedOptionIndex, setLocalVotedOptionIndex] = useState<
    number | null
  >(null);

  const poll = post.poll;
  if (!poll) return null;

  const userVote = poll.voters.find((voter) => {
    const voterId =
      typeof voter.userId === "object" && voter.userId !== null
        ? (voter.userId as any)?._id
        : voter.userId;
    return String(voterId) === String(currentUserId);
  });

  const hasVoted = localHasVoted !== null ? localHasVoted : !!userVote;
  const votedOptionIndex =
    localVotedOptionIndex !== null
      ? localVotedOptionIndex
      : userVote?.optionIndex;

  const calculatePercentage = (votes: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  const handleVote = async (optionIndex: number) => {
    if (isVoting) return;

    if (!currentUserId) {
      setError("Unable to vote. Please log in first.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (hasVoted) {
      setError("You have already voted!");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsVoting(true);
    setError(null);

    setSelectedOption(poll.options[optionIndex]._id);
    setLocalHasVoted(true);
    setLocalVotedOptionIndex(optionIndex);

    try {
      const response = await bizpulseApi.voteOnPoll(post._id, optionIndex);

      if (response.success && response.data) {
        onVoteSuccess?.(response.data);
      } else {
        setLocalHasVoted(null);
        setLocalVotedOptionIndex(null);
        setSelectedOption(null);
        throw new Error(response.message || "Vote failed");
      }
    } catch (err: any) {
      setLocalHasVoted(null);
      setLocalVotedOptionIndex(null);
      setSelectedOption(null);
      setError(err.message || "Failed to submit vote. Please try again.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsVoting(false);
    }
  };

  const handleRemoveVote = async () => {
    if (!hasVoted || isVoting) return;

    setIsVoting(true);
    setError(null);

    try {
      const response = await bizpulseApi.removeVote(post._id);

      if (response.success && response.data) {
        setLocalHasVoted(null);
        setLocalVotedOptionIndex(null);
        setSelectedOption(null);
        onVoteSuccess?.(response.data);
      } else {
        throw new Error(response.message || "Failed to remove vote");
      }
    } catch (err: any) {
      setError(err.message || "Failed to remove vote");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsVoting(false);
    }
  };

  const getAuthorName = () => `${post.userId.fname} ${post.userId.lname}`;
  const getAuthorCompany = () => "BizCivitas Member";

  return (
    <div
      data-poll-id={post._id}
      className="bg-gray-50 rounded-lg shadow-sm border border-gray-300 overflow-hidden h-full flex flex-col hover:shadow-lg hover:border-blue-500 hover:-translate-y-1 transition-all duration-300">
      {/* Poll Header - Compact */}
      <div className="p-2 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <Link
            href="/feeds/biz-pulse?category=pulse-polls"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-2 cursor-pointer group">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 group-hover:bg-green-600 transition-colors">
                <Activity className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded-full border border-green-200 group-hover:bg-green-200 group-hover:scale-105 transition-all">
                Pulse Polls
              </span>
            </div>
          </Link>
          <span className="text-xs text-gray-500">
            {post.timeAgo || new Date(post.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Poll Question */}
      <div className="p-2 flex-1 overflow-y-auto">
        <h2 className="text-sm font-bold text-gray-900 mb-1.5">
          {poll.question}
        </h2>

        {post.images && post.images.length > 0 && (
          <div className="mb-1.5 rounded-lg overflow-hidden">
            <Image
              src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/image/${post.images[0]}`}
              alt="Poll image"
              width={800}
              height={400}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {error && (
          <div className="mb-1.5 p-1.5 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2">
            <X className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="space-y-1.5">
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
                className={`w-full text-left transition-all border rounded-lg p-2 relative overflow-hidden ${
                  isVotedOption
                    ? "bg-green-500 border-green-600 ring-2 ring-green-400 shadow-md"
                    : hasVoted
                    ? "bg-gray-100 border-gray-300 text-gray-500 opacity-60 cursor-not-allowed"
                    : "bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm"
                } ${isSelected ? "bg-blue-50 border-blue-300 shadow-sm" : ""}`}
              >
                {hasVoted && (
                  <div
                    className={`absolute inset-0 transition-all duration-500 ${
                      isVotedOption ? "bg-green-400/30" : "bg-gray-200"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                )}

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex-1">
                    <p
                      className={`text-xs font-medium ${
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
                        className={`text-xs mt-0.5 ${
                          isVotedOption ? "text-green-100" : "text-gray-500"
                        }`}
                      >
                        {option.votes} {option.votes === 1 ? "vote" : "votes"}
                      </p>
                    )}
                  </div>
                  {hasVoted && (
                    <div className="ml-2">
                      <span
                        className={`text-sm font-bold ${
                          isVotedOption ? "text-white" : "text-gray-500"
                        }`}
                      >
                        {percentage}%
                      </span>
                    </div>
                  )}
                </div>

                {isVoting && isSelected && (
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-gray-600">
            <span className="font-semibold">{poll.totalVotes}</span> total{" "}
            {poll.totalVotes === 1 ? "vote" : "votes"}
          </p>
          {hasVoted && !isVoting && (
            <a
              onClick={handleRemoveVote}
              className="text-xs text-red-600 hover:text-red-700 underline cursor-pointer transition-colors"
            >
              Remove vote
            </a>
          )}
        </div>
      </div>

      <div className="px-3 py-2 border-t border-gray-100 bg-gray-50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log("[PollCard] Like button clicked for post:", post._id);
                console.log("[PollCard] Current isLiked state:", post.isLiked);
                console.log("[PollCard] Current likeCount:", post.likeCount);
                console.log("[PollCard] onLike callback exists?", typeof onLike, onLike);
                if (onLike) {
                  console.log("[PollCard] Calling onLike callback...");
                  onLike(post._id);
                  console.log("[PollCard] onLike callback called");
                } else {
                  console.error("[PollCard] onLike callback is undefined!");
                }
              }}
              className={`flex items-center space-x-1 text-xs transition-colors ${
                post.isLiked
                  ? "text-blue-600 font-medium"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              <ThumbsUp
                className={`w-3 h-3 ${post.isLiked ? "fill-current" : ""}`}
              />
              {post.likeCount > 0 && <span>{post.likeCount}</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
