"use client";

import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const buttons = [
    {
      icon: "B",
      label: "Bold",
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold"),
      className: "font-bold",
    },
    {
      icon: "I",
      label: "Italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic"),
      className: "italic",
    },
    {
      icon: "U",
      label: "Underline",
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive("underline"),
      className: "underline",
    },
    {
      icon: "S",
      label: "Strike",
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive("strike"),
      className: "line-through",
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
        </svg>
      ),
      label: "Code",
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: editor.isActive("code"),
    },
    {
      type: "divider",
    },
    {
      icon: "H1",
      label: "Heading 1",
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive("heading", { level: 1 }),
      className: "font-bold text-lg",
    },
    {
      icon: "H2",
      label: "Heading 2",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive("heading", { level: 2 }),
      className: "font-bold",
    },
    {
      icon: "H3",
      label: "Heading 3",
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive("heading", { level: 3 }),
      className: "font-semibold text-sm",
    },
    {
      type: "divider",
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
            clipRule="evenodd"
          />
        </svg>
      ),
      label: "Bullet List",
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive("bulletList"),
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
      label: "Numbered List",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive("orderedList"),
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
          />
        </svg>
      ),
      label: "Blockquote",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive("blockquote"),
    },
    {
      type: "divider",
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      ),
      label: "Link",
      action: setLink,
      isActive: editor.isActive("link"),
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
          />
        </svg>
      ),
      label: "Clear Formatting",
      action: () => editor.chain().focus().clearNodes().unsetAllMarks().run(),
      isActive: false,
    },
  ];

  return (
    <div className="border border-gray-300 border-b-0 rounded-t-lg bg-gray-50 p-2 flex flex-wrap gap-1">
      {buttons.map((button, index) => {
        if (button.type === "divider") {
          return (
            <div
              key={`divider-${index}`}
              className="w-px h-6 bg-gray-300 mx-1"
            />
          );
        }

        return (
          <button
            key={index}
            type="button"
            onClick={button.action}
            className={`p-2 rounded transition-colors ${
              button.isActive
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            } ${button.className || ""}`}
            title={button.label}
          >
            {typeof button.icon === "string" ? (
              <span className="text-sm font-medium">{button.icon}</span>
            ) : (
              button.icon
            )}
          </button>
        );
      })}

      <div className="ml-auto flex items-center">
        <span className="text-xs text-gray-500 hidden sm:block">
          Rich Text Editor
        </span>
      </div>
    </div>
  );
};

export default function TipTapEditor({
  content,
  onChange,
  placeholder = "Write something...",
  disabled = false,
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline cursor-pointer",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable: !disabled,
    immediatelyRender: false, // Fix SSR hydration mismatch
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3 border border-gray-300 rounded-b-lg",
      },
    },
  });

  // Update content when prop changes
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Update editable state
  React.useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  return (
    <div className="tiptap-editor">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
