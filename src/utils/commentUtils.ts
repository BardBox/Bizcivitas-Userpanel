export interface GroupedComments<T> {
  topLevel: T[];
  repliesByParentId: Record<string, T[]>;
}

/**
 * Groups a flat array of comments into top-level comments and their replies.
 * Top-level comments have no parentCommentId (null/undefined).
 * Replies are grouped by their parentCommentId.
 * Replies are sorted by createdAt ascending (oldest first, like a conversation).
 */
export function groupComments<
  T extends { _id?: string; id?: string; parentCommentId?: string | null; createdAt?: string }
>(comments: T[]): GroupedComments<T> {
  const topLevel: T[] = [];
  const repliesByParentId: Record<string, T[]> = {};

  for (const comment of comments) {
    if (!comment.parentCommentId) {
      topLevel.push(comment);
    } else {
      const parentId = comment.parentCommentId;
      if (!repliesByParentId[parentId]) {
        repliesByParentId[parentId] = [];
      }
      repliesByParentId[parentId].push(comment);
    }
  }

  // Sort replies by createdAt ascending (oldest first)
  for (const parentId of Object.keys(repliesByParentId)) {
    repliesByParentId[parentId].sort((a, b) =>
      new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
    );
  }

  return { topLevel, repliesByParentId };
}
