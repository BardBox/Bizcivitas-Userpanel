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

      const mentionId = mention._id || (mention as any).id;
      if (username && mentionId) {
        mentionMap.set(`@${username}`, mentionId);
      }
      if (name && mentionId) {
        mentionMap.set(`@${name}`, mentionId);
      }
    });
    console.log("🗺️ Mention map:", Array.from(mentionMap.entries()));
  }

  // Build list of known mention strings (sorted longest first for greedy matching)
  const knownMentions = Array.from(mentionMap.keys()).sort((a, b) => b.length - a.length);

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  // Regex matches @ followed by 1-2 words (FirstName or FirstName LastName)
  const mentionRegex = /@([A-Za-z]+(?:\s+[A-Za-z]+)?)/g;

  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    let mentionText = match[0];
    let username = match[1];
    let userId: string | undefined;

    // Check if a known mention starts at this position (prefer exact known names)
    const textFromAt = text.substring(match.index);
    const knownMatch = knownMentions.find((k) => textFromAt.startsWith(k));
    if (knownMatch) {
      mentionText = knownMatch;
      username = knownMatch.substring(1); // remove @
      userId = mentionMap.get(knownMatch);
      // Advance regex past the full known mention
      mentionRegex.lastIndex = match.index + mentionText.length;
    } else {
      userId = mentionMap.get(mentionText);
    }

    // Add text before the mention
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

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
