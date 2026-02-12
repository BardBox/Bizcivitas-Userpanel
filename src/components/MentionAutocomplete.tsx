"use client";

import { useEffect, useRef } from "react";
import Avatar from "@/components/ui/Avatar";
import { getAvatarUrl } from "@/utils/Feeds/connections/userHelpers";

interface User {
  id: string;
  fname: string;
  lname: string;
  avatar: string | null;
  username: string | null;
}

interface MentionAutocompleteProps {
  users: User[];
  loading: boolean;
  onSelect: (user: User) => void;
  selectedIndex: number;
  onClose: () => void;
  position: {
    top: number;
    left: number;
  };
}

export default function MentionAutocomplete({
  users,
  loading,
  onSelect,
  selectedIndex,
  onClose,
  position,
}: MentionAutocompleteProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (dropdownRef.current && selectedIndex >= 0) {
      const items = dropdownRef.current.querySelectorAll("[data-mention-item]");
      const selectedElement = items[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [selectedIndex]);

  if (!users.length && !loading) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
      style={{
        top: position.top,
        left: position.left,
        minWidth: "240px",
        maxWidth: "320px",
      }}
    >
      {loading && (
        <div className="p-3 text-center text-sm text-gray-400">
          Searching...
        </div>
      )}

      {!loading && users.length === 0 && (
        <div className="p-3 text-center text-sm text-gray-400">
          No users found
        </div>
      )}

      {!loading &&
        users.map((user, index) => {
          const fullName = `${user.fname} ${user.lname}`.trim();

          return (
            <button
              key={user.id}
              data-mention-item
              onClick={() => onSelect(user)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors cursor-pointer ${
                index === selectedIndex
                  ? "bg-blue-50"
                  : "hover:bg-gray-50"
              }`}
            >
              <Avatar
                src={getAvatarUrl(user.avatar ?? undefined)}
                alt={fullName}
                size="xs"
                fallbackText={fullName}
                showMembershipBorder={false}
              />
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{fullName}</div>
                {user.username && (
                  <div className="text-xs text-gray-500 truncate">@{user.username}</div>
                )}
              </div>
            </button>
          );
        })}
    </div>
  );
}
