import React from "react";
import MentionLink from "@/components/MentionLink";

interface Mention {
  _id: string;
  name?: string;
  username?: string;
  fname?: string;
  lname?: string;
}

/**
 * Parses comment text and converts @mentions into clickable links
 * @param text - The raw comment text
 * @param mentions - Array of mentioned user objects
 * @returns Array of React elements (text + links)
 */
export function parseMentions(
  text: string,
  mentions?: Mention[]
): React.ReactNode[] {
  console.log("📝 parseMentions called with:", { text, mentions });

  if (!text) return [];

  // Create a map of usernames/names to user IDs for quick lookup (if mentions provided)
  const mentionMap = new Map<string, string>();
  if (mentions && mentions.length > 0) {
    mentions.forEach((mention) => {
      const username = mention.username;
      const name = mention.name || `${mention.fname || ""} ${mention.lname || ""}`.trim();

      console.log("👤 Processing mention:", { mention, username, name });

      if (username) {
        mentionMap.set(`@${username}`, mention._id);
      }
      if (name) {
        mentionMap.set(`@${name}`, mention._id);
      }
    });
    console.log("🗺️ Mention map:", Array.from(mentionMap.entries()));
  }

  // Regex to find @mentions in text - matches @FirstName LastName or @username
  // Matches: @Deven Oza, @deven, @John Doe Smith (multiple words)
  const mentionRegex = /@([A-Za-z]+(?:\s+[A-Za-z]+)*)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    const mentionText = match[0]; // Full match like "@Deven Oza"
    const username = match[1]; // Captured name without @ (e.g., "Deven Oza")
    const userId = mentionMap.get(mentionText);

    // Add text before the mention
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Always make @mentions clickable using smart MentionLink component
    console.log(`🔗 Creating mention link for ${mentionText}`, { userId, username });
    parts.push(
      <MentionLink
        key={`mention-${match.index}`}
        username={username}
        userId={userId}
      >
        {mentionText}
      </MentionLink>
    );

    lastIndex = match.index + mentionText.length;
  }

  // Add remaining text after last mention
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}
