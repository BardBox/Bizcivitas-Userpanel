"use client";

import { useState, useEffect } from "react";
import {
  Video,
  FileText,
  BookOpen,
  Loader2,
  Search,
  BookmarkCheck,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useGetSavedCollectionsQuery,
  useSaveCollectionMutation,
  type Collection,
} from "../../../../store/api/knowledgeHubApi";
import toast from "react-hot-toast";

type TabType = "expert" | "knowledge" | "membership" | "resource";

const SAVED_TABS = [
 
  { id: "knowledge" as TabType, label: "Knowledge Sessions", icon: BookOpen },
  { id: "membership" as TabType, label: "Members insights", icon: FileText },
  { id: "resource" as TabType, label: "Resource centre", icon: FileText },
 { id: "expert" as TabType, label: "Expert Learnings", icon: Video },
];

export default function SavedResourcesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get tab from URL query parameter, default to "expert"
  const tabFromUrl = (searchParams.get("tab") as TabType) || "expert";
  const [activeTab, setActiveTab] = useState<TabType>(tabFromUrl);
  const [searchQuery, setSearchQuery] = useState("");

  // Sync activeTab with URL parameter changes
  useEffect(() => {
    const urlTab = searchParams.get("tab") as TabType;
    if (urlTab && SAVED_TABS.some(tab => tab.id === urlTab)) {
      setActiveTab(urlTab);
    }
  }, [searchParams]);

  // Fetch saved collections
  const { data: savedCollections = [], isLoading } =
    useGetSavedCollectionsQuery();

  // Save collection mutation
  const [saveCollection] = useSaveCollectionMutation();

  // Handler for tab change - update URL
  const handleTabChange = (newTab: TabType) => {
    setActiveTab(newTab);
    router.push(`/feeds/saved-resources?tab=${newTab}`, { scroll: false });
  };

  // Handler for collection card click - navigate to detail page with tab context
  const handleCollectionClick = (collectionId: string) => {
    router.push(`/feeds/knowledge-hub/collection/${collectionId}?returnTab=${activeTab}&source=saved`);
  };

  // Handler for unsave collection
  const handleUnsaveCollection = async (
    e: React.MouseEvent,
    collectionId: string,
    collectionTitle: string
  ) => {
    e.stopPropagation(); // Prevent card click

    try {
      await saveCollection({ collectionId }).unwrap();

      // Show success toast
      toast.success(`Removed "${collectionTitle}" from saved resources`, {
        duration: 2000,
        icon: <Trash2 className="w-5 h-5" />,
      });
    } catch (error: any) {
      console.error("Failed to unsave collection:", error);

      // Show error toast
      toast.error("Failed to remove. Please try again.", {
        duration: 3000,
        icon: <AlertCircle className="w-5 h-5" />,
      });
    }
  };

  // Filter collections by active tab type
  const filteredByTab = savedCollections.filter(
    (collection) => collection.type === activeTab
  );

  // Filter by search query
  const filteredCollections = filteredByTab.filter(
    (collection) =>
      collection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeTabInfo =
    SAVED_TABS.find((tab) => tab.id === activeTab) || SAVED_TABS[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Saved Resources
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
            placeholder="Search saved content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          {/* Desktop Tabs */}
          <div className="hidden lg:block">
            <nav
              className="flex space-x-8 px-6 overflow-x-auto"
              aria-label="Tabs"
            >
              {SAVED_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2`}
                >
                  {tab.label}
                  {activeTab === tab.id && isLoading && (
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Mobile Dropdown */}
          <div className="lg:hidden px-4 py-3">
            <div className="relative">
              <select
                value={activeTab}
                onChange={(e) => handleTabChange(e.target.value as TabType)}
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {SAVED_TABS.map((tab) => (
                  <option key={tab.id} value={tab.id}>
                    {tab.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading saved content...</p>
            </div>
          </div>
        ) : filteredCollections.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <activeTabInfo.icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? "No results found" : "No saved content"}
              </h3>
              <p className="text-gray-600">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Save collections from Knowledge Hub to see them here"}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCollections.map((collection) => (
              <div
                key={collection._id}
                onClick={() => handleCollectionClick(collection._id)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer group flex flex-col h-full"
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
                        {activeTab === "membership" ||
                        activeTab === "resource" ? (
                          <FileText className="w-16 h-16 text-gray-400" />
                        ) : (
                          <Video className="w-16 h-16 text-gray-400" />
                        )}
                      </div>
                    )}

                    {/* Unsave Button */}
                    <button
                      onClick={(e) =>
                        handleUnsaveCollection(
                          e,
                          collection._id,
                          collection.title
                        )
                      }
                      className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-all hover:scale-110"
                      title="Remove from saved"
                    >
                      <BookmarkCheck className="w-5 h-5 text-blue-600 fill-current" />
                    </button>
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
      </div>

      {/* Description */}
      <div className="text-center text-sm text-gray-500">
        Your saved educational content, business templates, and expert
        resources.
      </div>
    </div>
  );
}
