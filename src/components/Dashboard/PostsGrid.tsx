"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store";
import BizPulseCard from "@/components/Dashboard/BizPulseCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { memo } from "react";

const PostsGrid = memo(function PostsGrid() {
  const { filteredPosts, loading } = useSelector(
    (state: RootState) => state.posts
  );

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
      {filteredPosts.map((post, index) => (
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
      ))}
    </div>
  );
});

export default PostsGrid;
