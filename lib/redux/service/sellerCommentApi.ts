import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { CommentPage, CommentPageParams, CommentReply, ReplyToCommentRequest } from "@/lib/types/seller-comment"

export const sellerCommentApi = createApi({
  reducerPath: "sellerCommentApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["SellerComments"],
  endpoints: (builder) => ({
    getSellerComments: builder.query<CommentPage, CommentPageParams | void>({
      query: (params) => ({ url: "/reviews/sellers/me", params: { page: params?.page ?? 0, size: params?.size ?? 20 } }),
      providesTags: ["SellerComments"],
    }),
    replyToComment: builder.mutation<CommentReply, ReplyToCommentRequest>({
      query: ({ reviewUuid, ...body }) => ({ url: `/reviews/${encodeURIComponent(reviewUuid)}/replies`, method: "POST", body }),
      invalidatesTags: ["SellerComments"],
    }),
    deleteComment: builder.mutation<void, string>({
      query: (reviewUuid) => ({ url: `/reviews/${encodeURIComponent(reviewUuid)}`, method: "DELETE" }),
      invalidatesTags: ["SellerComments"],
    }),
  }),
})

export const { useGetSellerCommentsQuery, useReplyToCommentMutation, useDeleteCommentMutation } = sellerCommentApi
