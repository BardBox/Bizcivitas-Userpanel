"use client";

import React, { useRef } from "react";

interface FormattingToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onInsert: (text: string) => void;
}

export default function FormattingToolbar({ textareaRef, onInsert }: FormattingToolbarProps) {
  const insertFormatting = (before: string, after: string = "", placeholder: string = "text") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const textToInsert = selectedText || placeholder;

    const newText = `${before}${textToInsert}${after}`;

    // Insert at cursor position
    const before_text = textarea.value.substring(0, start);
    const after_text = textarea.value.substring(end);

    onInsert(before_text + newText + after_text);

    // Set cursor position after insertion
    setTimeout(() => {
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertList = (type: "bullet" | "number") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    let listText = "";
    if (selectedText) {
      const lines = selectedText.split("\n");
      listText = lines.map((line, i) => {
        if (type === "bullet") return `• ${line}`;
        return `${i + 1}. ${line}`;
      }).join("\n");
    } else {
      if (type === "bullet") {
        listText = "• Item 1\n• Item 2\n• Item 3";
      } else {
        listText = "1. Item 1\n2. Item 2\n3. Item 3";
      }
    }

    const before_text = textarea.value.substring(0, start);
    const after_text = textarea.value.substring(end);

    onInsert(before_text + listText + after_text);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + listText.length, start + listText.length);
    }, 0);
  };

  const formatButtons = [
    {
      icon: "B",
      label: "Bold",
      action: () => insertFormatting("**", "**", "bold text"),
      className: "font-bold",
    },
    {
      icon: "I",
      label: "Italic",
      action: () => insertFormatting("_", "_", "italic text"),
      className: "italic",
    },
    {
      icon: "—",
      label: "Strikethrough",
      action: () => insertFormatting("~~", "~~", "strikethrough text"),
      className: "line-through",
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
        </svg>
      ),
      label: "Bullet List",
      action: () => insertList("bullet"),
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
          <text x="3" y="7" fontSize="8" fontWeight="bold" fill="white">1</text>
        </svg>
      ),
      label: "Numbered List",
      action: () => insertList("number"),
    },
    {
      icon: "#",
      label: "Heading",
      action: () => insertFormatting("### ", "", "Heading"),
      className: "font-bold text-lg",
    },
    {
      icon: "\"",
      label: "Quote",
      action: () => insertFormatting("> ", "", "quote text"),
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      ),
      label: "Link",
      action: () => insertFormatting("[", "](url)", "link text"),
    },
  ];

  return (
    <div className="flex items-center gap-1 p-2 bg-gray-50 border border-gray-300 rounded-t-lg">
      <div className="flex items-center gap-1 flex-wrap">
        {formatButtons.map((button, index) => (
          <button
            key={index}
            type="button"
            onClick={button.action}
            className={`p-2 hover:bg-gray-200 rounded transition-colors text-gray-700 hover:text-gray-900 ${button.className || ""}`}
            title={button.label}
          >
            {typeof button.icon === "string" ? (
              <span className="text-sm">{button.icon}</span>
            ) : (
              button.icon
            )}
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="text-xs text-gray-500 hidden sm:block">
          Markdown supported
        </div>
      </div>
    </div>
  );
}
