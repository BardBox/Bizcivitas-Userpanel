"use client";

import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../../store/store";
import BizPulseCard from "@/components/Dashboard/BizPulseCard";
import PollCard from "@/components/Dashboard/PollCard";
import { WallFeedPost } from "@/types/bizpulse.types";
import { BizPulseMockPost } from "../../../types/bizpulse.types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { memo, useState, useEffect } from "react";
import { updatePost } from "../../../store/postsSlice";
import { transformBizPulsePostsToMock } from "@/utils/bizpulseTransformers";

const PostsGrid = memo(function PostsGrid() {
  const dispatch = useDispatch();
  const { filteredPosts, loading } = useSelector(
    (state: RootState) => state.posts
  );
  const user = useSelector((state: RootState) => state.auth.user);
  const currentUserId = user?._id || user?.id || "";

  // Debug log user info
  useEffect(() => {
    console.log("User from Redux:", user);
    console.log("Current User ID:", currentUserId);
  }, [user, currentUserId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" text="Loading posts..." />
      </div>
    );
  }

  if (filteredPosts.length === 0) {
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
      {filteredPosts.map((post: BizPulseMockPost, index: number) => {
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
              onVoteSuccess={(updatedPost) => {
                // Transform the updated WallFeedPost back to BizPulseMockPost and update Redux
                const transformedPost = transformBizPulsePostsToMock([updatedPost])[0];
                dispatch(updatePost(transformedPost));
                console.log("Vote successful, Redux updated:", transformedPost);
              }}
              onLike={(postId) => {
                // Handle like - you can dispatch Redux action here if needed
                console.log("Like clicked:", postId);
              }}
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
            stats={post.stats}
            timeAgo={post.timeAgo}
            category={post.category}
            tags={post.tags}
            featured={index === 0} // Make first post featured
          />
        );
      })}
    </div>
  );
});

export default PostsGrid;
