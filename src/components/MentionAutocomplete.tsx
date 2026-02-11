"use client";

import React, { useEffect, useRef } from "react";
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
      const selectedElement = dropdownRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [selectedIndex]);

  if (!users.length && !loading) return null;

  console.log("🎨 Rendering MentionAutocomplete with:", { users: users.length, position });

  return (
    <div
      ref={dropdownRef}
      className="fixed z-[9999] bg-red-100 border-4 border-red-500 rounded-lg shadow-2xl max-h-60 overflow-y-auto"
      style={{
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        minWidth: "250px",
        maxWidth: "350px",
      }}
    >
      <div className="bg-yellow-200 p-2 text-center font-bold">
        DROPDOWN IS HERE! {users.length} users found
      </div>
      {loading && (
        <div className="p-3 text-center text-sm text-gray-500">
          Searching users...
        </div>
      )}

      {!loading && users.length === 0 && (
        <div className="p-3 text-center text-sm text-gray-500">
          No users found
        </div>
      )}

      {!loading &&
        users.map((user, index) => {
          const fullName = `${user.fname} ${user.lname}`.trim();
          const displayName = user.username ? `@${user.username}` : fullName;

          return (
            <button
              key={user.id}
              onClick={() => onSelect(user)}
              className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 transition-colors ${
                index === selectedIndex ? "bg-blue-50" : ""
              }`}
            >
              <Avatar
                src={getAvatarUrl(user.avatar)}
                alt={fullName}
                size="xs"
                fallbackText={fullName}
                showMembershipBorder={false}
              />
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-gray-900">{fullName}</div>
                {user.username && (
                  <div className="text-xs text-gray-500">@{user.username}</div>
                )}
              </div>
            </button>
          );
        })}
    </div>
  );
}
