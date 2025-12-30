"use client";

import { useState, useEffect, useRef } from "react";
import {
  Video,
  FileText,
  BookOpen,
  Loader2,
  Search,
  BookmarkCheck,
  Trash2,
  AlertCircle,
  Home,
  ChevronDown,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useGetSavedCollectionsQuery,
  useSaveCollectionMutation,
  type Collection,
} from "../../../../store/api/knowledgeHubApi";
import toast from "react-hot-toast";
import SavedResourcesButton from "@/components/KnowledgeHub/SavedResourcesButton";

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync activeTab with URL parameter changes
  useEffect(() => {
    const urlTab = searchParams.get("tab") as TabType;
    if (urlTab && SAVED_TABS.some(tab => tab.id === urlTab)) {
      setActiveTab(urlTab);
    }
  }, [searchParams]);

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
    <>
      {/* Knowledge Hub Floating Button */}
      <SavedResourcesButton mode="knowledgeHub" />

      <div className="space-y-4 bg-gray-50 mt-4 md:mt-8  md:space-y-6 px-3 md:px-0">
        {/* Header with Breadcrumb */}
      <div className="bg-white rounded-lg shadow p-4 md:p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 mb-2 md:mb-3">
          <Home className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">Saved Resources</span>
        </div>

        {/* Page Title */}
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
          Saved Resources
        </h1>
      </div>

      {/* Search Bar and Tab Navigation */}
      <div className="bg-white rounded-lg shadow overflow-visible">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-md px-4 py-4 lg:py-0 lg:pl-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search saved content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 text-sm md:text-base bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-sm"
              />
            </div>
          </div>

          <div className="border-b lg:border-b-0 border-gray-200">
          {/* Mobile/Tablet Dropdown Navigation (up to lg) */}
          <div className="lg:hidden p-4">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-left flex items-center justify-between shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="text-gray-900 font-medium flex items-center gap-2 text-sm md:text-base">
                  {activeTabInfo.label}
                  {isLoading && (
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
                <div className="absolute top-full left-4 right-4 mt-2 bg-white rounded-lg shadow-xl z-[100] overflow-hidden border border-gray-100">
                  {SAVED_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        handleTabChange(tab.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm md:text-base hover:bg-blue-50 active:bg-blue-100 transition-colors duration-150 ${
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
              className="flex space-x-8 px-6 overflow-x-auto justify-end"
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
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow p-4 md:p-6 mt-6">
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
    </>
  );
}
