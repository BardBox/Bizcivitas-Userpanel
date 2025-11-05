"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Suspense } from "react";

function VideoPlayerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const videoUrl = searchParams.get("videoUrl") || "";
  const title = searchParams.get("title") || "Video";
  const description = searchParams.get("description") || "";
  const headerTitle = searchParams.get("headerTitle") || "Video";
  const gradientColor = searchParams.get("gradientColor") || "#8696C8";

  if (!videoUrl) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Video not found</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with gradient */}
      <div
        className="py-4 px-4 sm:px-6 lg:px-8"
        style={{
          background: `linear-gradient(135deg, ${gradientColor} 0%, ${gradientColor}dd 100%)`,
        }}
      >
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white hover:text-white/90 transition-colors mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Knowledge Hub</span>
          </button>
          <h1 className="text-2xl font-bold text-white">{headerTitle}</h1>
        </div>
      </div>

      {/* Video Player Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Vimeo Player */}
          <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
            <iframe
              src={videoUrl}
              className="absolute top-0 left-0 w-full h-full"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={title}
            />
          </div>

          {/* Video Info */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>
            {description && (
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Additional Info or Related Videos Section (Future Enhancement) */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/feeds/knowledge-hub")}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Browse more content
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VideoPlayerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      }
    >
      <VideoPlayerContent />
    </Suspense>
  );
}
