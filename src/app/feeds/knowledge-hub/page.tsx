"use client";

import { useState, useRef, useEffect } from "react";
import {
  Play,
  FileText,
  BookOpen,
  Video,
  Loader2,
  ChevronDown,
  Search,
  Download,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useGetCollectionsQuery,
  useGetPDFsQuery,
  type MediaItem,
  type Collection,
} from "../../../../store/api/knowledgeHubApi";

type TabType = "recordings" | "tutorials" | "pdfs";

const KNOWLEDGE_HUB_TABS = [
  { id: "recordings" as TabType, label: "Expert Learnings", icon: Video },
  {
    id: "tutorials" as TabType,
    label: "Knowledge Sessions",
    icon: BookOpen,
  },
  {
    id: "pdfs" as TabType,
    label: "Members insights",
    icon: FileText,
  },
  {
    id: "resource" as TabType,
    label: "Resource centre",
    icon: FileText,
  },
];

export default function KnowledgeHubPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("recordings");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch collections directly instead of media items
  const { data: expertCollections = [], isLoading: expertLoading } =
    useGetCollectionsQuery({ type: "expert" });
  const { data: knowledgeCollections = [], isLoading: knowledgeLoading } =
    useGetCollectionsQuery({ type: "knowledge" });
  const { data: pdfs = [], isLoading: pdfsLoading } = useGetPDFsQuery();

  // Handler for collection card click - navigate to detail page
  const handleCollectionClick = (collectionId: string) => {
    router.push(`/feeds/knowledge-hub/collection/${collectionId}`);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeTabInfo =
    KNOWLEDGE_HUB_TABS.find((tab) => tab.id === activeTab) ||
    KNOWLEDGE_HUB_TABS[0];

  const handleVideoClick = (
    media: MediaItem,
    type: "recordings" | "tutorials"
  ) => {
    const gradientColor = type === "recordings" ? "#8696C8" : "#6CCC86";
    const headerTitle = type === "recordings" ? "Recording" : "Tutorial";

    router.push(
      `/feeds/knowledge-hub/video/${media._id}?` +
        new URLSearchParams({
          videoUrl:
            media.embedLink ||
            `https://player.vimeo.com/video/${media.vimeoId}`,
          title: media.title,
          description: media.description || "",
          headerTitle,
          gradientColor,
        }).toString()
    );
  };

  const handlePdfClick = (media: MediaItem) => {
    router.push(
      `/feeds/knowledge-hub/pdf/${media._id}?` +
        new URLSearchParams({
          pdfUrl: media.url || "",
          title: media.title,
        }).toString()
    );
  };

  const handleDownload = (e: React.MouseEvent, media: MediaItem) => {
    e.stopPropagation();
    if (media.url) {
      window.open(media.url, "_blank");
    }
  };

  // Get current data and loading state based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case "recordings":
        return { data: expertCollections, isLoading: expertLoading };
      case "tutorials":
        return { data: knowledgeCollections, isLoading: knowledgeLoading };
      case "pdfs":
        return { data: pdfs, isLoading: pdfsLoading };
      default:
        return { data: [], isLoading: false };
    }
  };

  const { data: currentData, isLoading: currentLoading } = getCurrentData();

  // For collections (recordings and tutorials), currentData is already Collection[]
  // For PDFs, it's MediaItem[]
  const collections =
    activeTab === "recordings" || activeTab === "tutorials"
      ? (currentData as Collection[])
      : [];

  // Filter collections based on search query
  const filteredCollections = collections.filter(
    (collection) =>
      collection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter PDFs based on search query
  const filteredPDFs = (
    activeTab === "pdfs" ? (currentData as MediaItem[]) : []
  ).filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.fileName &&
        item.fileName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Helper functions for PDFs
  const getFileExtension = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toUpperCase();
    return ext || "DOC";
  };

  const getFileTypeColor = (fileName?: string) => {
    if (!fileName) return "bg-blue-100 text-blue-600";
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return "bg-red-100 text-red-600";
      case "doc":
      case "docx":
        return "bg-blue-100 text-blue-600";
      case "xls":
      case "xlsx":
        return "bg-green-100 text-green-600";
      case "ppt":
      case "pptx":
        return "bg-orange-100 text-orange-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Knowledge Hub
        </h1>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          {/* Mobile/Tablet Dropdown Navigation (up to lg) */}
          <div className="lg:hidden p-4">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-left flex items-center justify-between shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="text-gray-900 font-medium flex items-center gap-2">
                  {activeTabInfo.label}
                  {currentLoading && (
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  )}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {KNOWLEDGE_HUB_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg ${
                        tab.id === activeTab
                          ? "text-blue-600 bg-blue-50 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Horizontal Tabs (lg and above) */}
          <div className="hidden lg:block">
            <nav
              className="flex space-x-8 px-6 overflow-x-auto"
              aria-label="Tabs"
            >
              {KNOWLEDGE_HUB_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2`}
                >
                  {tab.label}
                  {activeTab === tab.id && currentLoading && (
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Content Area - Outside Tab Container */}
      <div>
        {currentLoading &&
        (activeTab === "pdfs"
          ? filteredPDFs.length === 0
          : filteredCollections.length === 0) ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading content...</p>
            </div>
          </div>
        ) : (
            activeTab === "pdfs"
              ? filteredPDFs.length === 0
              : filteredCollections.length === 0
          ) ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <activeTabInfo.icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? "No results found" : "No content available"}
              </h3>
              <p className="text-gray-600">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Check back later for new content"}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Collection Cards View (Recordings & Tutorials) */}
            {(activeTab === "recordings" || activeTab === "tutorials") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCollections.map((collection) => (
                  <div
                    key={collection._id}
                    onClick={() => handleCollectionClick(collection._id)}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                      <div className="space-y-4">
                        {/* Collection Thumbnail */}
                        <div
                          className={`relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br ${
                            activeTab === "recordings"
                              ? "from-purple-500 to-indigo-600"
                              : "from-green-500 to-emerald-600"
                          }`}
                        >
                          {collection.thumbnailUrl ? (
                            <img
                              src={collection.thumbnailUrl}
                              alt={collection.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full">
                              <Video className="w-16 h-16 text-white/70" />
                            </div>
                          )}
                        </div>

                        {/* Collection Stats */}
                        <div className="space-y-3">
                          <h3 className="font-bold text-gray-900">
                            {collection.title}
                          </h3>

                          {collection.expertType && (
                            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                              {collection.expertType}
                            </span>
                          )}

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Video className="w-4 h-4" />
                            <span>
                              {collection.subItems?.length || 0}{" "}
                              {collection.subItems?.length === 1
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
                ))}
              </div>
            )}

            {/* PDFs Grid */}
            {activeTab === "pdfs" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPDFs.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => handlePdfClick(item)}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="flex flex-col items-center text-center">
                      {/* File Icon */}
                      <div
                        className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 ${getFileTypeColor(
                          item.fileName
                        )}`}
                      >
                        <FileText className="w-10 h-10" />
                      </div>

                      {/* File Type Badge */}
                      {item.fileName && (
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded mb-3 ${getFileTypeColor(
                            item.fileName
                          )}`}
                        >
                          {getFileExtension(item.fileName)}
                        </span>
                      )}

                      {/* Title */}
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                        {item.title}
                      </h3>

                      {/* File Name */}
                      {item.fileName && (
                        <p className="text-xs text-gray-500 mb-1">
                          {item.fileName}
                        </p>
                      )}

                      {/* File Size */}
                      {item.sizeInBytes && (
                        <p className="text-xs text-gray-400 mb-3">
                          {formatFileSize(item.sizeInBytes)}
                        </p>
                      )}

                      {/* Download Button */}
                      <button
                        onClick={(e) => handleDownload(e, item)}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Description */}
      <div className="text-center text-sm text-gray-500">
        Access educational content, business templates, and expert resources
        curated by BizCivitas.
      </div>
    </div>
  );
}
