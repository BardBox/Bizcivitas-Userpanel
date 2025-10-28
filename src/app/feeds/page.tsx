"use client";

import { useState, useCallback, useEffect, memo } from "react";
import { useRouter } from "next/navigation";
import InfiniteScroll from "react-infinite-scroll-component";
import PostCard from "@/components/Dashboard/PostCard";
import WebinarSection from "@/components/Dashboard/WebinarSection";
import FloatingDrawer from "@/components/Dashboard/FloatingDrawer";

// --- Utilities ---
const authors = [
  { name: "Sarah Johnson", title: "Marketing Director" },
  { name: "Michael Chen", title: "Tech Entrepreneur" },
  { name: "Emily Davis", title: "Business Consultant" },
  { name: "David Wilson", title: "Investment Analyst" },
  { name: "Lisa Rodriguez", title: "Startup Founder" },
];

const postImages = [
  "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop&crop=entropy&auto=format&q=75",
  "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop&crop=entropy&auto=format&q=75",
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=400&fit=crop&crop=entropy&auto=format&q=75",
  "https://images.unsplash.com/photo-1553484771-371a605b060b?w=800&h=400&fit=crop&crop=entropy&auto=format&q=75",
];

const timeOptions = [
  "1 hour ago",
  "2 hours ago",
  "3 hours ago",
  "5 hours ago",
  "8 hours ago",
];

function generatePost(id: number) {
  return {
    id,
    title: `Business Post ${id} - Egestas libero nulla facilisi ut ac diam rhoncus feugiat`,
    content: `Post ${id}: Neque porro quisquam est qui dolorem ipsum quia dolor sit amet consectetur adipisci velit...`,
    author: authors[id % authors.length],
    image: id <= postImages.length ? postImages[id - 1] : undefined,
    stats: {
      likes: [25, 42, 38, 67, 23, 91, 15, 56, 73, 34][id % 10],
      comments: [3, 8, 5, 12, 7, 19, 2, 11, 16, 4][id % 10],
      shares: [1, 5, 3, 9, 4, 14, 2, 7, 11, 6][id % 10],
    },
    timeAgo: timeOptions[id % timeOptions.length],
  };
}

// --- Component ---
export default function DashboardPage() {
  console.log("Backend URL:", process.env.NEXT_PUBLIC_BACKEND_URL);

  const [posts, setPosts] = useState(() =>
    Array.from({ length: 5 }, (_, i) => generatePost(i + 1))
  );
  const [hasMore, setHasMore] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const updateDrawer = () => setIsDrawerOpen(window.innerWidth >= 768);
    updateDrawer();
    window.addEventListener("resize", updateDrawer);
    return () => window.removeEventListener("resize", updateDrawer);
  }, []);

  const fetchMorePosts = useCallback(() => {
    setTimeout(() => {
      const newPosts = Array.from({ length: 3 }, (_, i) =>
        generatePost(posts.length + i + 1)
      );
      setPosts((prev) => [...prev, ...newPosts]);
      if (posts.length >= 50) setHasMore(false);
    }, 1000);
  }, [posts.length]);

  return (
    <div className="relative min-h-screen ">
      {/* Main content */}
      <div
        className={`transition-all duration-300 no-scrollbar ${
          isDrawerOpen ? "xl:mr-80 lg:mr-20" : "mr-0"
        }`}
        style={{ height: "100vh", overflow: "auto" }}
      >
        <div className="md:max-w-[95%] lg:max-w-[70%] mx-auto md:p-6 space-y-6">
          <InfiniteScroll
            dataLength={posts.length}
            next={fetchMorePosts}
            hasMore={hasMore}
            loader={
              <div className="text-center py-8 flex justify-center items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
              </div>
            }
            endMessage={
              <div className="text-center py-8 text-gray-500 text-sm">
                🎉 You&apos;ve reached the end! No more posts.
              </div>
            }
            style={{ overflow: "visible" }}
          >
            {posts.map((post, index) => (
              <div key={post.id}>
                <PostCard {...post} />
                {index === 2 && <WebinarSection />}
              </div>
            ))}
          </InfiniteScroll>
        </div>
      </div>

      {/* Right Floating Drawer */}
      <FloatingDrawer onToggle={setIsDrawerOpen} />
    </div>
  );
}
