"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Play, Video, CheckCircle, FileText, Home } from "lucide-react";
import {
  useGetCollectionByIdQuery,
  type Collection,
  type MediaItem,
} from "../../../../../../store/api/knowledgeHubApi";

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const collectionId = params.id as string;

  // Get return context from URL parameters
  const returnTab = searchParams.get("returnTab");
  const source = searchParams.get("source"); // 'saved' or undefined (knowledge-hub)

  const [activeTab, setActiveTab] = useState<"contents" | "description">(
    "contents"
  );
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  // Fetch collection with all items (videos or documents)
  const { data: collection, isLoading } =
    useGetCollectionByIdQuery(collectionId);

  const items = collection?.subItems || [];
  const currentItem = items[currentItemIndex];

  // Check if collection contains documents or videos
  const isDocumentCollection = collection?.type === "resource";
  const isVideoCollection =
    collection?.type === "expert" ||
    collection?.type === "knowledge" ||
    collection?.type === "membership";

  // Determine colors based on collection type
  const isExpert = collection?.type === "expert";
  const gradientClass = isExpert
    ? "from-purple-500 to-indigo-600"
    : "from-green-500 to-emerald-600";
  const textColorClass = isExpert ? "text-purple-600" : "text-green-600";
  const bgColorClass = isExpert ? "bg-purple-50" : "bg-green-50";
  const borderColorClass = isExpert ? "border-purple-500" : "border-green-500";

  const handleItemSelect = (index: number) => {
    setCurrentItemIndex(index);
    // Scroll to top to show content viewer
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle back navigation with proper context
  const handleBack = () => {
    if (source === "saved") {
      // Return to saved resources page
      router.push(`/feeds/saved-resources`);
    } else if (returnTab) {
      // Return to knowledge hub with the tab context
      router.push(`/feeds/knowledge-hub?tab=${returnTab}`);
    } else {
      // Fallback to browser back
      router.back();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (!collection || items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Collection not found
          </h3>
          <button
            onClick={handleBack}
            className="text-blue-600 hover:text-blue-700"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-4 md:pt-6">
      {/* Header with Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-3">
            <Home className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="text-gray-400">/</span>
            <button
              onClick={handleBack}
              className="hover:text-blue-600 transition-colors truncate"
            >
              {source === "saved" ? "Saved Resources" : "Knowledge Hub"}
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium truncate">
              {returnTab === "recordings" || returnTab === "expert"
                ? "Expert Learnings"
                : returnTab === "tutorials" || returnTab === "knowledge"
                ? "Knowledge Sessions"
                : returnTab === "membership"
                ? "Members insights"
                : returnTab === "resource"
                ? "Resource centre"
                : "Collection"}
            </span>
          </div>

          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-base md:text-lg font-semibold text-gray-900 line-clamp-2">
                {collection.title}
              </h1>
              {collection.expertType && (
                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                  {collection.expertType}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Video Player or Document Viewer */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player / Document Viewer */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
              {isVideoCollection ? (
                <>
                  {/* Video Player */}
                  <div
                    className={`relative aspect-video bg-gradient-to-br ${gradientClass}`}
                  >
                    {currentItem?.embedLink || currentItem?.vimeoId ? (
                      <iframe
                        src={
                          currentItem.embedLink ||
                          `https://player.vimeo.com/video/${currentItem.vimeoId}`
                        }
                        className="absolute inset-0 w-full h-full"
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <Video className="w-20 h-20 text-white/70" />
                      </div>
                    )}
                  </div>

                  {/* Video Info */}
                  <div className="p-4 md:p-6">
                    <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {currentItem?.title || "Video Title"}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>By: {collection.author || "BizCivitas"}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Document Viewer */}
                  <div className="relative" style={{ height: "600px" }}>
                    {currentItem?.url ? (
                      <iframe
                        src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                          currentItem.url
                        )}&embedded=true`}
                        className="w-full h-full"
                        frameBorder="0"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-gray-50">
                        <div className="text-center">
                          <FileText className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">
                            Document not available
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Document Info */}
                  <div className="p-4 md:p-6">
                    <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {currentItem?.title ||
                        currentItem?.fileName ||
                        "Document"}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>By: {collection.author || "BizCivitas"}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab("contents")}
                    className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                      activeTab === "contents"
                        ? `${textColorClass} border-b-2 ${borderColorClass}`
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Contents
                  </button>
                  <button
                    onClick={() => setActiveTab("description")}
                    className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                      activeTab === "description"
                        ? `${textColorClass} border-b-2 ${borderColorClass}`
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Description
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-2 md:p-6">
                {activeTab === "contents" ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-base text-gray-900">
                        {isDocumentCollection
                          ? `All Documents (${items.length})`
                          : `All Videos (${items.length})`}
                      </h3>
                    </div>
                    {items.map((item: MediaItem, index: number) => (
                      <div
                        key={item._id}
                        onClick={() => handleItemSelect(index)}
                        className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                          index === currentItemIndex
                            ? `${bgColorClass} border-2 ${borderColorClass}`
                            : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                        }`}
                      >
                        <div className="relative flex-shrink-0 w-20 h-16 sm:w-32 sm:h-20 rounded-lg overflow-hidden">
                          {item.thumbnailUrl ? (
                            <img
                              src={item.thumbnailUrl}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div
                              className={`w-full h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center`}
                            >
                              {isDocumentCollection ? (
                                <FileText className="w-8 h-8 text-white/70" />
                              ) : (
                                <Play className="w-8 h-8 text-white/70" />
                              )}
                            </div>
                          )}
                          {index === currentItemIndex && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <div className="bg-white rounded-full p-2">
                                {isDocumentCollection ? (
                                  <FileText
                                    className={`w-5 h-5 ${textColorClass}`}
                                  />
                                ) : (
                                  <Play
                                    className={`w-5 h-5 ${textColorClass}`}
                                  />
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Item Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2">
                            <h4
                              className={`font-semibold line-clamp-2 text-sm sm:text-base ${
                                index === currentItemIndex
                                  ? "text-gray-900"
                                  : "text-gray-800"
                              }`}
                            >
                              {item.title || item.fileName}
                            </h4>
                            {index === currentItemIndex && (
                              <CheckCircle
                                className={`w-5 h-5 flex-shrink-0 ${textColorClass}`}
                              />
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      About this Collection
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {collection.description ||
                        "This collection contains curated educational content designed to help you grow your business and professional skills."}
                    </p>
                    {collection.author && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Created by:</span>{" "}
                          {collection.author}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Collection Info (Desktop) */}
          <div className="hidden lg:block space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <div className="space-y-4">
                {/* Collection Thumbnail */}
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                  {collection.thumbnailUrl ? (
                    <img
                      src={collection.thumbnailUrl}
                      alt={collection.title}
                      className="w-full h-full object-fill"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      {isDocumentCollection ? (
                        <FileText className="w-16 h-16 text-white/70" />
                      ) : (
                        <Video className="w-16 h-16 text-white/70" />
                      )}
                    </div>
                  )}
                </div>

                {/* Collection Stats */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-base text-gray-900 line-clamp-2">
                    {collection.title}
                  </h3>

                  {collection.expertType && (
                    <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                      {collection.expertType}
                    </span>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {isDocumentCollection ? (
                      <FileText className="w-4 h-4" />
                    ) : (
                      <Video className="w-4 h-4" />
                    )}
                    <span>
                      {items.length}{" "}
                      {isDocumentCollection
                        ? items.length === 1
                          ? "document"
                          : "documents"
                        : items.length === 1
                        ? "video"
                        : "videos"}
                    </span>
                  </div>

                  {collection.author && (
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold">By:</span>{" "}
                      {collection.author}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
