"use client";

import { Bookmark, ChevronLeft, BookOpen } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetSavedCollectionsQuery } from "../../../store/api/knowledgeHubApi";

interface FloatingButtonProps {
  mode?: "savedResources" | "knowledgeHub";
}

export default function SavedResourcesButton({ mode = "savedResources" }: FloatingButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: savedCollections = [] } = useGetSavedCollectionsQuery();

  const savedCount = savedCollections.length;

  const handleClick = () => {
    const currentTab = searchParams.get("tab");

    if (mode === "savedResources") {
      // Get current tab from Knowledge Hub and map to Saved Resources tab
      const tabMapping: Record<string, string> = {
        "tutorials": "knowledge",      // Knowledge Sessions
        "recordings": "expert",         // Expert Learnings
        "membership": "membership",     // Members insights
        "resource": "resource",         // Resource centre
      };

      const savedResourcesTab = currentTab ? tabMapping[currentTab] || "expert" : "expert";
      router.push(`/feeds/saved-resources?tab=${savedResourcesTab}`);
    } else {
      // Navigate back to Knowledge Hub
      const tabMapping: Record<string, string> = {
        "knowledge": "tutorials",      // Knowledge Sessions → Tutorials
        "expert": "recordings",         // Expert Learnings → Recordings
        "membership": "membership",     // Members insights → Membership
        "resource": "resource",         // Resource centre → Resource
      };

      const knowledgeHubTab = currentTab ? tabMapping[currentTab] || "tutorials" : "tutorials";
      router.push(`/feeds/knowledge-hub?tab=${knowledgeHubTab}`);
    }
  };

  // Don't show the saved resources button if there are no saved resources
  if (mode === "savedResources" && savedCount === 0) return null;

  // Configuration based on mode
  const Icon = mode === "savedResources" ? Bookmark : BookOpen;
  const title = mode === "savedResources" ? "Saved Resources" : "Knowledge Hub";
  const subtitle = mode === "savedResources" ? `${savedCount} items` : "Go back to browse";
  const ariaLabel = mode === "savedResources" ? `Saved Resources (${savedCount})` : `Knowledge Hub (${savedCount})`;
  const showBadge = savedCount > 0;

  return (
    <>
      {/* Desktop & Tablet Version (md and above) */}
      <button
        onClick={handleClick}
        className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-[#3359ff] hover:bg-[#2447cc] text-white rounded-l-full shadow-2xl transition-all duration-300 hover:-translate-x-2 items-center gap-2 lg:gap-3 pl-3 lg:pl-5 pr-3 lg:pr-4 py-3 lg:py-4 group"
        aria-label={ariaLabel}
      >
        <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5 group-hover:-translate-x-1 transition-transform" />
        <div className="flex flex-col items-start gap-0.5">
          <span className="font-semibold text-xs lg:text-sm whitespace-nowrap">
            {title}
          </span>
          <span className="text-[10px] lg:text-xs text-blue-100">{subtitle}</span>
        </div>
        <div className="relative">
          <Icon className="w-5 h-5 lg:w-7 lg:h-7" fill="currentColor" />
          {showBadge && (
            <span className="absolute -top-1 -right-1 lg:-top-2 lg:-right-2 bg-[#ff9d00] text-white text-[10px] lg:text-xs font-bold rounded-full min-w-[18px] h-[18px] lg:min-w-[22px] lg:h-[22px] flex items-center justify-center animate-pulse px-1">
              {savedCount > 99 ? "99+" : savedCount}
            </span>
          )}
        </div>
      </button>

      {/* Mobile Version (below md) - Compact FAB */}
      <button
        onClick={handleClick}
        className="md:hidden fixed right-4 bottom-20 z-50 bg-[#3359ff] active:bg-[#2447cc] text-white rounded-full shadow-2xl transition-all duration-300 active:scale-95 p-3 group"
        aria-label={ariaLabel}
      >
        <div className="relative">
          <Icon className="w-6 h-6" fill="currentColor" />
          {showBadge && (
            <span className="absolute -top-2 -right-2 bg-[#ff9d00] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center animate-pulse px-1">
              {savedCount > 9 ? "9+" : savedCount}
            </span>
          )}
        </div>
      </button>
    </>
  );
}
