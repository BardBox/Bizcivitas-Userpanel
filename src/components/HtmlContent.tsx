"use client";

import React from "react";
import DOMPurify from "isomorphic-dompurify";

interface HtmlContentProps {
  content: string;
  className?: string;
}

export default function HtmlContent({ content, className = "" }: HtmlContentProps) {
  // Sanitize HTML to prevent XSS attacks
  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
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
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class"],
  });

  return (
    <div
      className={`prose prose-sm max-w-none prose-ul:list-disc prose-ol:list-decimal prose-li:ml-4 ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
