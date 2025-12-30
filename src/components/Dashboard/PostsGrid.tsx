"use client";

import { memo } from "react";
import BizPulseCard from "@/components/Dashboard/BizPulseCard";
import PollCard from "@/components/Dashboard/PollCard";
import { WallFeedPost } from "@/types/bizpulse.types";
import { BizPulseMockPost } from "../../../types/bizpulse.types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface PostsGridProps {
  posts: BizPulseMockPost[];
  loading: boolean;
  currentUserId: string;
  onLike: (postId: string) => void;
}

const PostsGrid = memo(function PostsGrid({
  posts,
  loading,
  currentUserId,
  onLike,
}: PostsGridProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" text="Loading posts..." />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No posts found</div>
        <p className="text-gray-400">
          Try adjusting your search or category filter.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
      {posts.map((post: BizPulseMockPost, index: number) => {
        // Check if this is a poll post
        const isPoll =
          post.category === "pulse-polls" ||
          (post.poll && post.postType === "poll");

        if (isPoll && post.poll) {
          // Check if user has voted by looking at the poll voters
          // IMPORTANT: voter.userId can be either a string or an object with _id
          const userVote = post.poll.voters.find((voter) => {
            const voterId =
              typeof voter.userId === "string"
                ? voter.userId
                : (voter.userId as any)?._id || voter.userId;
            return voterId === currentUserId;
          });
          const hasVoted = !!userVote;
          const userVotedOptionIndex = userVote?.optionIndex;

          // Convert mock post to WallFeedPost format for PollCard
          const wallFeedPost: WallFeedPost = {
            _id: post.id,
            type: "poll",
            userId: {
              _id: currentUserId,
              fname: post.author.name.split(" ")[0] || "",
              lname: post.author.name.split(" ")[1] || "",
              avatar: post.author.avatar || undefined,
              username: "",
            },
            poll: post.poll,
            title: post.title,
            description: post.content,
            images: post.image ? [post.image] : undefined,
            badge: "Biz pulse",
            visibility: "public",
            likes: Array(post.stats.likes).fill({ userId: "" }),
            likeCount: post.stats.likes,
            isLiked: post.isLiked || false,
            comments: [],
            commentCount: post.stats.comments,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            timeAgo: post.timeAgo,
            hasVoted: hasVoted,
            userVotedOptionIndex: userVotedOptionIndex,
          };

          return (
            <PollCard
              key={post.id}
              post={wallFeedPost}
              currentUserId={currentUserId}
              onVoteSuccess={() => {
                // RTK Query invalidation will handle the update
              }}
              onLike={onLike}
            />
          );
        }

        // Regular post
        return (
          <BizPulseCard
            key={post.id}
            id={post.id}
            title={post.title}
            content={post.content}
            author={post.author}
            image={post.image}
            videos={post.videos}
            stats={post.stats}
            timeAgo={post.timeAgo}
            category={post.category}
            tags={post.tags}
            featured={index === 0} // Make first post featured
            onLike={onLike}
            isLiked={post.isLiked || false}
          />
        );
      })}
    </div>
  );
});

export default PostsGrid;
