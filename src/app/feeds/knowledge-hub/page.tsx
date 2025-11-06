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
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useGetCollectionsQuery,
  useSaveCollectionMutation,
  type Collection,
} from "../../../../store/api/knowledgeHubApi";
import { useGetCurrentUserQuery } from "../../../../store/api/userApi";
import toast from "react-hot-toast";

type TabType = "recordings" | "tutorials" | "membership" | "resource";

const KNOWLEDGE_HUB_TABS = [
  { id: "recordings" as TabType, label: "Expert Learnings", icon: Video },
  {
    id: "tutorials" as TabType,
    label: "Knowledge Sessions",
    icon: BookOpen,
  },
  {
    id: "membership" as TabType,
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

  // Get current user
  const { data: currentUser } = useGetCurrentUserQuery();
  const currentUserId = currentUser?._id || currentUser?.id;

  // Fetch collections directly instead of media items
  const { data: expertCollections = [], isLoading: expertLoading } =
    useGetCollectionsQuery({ type: "expert" });
  const { data: knowledgeCollections = [], isLoading: knowledgeLoading } =
    useGetCollectionsQuery({ type: "knowledge" });
  const { data: membershipCollections = [], isLoading: membershipLoading } =
    useGetCollectionsQuery({ type: "membership" });
  const { data: resourceCollections = [], isLoading: resourceLoading } =
    useGetCollectionsQuery({ type: "resource" });

  // Save collection mutation
  const [saveCollection] = useSaveCollectionMutation();

  // Handler for collection card click - navigate to detail page
  const handleCollectionClick = (collectionId: string) => {
    router.push(`/feeds/knowledge-hub/collection/${collectionId}`);
  };

  // Check if collection is saved by current user
  const isCollectionSaved = (collection: Collection) => {
    if (!currentUserId || !collection.savedBy) return false;
    return collection.savedBy.some((save) => save.userId === currentUserId);
  };

  // Handler for save/unsave collection
  const handleSaveCollection = async (
    e: React.MouseEvent,
    collectionId: string,
    collectionTitle: string
  ) => {
    e.stopPropagation(); // Prevent card click

    if (!currentUserId) {
      toast.error("Please log in to save collections");
      return;
    }

    // Check if currently saved
    const collection = [...expertCollections, ...knowledgeCollections, ...membershipCollections, ...resourceCollections]
      .find(c => c._id === collectionId);
    const wasSaved = isCollectionSaved(collection!);

    try {
      await saveCollection({ collectionId }).unwrap();

      // Show success toast
      toast.success(
        wasSaved
          ? `Removed from saved resources`
          : `Saved to resources`,
        {
          duration: 2000,
          icon: wasSaved ? '🗑️' : '✅',
        }
      );
    } catch (error: any) {
      console.error("Failed to save collection:", error);

      // Show error toast
      toast.error("Failed to update. Please try again.", {
        duration: 3000,
      });
    }
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

  // Get current data and loading state based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case "recordings":
        return { data: expertCollections, isLoading: expertLoading };
      case "tutorials":
        return { data: knowledgeCollections, isLoading: knowledgeLoading };
      case "membership":
        return { data: membershipCollections, isLoading: membershipLoading };
      case "resource":
        return { data: resourceCollections, isLoading: resourceLoading };
      default:
        return { data: [], isLoading: false };
    }
  };

  const { data: currentData, isLoading: currentLoading } = getCurrentData();

  // All tabs now use collections
  const collections = currentData as Collection[];

  // Filter collections based on search query
  const filteredCollections = collections.filter(
    (collection) =>
      collection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        {currentLoading && filteredCollections.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading content...</p>
            </div>
          </div>
        ) : filteredCollections.length === 0 ? (
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
            {/* Collection Cards View - All Tabs */}
            {(activeTab === "recordings" ||
              activeTab === "tutorials" ||
              activeTab === "membership" ||
              activeTab === "resource") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCollections.map((collection) => (
                  <div
                    key={collection._id}
                    onClick={() => handleCollectionClick(collection._id)}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer group"
                  >
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
                            <Video className="w-16 h-16 text-white/70" />
                          </div>
                        )}

                        {/* Save Button */}
                        <button
                          onClick={(e) =>
                            handleSaveCollection(e, collection._id, collection.title)
                          }
                          className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-all hover:scale-110"
                          title={isCollectionSaved(collection) ? "Remove from saved" : "Save for later"}
                        >
                          {isCollectionSaved(collection) ? (
                            <BookmarkCheck className="w-5 h-5 text-blue-600 fill-current" />
                          ) : (
                            <Bookmark className="w-5 h-5 text-gray-600" />
                          )}
                        </button>
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
                          {activeTab === "membership" ||
                          activeTab === "resource" ? (
                            <>
                              <FileText className="w-4 h-4" />
                              <span>
                                {collection.subItems?.length || 0}{" "}
                                {collection.subItems?.length === 1
                                  ? "document"
                                  : "documents"}
                              </span>
                            </>
                          ) : (
                            <>
                              <Video className="w-4 h-4" />
                              <span>
                                {collection.subItems?.length || 0}{" "}
                                {collection.subItems?.length === 1
                                  ? "video"
                                  : "videos"}
                              </span>
                            </>
                          )}
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
