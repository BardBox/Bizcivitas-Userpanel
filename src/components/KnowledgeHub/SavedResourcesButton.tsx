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
    <button
      onClick={handleClick}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-[#3359ff] hover:bg-[#2447cc] text-white rounded-l-full shadow-2xl transition-all duration-300 hover:-translate-x-2 flex items-center gap-3 pl-5 pr-4 py-4 group"
      aria-label={`Saved Resources (${savedCount})`}
    >
      <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
      <div className="flex flex-col items-start gap-0.5">
        <span className="font-semibold text-sm whitespace-nowrap">
          Saved Resources
        </span>
        <span className="text-xs text-blue-100">{savedCount} items</span>
      </div>
      <div className="relative">
        <Bookmark className="w-7 h-7" fill="currentColor" />
        {savedCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-[#ff9d00] text-white text-xs font-bold rounded-full min-w-[22px] h-[22px] flex items-center justify-center animate-pulse px-1">
            {savedCount > 99 ? "99+" : savedCount}
          </span>
        )}
      </div>
    </button>
  );
}
