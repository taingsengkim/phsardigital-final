import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { ApiReview } from "@/lib/types"
import type { CommentPage, CommentPageParams, CommentReply, CreateProductReviewRequest, ReplyToCommentRequest } from "@/lib/types/seller-comment"

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
    createProductReview: builder.mutation<ApiReview, CreateProductReviewRequest>({
      query: ({ listingUuid, ...body }) => ({
        url: `/reviews/listings/${encodeURIComponent(listingUuid)}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["SellerComments"],
    }),
  }),
})

export const {
  useGetSellerCommentsQuery,
  useReplyToCommentMutation,
  useDeleteCommentMutation,
  useCreateProductReviewMutation,
} = sellerCommentApi
