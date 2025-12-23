import { baseApi } from "./baseApi";
import { WallFeedPost } from "../../src/types/bizpulse.types";

export const bizpulseApi = baseApi.injectEndpoints({
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
            query: (params) => ({
                url: "/wallfeed",
                params,
            }),
            transformResponse: (response: { data: { wallFeeds: WallFeedPost[] } }) => {
                return response.data.wallFeeds;
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ _id }) => ({ type: "Post" as const, id: _id })),
                        { type: "Post", id: "LIST" },
                    ]
                    : [{ type: "Post", id: "LIST" }],
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
            transformResponse: (response: { data: WallFeedPost }) => response.data,
            providesTags: (result, error, id) => [{ type: "Post", id }],
        }),
        likePost: builder.mutation<WallFeedPost, string>({
            query: (wallFeedId) => ({
                url: "/wallfeed/like",
                method: "POST",
                body: { wallFeedId },
            }),
            async onQueryStarted(wallFeedId, { dispatch, queryFulfilled }) {
                const patchResultDetail = dispatch(
                    bizpulseApi.util.updateQueryData("getPostById", wallFeedId, (draft) => {
                        draft.isLiked = !draft.isLiked;
                        draft.likes = draft.likes || [];
                        if (draft.isLiked) {
                            draft.likes.push({ userId: "me" } as any);
                        } else {
                            draft.likes.pop();
                        }
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResultDetail.undo();
                }
            },
            invalidatesTags: (result, error, id) => [{ type: "Post", id }],
        }),
        likeBizHubPost: builder.mutation<any, string>({
            query: (postId) => ({
                url: "/post/like",
                method: "POST",
                body: { postId },
            }),
            invalidatesTags: (result, error, id) => [{ type: "Post", id: "BIZHUB_LIST" }],
        }),
        voteOnPoll: builder.mutation<WallFeedPost, { id: string; optionIndex: number }>({
            query: ({ id, optionIndex }) => ({
                url: `/wallfeed/vote/${id}`,
                method: "PUT",
                body: { optionIndex },
            }),
            invalidatesTags: (result, error, { id }) => [{ type: "Post", id }],
        }),
        addComment: builder.mutation<WallFeedPost, { postId: string; content: string }>({
            query: ({ postId, content }) => ({
                url: `/wallfeed/comment/${postId}`,
                method: "POST",
                body: { content },
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
        addBizHubComment: builder.mutation<any, { postId: string; content: string }>({
            query: ({ postId, content }) => ({
                url: `/post/${postId}/comment`,
                method: "POST",
                body: { content },
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
    useGetBizHubPostByIdQuery,
    useCreateBizHubPostMutation,
    useDeleteBizHubPostMutation,
    useEditBizHubPostMutation,
    useAddBizHubCommentMutation,
    useDeleteBizHubCommentMutation,
    useEditBizHubCommentMutation,
    useLikeBizHubCommentMutation,
} = bizpulseApi;
