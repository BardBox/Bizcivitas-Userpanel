import { baseApi } from "./baseApi";
import { WallFeedPost } from "../../src/types/bizpulse.types";

export const bizpulseApi = baseApi.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        getDailyFeeds: builder.query<WallFeedPost[], void>({
            query: () => ({
                url: "/wallfeed",
                params: { limit: 100 },
            }),
            transformResponse: (response: { data: { wallFeeds: WallFeedPost[] } }) => {
                return response.data.wallFeeds.filter((wf: any) => wf.isDailyFeed === true);
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ _id }) => ({ type: "Post" as const, id: _id })),
                        { type: "Post", id: "LIST" },
                    ]
                    : [{ type: "Post", id: "LIST" }],
        }),
        getWallFeeds: builder.query<WallFeedPost[], { limit?: number; search?: string; type?: string }>({
            query: (params) => {
                // Filter out undefined/null values to ensure clean query params
                const cleanParams: Record<string, string | number> = {};
                if (params.type) cleanParams.type = params.type;
                if (params.search) cleanParams.search = params.search;
                if (params.limit) cleanParams.limit = params.limit;

                console.log('[RTK Query] Fetching wallfeeds with params:', cleanParams);

                return {
                    url: "/wallfeed",
                    params: cleanParams,
                };
            },
            // Ensure each type/search combo gets its own cache entry
            serializeQueryArgs: ({ queryArgs }) => {
                return `wallfeeds-${queryArgs.type || 'all'}-${queryArgs.search || ''}-${queryArgs.limit || ''}`;
            },
            transformResponse: (response: { data: { wallFeeds: WallFeedPost[] } }) => {
                return response.data.wallFeeds;
            },
            providesTags: (result, error, args) =>
                result
                    ? [
                        ...result.map(({ _id }) => ({ type: "Post" as const, id: _id })),
                        { type: "Post", id: `LIST-${args.type || 'all'}` },
                    ]
                    : [{ type: "Post", id: `LIST-${args.type || 'all'}` }],
        }),
        getBizHubPosts: builder.query<any[], void>({
            query: () => ({
                url: "/post/",
                params: { populate: "user" },
            }),
            transformResponse: (response: { data: { posts: any[] } }) => {
                return response.data.posts;
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ _id }) => ({ type: "Post" as const, id: _id })),
                        { type: "Post", id: "BIZHUB_LIST" },
                    ]
                    : [{ type: "Post", id: "BIZHUB_LIST" }],
        }),
        getPostById: builder.query<WallFeedPost, string>({
            query: (id) => `/wallfeed/${id}`,
            transformResponse: (response: { data: { wallFeed: WallFeedPost } }) => {
                // Backend wraps the post in wallFeed object
                return response.data.wallFeed || response.data;
            },
            providesTags: (result, error, id) => [{ type: "Post", id }],
        }),
        likePost: builder.mutation<WallFeedPost, string>({
            query: (wallFeedId) => ({
                url: "/wallfeed/like",
                method: "POST",
                body: { wallFeedId },
            }),
            transformResponse: (response: { data: WallFeedPost }) => response.data,
            async onQueryStarted(wallFeedId, { dispatch, queryFulfilled }) {
                console.log('[Like] Starting like mutation for:', wallFeedId);

                // Optimistic update for immediate UI feedback
                const patchResultDetail = dispatch(
                    bizpulseApi.util.updateQueryData("getPostById", wallFeedId, (draft: any) => {
                        const target = draft.wallFeed || draft;
                        console.log('[Like] Optimistic update - current isLiked:', target.isLiked);
                        target.isLiked = !target.isLiked;
                        target.likes = target.likes || [];
                        if (target.isLiked) {
                            target.likes.push({ userId: "me" });
                            target.likeCount = (target.likeCount || 0) + 1;
                        } else {
                            target.likes.pop();
                            target.likeCount = Math.max(0, (target.likeCount || 1) - 1);
                        }
                        console.log('[Like] Optimistic update - new isLiked:', target.isLiked, 'likeCount:', target.likeCount);
                    })
                );
                try {
                    const { data } = await queryFulfilled;
                    console.log('[Like] API Success - server response:', {
                        isLiked: data.isLiked,
                        likeCount: data.likeCount,
                        likesLength: data.likes?.length
                    });
                    // On success, update cache with actual server response
                    dispatch(
                        bizpulseApi.util.updateQueryData("getPostById", wallFeedId, (draft: any) => {
                            const target = draft.wallFeed || draft;
                            // Update with server response values
                            target.isLiked = data.isLiked;
                            target.likes = data.likes || [];
                            target.likeCount = data.likeCount || (data.likes?.length || 0);
                        })
                    );
                } catch (error) {
                    console.error('[Like] API Error:', error);
                    patchResultDetail.undo();
                }
            },
            // Don't invalidate tags - we update the cache directly on success
            // This prevents the refetch from overwriting our update
        }),
        likeBizHubPost: builder.mutation<any, string>({
            query: (postId) => ({
                url: "/post/like",
                method: "POST",
                body: { postId },
            }),
            invalidatesTags: (result, error, postId) => [
                { type: "Post", id: "BIZHUB_LIST" },
                { type: "Post", id: postId }
            ],
        }),
        voteOnPoll: builder.mutation<WallFeedPost, { id: string; optionIndex: number }>({
            query: ({ id, optionIndex }) => ({
                url: `/wallfeed/vote/${id}`,
                method: "PUT",
                body: { optionIndex },
            }),
            invalidatesTags: (result, error, { id }) => [{ type: "Post", id }],
        }),
        addComment: builder.mutation<WallFeedPost, { postId: string; content: string; parentCommentId?: string; mentions?: string[] }>({
            query: ({ postId, content, parentCommentId, mentions }) => ({
                url: `/wallfeed/comment/${postId}`,
                method: "POST",
                body: { content, ...(parentCommentId ? { parentCommentId } : {}), ...(mentions?.length ? { mentions } : {}) },
            }),
            invalidatesTags: (result, error, { postId }) => [{ type: "Post", id: postId }],
        }),
        deleteComment: builder.mutation<WallFeedPost, { postId: string; commentId: string }>({
            query: ({ postId, commentId }) => ({
                url: `/wallfeed/comment/${postId}/${commentId}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, { postId }) => [{ type: "Post", id: postId }],
        }),
        editComment: builder.mutation<WallFeedPost, { postId: string; commentId: string; content: string }>({
            query: ({ postId, commentId, content }) => ({
                url: `/wallfeed/comment/${postId}/${commentId}/edit`,
                method: "PUT",
                body: { content },
            }),
            invalidatesTags: (result, error, { postId }) => [{ type: "Post", id: postId }],
        }),
        likeComment: builder.mutation<WallFeedPost, { postId: string; commentId: string }>({
            query: ({ postId, commentId }) => ({
                url: `/wallfeed/${postId}/comments/${commentId}/like`,
                method: "POST",
            }),
            invalidatesTags: (result, error, { postId }) => [{ type: "Post", id: postId }],
        }),
        // BizHub Endpoints
        getBizHubPostById: builder.query<any, string>({
            query: (id) => `/post/${id}`,
            transformResponse: (response: { data: any }) => response.data,
            providesTags: (result, error, id) => [{ type: "Post", id }],
        }),
        createBizHubPost: builder.mutation<any, FormData>({
            query: (formData) => ({
                url: "/post/create",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: [{ type: "Post", id: "BIZHUB_LIST" }],
        }),
        deleteBizHubPost: builder.mutation<void, string>({
            query: (postId) => ({
                url: `/post/${postId}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [{ type: "Post", id: "BIZHUB_LIST" }, { type: "Post", id }],
        }),
        editBizHubPost: builder.mutation<any, { postId: string; data: any }>({
            query: ({ postId, data }) => ({
                url: `/post/${postId}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: (result, error, { postId }) => [{ type: "Post", id: postId }, { type: "Post", id: "BIZHUB_LIST" }],
        }),
        addBizHubComment: builder.mutation<any, { postId: string; content: string; parentCommentId?: string; mentions?: string[] }>({
            query: ({ postId, content, parentCommentId, mentions }) => ({
                url: `/post/${postId}/comment`,
                method: "POST",
                body: { content, ...(parentCommentId ? { parentCommentId } : {}), ...(mentions?.length ? { mentions } : {}) },
            }),
            invalidatesTags: (result, error, { postId }) => [{ type: "Post", id: postId }],
        }),
        deleteBizHubComment: builder.mutation<any, { postId: string; commentId: string }>({
            query: ({ postId, commentId }) => ({
                url: `/post/${postId}/comments/${commentId}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, { postId }) => [{ type: "Post", id: postId }],
        }),
        editBizHubComment: builder.mutation<any, { postId: string; commentId: string; content: string }>({
            query: ({ postId, commentId, content }) => ({
                url: `/post/comments/edit`,
                method: "PUT",
                body: { postId, commentId, content },
            }),
            invalidatesTags: (result, error, { postId }) => [{ type: "Post", id: postId }],
        }),
        likeBizHubComment: builder.mutation<any, { postId: string; commentId: string }>({
            query: ({ postId, commentId }) => ({
                url: `/post/${postId}/comments/${commentId}/like`,
                method: "POST",
            }),
            invalidatesTags: (result, error, { postId }) => [{ type: "Post", id: postId }],
        }),
    }),
});

export const {
    useGetDailyFeedsQuery,
    useGetWallFeedsQuery,
    useGetBizHubPostsQuery,
    useGetPostByIdQuery,
    useLikePostMutation,
    useLikeBizHubPostMutation,
    useVoteOnPollMutation,
    useAddCommentMutation,
    useDeleteCommentMutation,
    useEditCommentMutation,
    useLikeCommentMutation,
    useGetBizHubPostByIdQuery,
    useCreateBizHubPostMutation,
    useDeleteBizHubPostMutation,
    useEditBizHubPostMutation,
    useAddBizHubCommentMutation,
    useDeleteBizHubCommentMutation,
    useEditBizHubCommentMutation,
    useLikeBizHubCommentMutation,
} = bizpulseApi;
