"use client";

import React from "react";
import DOMPurify from "isomorphic-dompurify";

interface HtmlContentProps {
  content: string;
  className?: string;
}

export default function HtmlContent({ content, className = "" }: HtmlContentProps) {
  // Sanitize HTML to prevent XSS attacks while preserving styling tags
  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "strike",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "blockquote",
      "code",
      "pre",
      "a",
      "div",
      "span",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class", "style"],
    ALLOW_DATA_ATTR: false,
  });

  return (
    <div
      className={`prose prose-sm max-w-none
        prose-p:mb-3 prose-p:leading-relaxed prose-p:whitespace-pre-wrap
        prose-headings:font-bold prose-headings:text-gray-900
        prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-6
        prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-5
        prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-4
        prose-ul:list-disc prose-ul:ml-5 prose-ul:mb-3 prose-ul:space-y-1
        prose-ol:list-decimal prose-ol:ml-5 prose-ol:mb-3 prose-ol:space-y-1
        prose-li:leading-relaxed
        prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-4
        prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
        prose-pre:bg-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:my-4
        prose-a:text-blue-600 prose-a:no-underline prose-a:hover:underline prose-a:hover:text-blue-700
        prose-strong:font-bold prose-strong:text-gray-900
        prose-em:italic
        break-words
        ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      style={{
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
      }}
    />
  );
}
