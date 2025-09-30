"use client";

import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { RootState } from "../../../store";
import { setActiveCategory } from "../../../store/postsSlice";

const tabs = [
  { id: "all", label: "All" },
  { id: "founders-desk", label: "Founder's Desk" },
  { id: "business-boosters", label: "Business Boosters" },
  { id: "pulse-polls", label: "Pulse Polls" },
  { id: "spotlight-stories", label: "Spotlight Stories" },
  { id: "light-pulse", label: "Light Pulse" },
  { id: "travel-stories", label: "Travel Stories" },
];

export default function TabNavigation() {
  const dispatch = useDispatch();
  const { activeCategory } = useSelector((state: RootState) => state.posts);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (tabId: string) => {
    dispatch(setActiveCategory(tabId));
    setIsDropdownOpen(false); // Close dropdown when selection is made
  };

  const activeTab = tabs.find((tab) => tab.id === activeCategory) || tabs[0];

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="border-b border-gray-200">
      {/* Mobile/Tablet Dropdown Navigation (up to lg) */}
      <div className="lg:hidden p-4">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-left flex items-center justify-between shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className="text-gray-900 font-medium">{activeTab.label}</span>
            <ChevronDown
              className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg ${
                    tab.id === activeCategory
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
        <nav className="flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`${
                activeCategory === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
