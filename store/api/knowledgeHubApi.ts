import { baseApi } from "./baseApi";

// Types for Knowledge Hub
export interface MediaItem {
  _id: string;
  parentId?: {
    _id: string;
    title: string;
    type: "expert" | "knowledge" | "membership" | "resource";
    expertType?: "Business Excellence" | "Employee Development";
    thumbnailUrl?: string;
    author?: string;
  };
  type: "video" | "pdf";
  url?: string; // For PDFs
  vimeoId?: string; // For videos
  vimeoLink?: string;
  embedLink?: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  fileName?: string;
  mimeType?: string;
  length?: number;
  expertType?: "Business Excellence" | "Employee Development";
  status?: "processing" | "ready";
  fileExtension?: string;
  sizeInBytes?: number;
  folder?: "pdfs" | "tutorial-videos" | "recordings";
  downloadable?: boolean;
  uploadedBy?: {
    _id: string;
    fullName?: string;
    avatar?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CollectionComment {
  _id: string;
  userId: {
    _id: string;
    fname?: string;
    lname?: string;
    avatar?: string;
    username?: string;
    role?: string;
  };
  parentCommentId?: string | null;
  content: string;
  mediaUrl?: string;
  mentions?: Array<{
    _id: string;
    fname?: string;
    lname?: string;
    avatar?: string;
    username?: string;
    role?: string;
  }>;
  likes: Array<{ userId: string }>;
  likeCount?: number;
  isLiked?: boolean;
  createdAt: string;
  replyCount?: number;
  children?: CollectionComment[];
}

export interface Collection {
  _id: string;
  type: "expert" | "knowledge" | "membership" | "resource";
  expertType?: "Business Excellence" | "Employee Development";
  title: string;
  description?: string;
  thumbnailUrl?: string;
  date?: string;
  createdBy?: {
    _id: string;
    fullName?: string;
    avatar?: string;
  };
  author?: string;
  subItems?: MediaItem[];
  tags?: string[];
  savedBy?: Array<{
    userId: string;
    savedAt: string;
  }>;
  comments?: CollectionComment[];
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  statusCode?: number;
  message?: string;
  success?: boolean;
  data: T;
}

// Knowledge Hub API endpoints
export const knowledgeHubApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Get ALL media (no bugs in this endpoint)
    getAllMedia: builder.query<MediaItem[], void>({
      query: () => "/media",
      transformResponse: (response: ApiResponse<MediaItem[]>) => response.data,
    }),

    // Get recordings (Expert Learnings - Only from 'expert' type collections)
    getRecordings: builder.query<MediaItem[], void>({
      query: () => "/media",
      transformResponse: (response: ApiResponse<MediaItem[]>) => {
        const allMedia = response.data;
        // Filter for recordings from expert-type collections only
        return allMedia.filter(
          (item) =>
            item.folder === "recordings" && item.parentId?.type === "expert"
        );
      },
    }),

    // Get tutorial videos (Knowledge Sessions - From 'knowledge' type collections)
    getTutorials: builder.query<MediaItem[], void>({
      query: () => "/media",
      transformResponse: (response: ApiResponse<MediaItem[]>) => {
        const allMedia = response.data;
        // Filter for tutorial videos from knowledge-type collections
        return allMedia.filter(
          (item) =>
            item.folder === "tutorial-videos" ||
            (item.folder === "recordings" &&
              item.parentId?.type === "knowledge")
        );
      },
    }),

    // Get PDFs and documents
    getPDFs: builder.query<MediaItem[], void>({
      query: () => "/media",
      transformResponse: (response: ApiResponse<MediaItem[]>) => {
        const allMedia = response.data;
        return allMedia.filter((item) => item.folder === "pdfs");
      },
    }),

    // Get all collections
    getCollections: builder.query<
      Collection[],
      { type?: string; expertType?: string } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.type) queryParams.append("type", params.type);
        if (params?.expertType)
          queryParams.append("expertType", params.expertType);
        const queryString = queryParams.toString();
        return `/collections${queryString ? `?${queryString}` : ""}`;
      },
      transformResponse: (response: ApiResponse<Collection[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Collection' as const, id: _id })),
              { type: 'Collection' as const, id: 'LIST' },
            ]
          : [{ type: 'Collection' as const, id: 'LIST' }],
    }),

    // Get single collection by ID
    getCollectionById: builder.query<Collection, string>({
      query: (id) => `/collections/${id}`,
      transformResponse: (response: ApiResponse<Collection>) => response.data,
      providesTags: (result, error, id) => [{ type: 'Collection' as const, id }],
    }),

    // Get saved collections
    getSavedCollections: builder.query<Collection[], void>({
      query: () => "/collections/saved",
      transformResponse: (response: ApiResponse<Collection[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Collection' as const, id: _id })),
              { type: 'Collection' as const, id: 'SAVED' },
            ]
          : [{ type: 'Collection' as const, id: 'SAVED' }],
    }),

    // Get saved media
    getSavedMedia: builder.query<MediaItem[], void>({
      query: () => "/saved-media",
      transformResponse: (response: ApiResponse<MediaItem[]>) => response.data,
    }),

    // Toggle save media
    saveMedia: builder.mutation<
      { message: string; saved: boolean },
      { mediaId: string; collectionId: string }
    >({
      query: (data) => ({
        url: "/save-media",
        method: "POST",
        body: data,
      }),
      transformResponse: (
        response: ApiResponse<{ message: string; saved: boolean }>
      ) => response.data,
    }),

    // Toggle save collection
    saveCollection: builder.mutation<
      { message: string; data: Collection },
      { collectionId: string }
    >({
      query: (data) => ({
        url: "/collections/save",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { collectionId }) => [
        { type: 'Collection' as const, id: collectionId },
        { type: 'Collection' as const, id: 'LIST' },
        { type: 'Collection' as const, id: 'SAVED' },
      ],
    }),

    // Add comment to collection
    addCollectionComment: builder.mutation<
      { message: string; data: Collection },
      { collectionId: string; content: string; parentCommentId?: string; mentions?: string[] }
    >({
      query: ({ collectionId, content, parentCommentId, mentions }) => ({
        url: `/collections/${collectionId}/comment`,
        method: "POST",
        body: { content, ...(parentCommentId ? { parentCommentId } : {}), ...(mentions?.length ? { mentions } : {}) },
      }),
      invalidatesTags: (result, error, { collectionId }) => [
        { type: 'Collection' as const, id: collectionId },
      ],
    }),

    // Edit comment on collection
    editCollectionComment: builder.mutation<
      { message: string; data: Collection },
      { collectionId: string; commentId: string; content: string }
    >({
      query: ({ collectionId, commentId, content }) => ({
        url: `/collections/${collectionId}/comments/${commentId}/edit`,
        method: "PUT",
        body: { content },
      }),
      invalidatesTags: (result, error, { collectionId }) => [
        { type: 'Collection' as const, id: collectionId },
      ],
    }),

    // Delete comment from collection
    deleteCollectionComment: builder.mutation<
      { message: string; data: Collection },
      { collectionId: string; commentId: string }
    >({
      query: ({ collectionId, commentId }) => ({
        url: `/collections/${collectionId}/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { collectionId }) => [
        { type: 'Collection' as const, id: collectionId },
      ],
    }),

    // Like/unlike comment on collection
    likeCollectionComment: builder.mutation<
      { message: string; data: Collection },
      { collectionId: string; commentId: string }
    >({
      query: ({ collectionId, commentId }) => ({
        url: `/collections/${collectionId}/comments/${commentId}/like`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { collectionId }) => [
        { type: 'Collection' as const, id: collectionId },
      ],
    }),
  }),
});

// Export hooks
export const {
  useGetAllMediaQuery,
  useGetRecordingsQuery,
  useGetTutorialsQuery,
  useGetPDFsQuery,
  useGetCollectionsQuery,
  useGetCollectionByIdQuery,
  useGetSavedCollectionsQuery,
  useGetSavedMediaQuery,
  useSaveMediaMutation,
  useSaveCollectionMutation,
  useAddCollectionCommentMutation,
  useEditCollectionCommentMutation,
  useDeleteCollectionCommentMutation,
  useLikeCollectionCommentMutation,
} = knowledgeHubApi;
