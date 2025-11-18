"use client";

import { Bookmark, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetSavedCollectionsQuery } from "../../../store/api/knowledgeHubApi";

export default function SavedResourcesButton() {
  const router = useRouter();
  const { data: savedCollections = [] } = useGetSavedCollectionsQuery();

  const savedCount = savedCollections.length;

  const handleClick = () => {
    router.push("/feeds/saved-resources");
  };

  // Don't show the button if there are no saved resources
  if (savedCount === 0) return null;

  return (
    <>
      {/* Desktop & Tablet Version (md and above) */}
      <button
        onClick={handleClick}
        className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-[#3359ff] hover:bg-[#2447cc] text-white rounded-l-full shadow-2xl transition-all duration-300 hover:-translate-x-2 items-center gap-2 lg:gap-3 pl-3 lg:pl-5 pr-3 lg:pr-4 py-3 lg:py-4 group"
        aria-label={`Saved Resources (${savedCount})`}
      >
        <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5 group-hover:-translate-x-1 transition-transform" />
        <div className="flex flex-col items-start gap-0.5">
          <span className="font-semibold text-xs lg:text-sm whitespace-nowrap">
            Saved Resources
          </span>
          <span className="text-[10px] lg:text-xs text-blue-100">{savedCount} items</span>
        </div>
        <div className="relative">
          <Bookmark className="w-5 h-5 lg:w-7 lg:h-7" fill="currentColor" />
          {savedCount > 0 && (
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
        aria-label={`Saved Resources (${savedCount})`}
      >
        <div className="relative">
          <Bookmark className="w-6 h-6" fill="currentColor" />
          {savedCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-[#ff9d00] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center animate-pulse px-1">
              {savedCount > 9 ? "9+" : savedCount}
            </span>
          )}
        </div>
      </button>
    </>
  );
}
