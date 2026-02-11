/**
 * Converts a flat array of comments into a nested tree structure for recursive rendering
 * @param comments - Flat array of comments with parentCommentId field
 * @returns Array of root comments with nested children
 */

export interface CommentNode<T = any> {
  _id: string;
  parentCommentId?: string | null;
  children: CommentNode<T>[];
  [key: string]: any;
}

export function buildCommentTree<T extends { _id?: string; parentCommentId?: string | null }>(
  comments: T[]
): (T & { children: (T & { children: any[] })[] })[] {
  // Handle empty or invalid input
  if (!comments || comments.length === 0) {
    return [];
  }

  // Create a map for quick lookup by ID
  const commentMap = new Map<string, T & { children: any[] }>();
  const rootComments: (T & { children: any[] })[] = [];

  // First pass: Initialize all comments with empty children array
  comments.forEach((comment) => {
    if (comment._id) {
      commentMap.set(comment._id, { ...comment, children: [] });
    }
  });

  // Second pass: Build the tree structure
  comments.forEach((comment) => {
    if (!comment._id) return;

    const commentWithChildren = commentMap.get(comment._id)!;

    // If no parent or parent doesn't exist, it's a root comment
    if (!comment.parentCommentId || !commentMap.has(comment.parentCommentId)) {
      rootComments.push(commentWithChildren);
    } else {
      // Add to parent's children array
      const parent = commentMap.get(comment.parentCommentId);
      if (parent) {
        parent.children.push(commentWithChildren);
      }
    }
  });

  // Sort children by createdAt (oldest first) recursively
  const sortChildren = (nodes: any[]) => {
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        node.children.sort((a: any, b: any) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateA - dateB;
        });
        sortChildren(node.children);
      }
    });
  };

  // Sort root comments by createdAt (oldest first)
  rootComments.sort((a: any, b: any) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateA - dateB;
  });

  // Sort all nested children
  sortChildren(rootComments);

  return rootComments;
}
