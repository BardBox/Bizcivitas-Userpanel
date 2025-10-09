"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import InfiniteScroll from "react-infinite-scroll-component";

const FloatingDrawer = dynamic(
  () => import("@/components/Dashboard/FloatingDrawer"),
  { ssr: false }
);
const PostCard = dynamic(() => import("@/components/Dashboard/PostCard"));
const WebinarSection = dynamic(
  () => import("@/components/Dashboard/WebinarSection")
);

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
  const [posts, setPosts] = useState(() =>
    Array.from({ length: 5 }, (_, i) => generatePost(i + 1))
  );
  const [hasMore, setHasMore] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      router.replace("/login");
      return;
    }
    setIsLoading(false);
  }, [router]);
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

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dashboard-primary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading feeds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen ">
      {/* Hide scrollbar globally */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          ::-webkit-scrollbar {
            display: none;
          }
          html,
          body {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `,
        }}
      />

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
              <div className="text-center py-8 text-gray-600 text-sm flex justify-center items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2" />
                Loading more posts...
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
