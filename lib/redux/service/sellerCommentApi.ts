import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type {
  CreateReviewRequest,
  PagedReviewResponse,
  ReviewPageParams,
  ReviewReply,
  ReviewReplyRequest,
  ReviewResponse,
  ReviewSummaryResponse,
  UpdateReviewRequest,
} from "@/lib/types/review"

export const sellerCommentApi = createApi({
  reducerPath: "sellerCommentApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Reviews", "ReviewSummary", "MyReviews", "SellerComments"],
  endpoints: (builder) => ({
    // ── PUBLIC ENDPOINTS ──
    getListingReviews: builder.query<
      PagedReviewResponse,
      { listingUuid: string } & ReviewPageParams
    >({
      query: ({ listingUuid, page = 0, size = 10, sort = "createdAt,desc" }) => ({
        url: `/reviews/listings/${encodeURIComponent(listingUuid)}`,
        params: { page, size, sort },
      }),
      providesTags: (_res, _err, arg) => [{ type: "Reviews", id: arg.listingUuid }],
    }),

    getListingReviewSummary: builder.query<ReviewSummaryResponse, string>({
      query: (listingUuid) => `/reviews/listings/${encodeURIComponent(listingUuid)}/summary`,
      providesTags: (_res, _err, id) => [{ type: "ReviewSummary", id }],
    }),

    getSellerPublicReviews: builder.query<
      PagedReviewResponse,
      { sellerId: string } & ReviewPageParams
    >({
      query: ({ sellerId, page = 0, size = 20, sort = "createdAt,desc" }) => ({
        url: `/reviews/sellers/${encodeURIComponent(sellerId)}`,
        params: { page, size, sort },
      }),
      providesTags: (_res, _err, arg) => [{ type: "Reviews", id: arg.sellerId }],
    }),

    getSellerPublicReviewSummary: builder.query<ReviewSummaryResponse, string>({
      query: (sellerId) => `/reviews/sellers/${encodeURIComponent(sellerId)}/summary`,
      providesTags: (_res, _err, id) => [{ type: "ReviewSummary", id }],
    }),

    getReviewReplies: builder.query<ReviewReply[], string>({
      query: (reviewUuid) => `/reviews/${encodeURIComponent(reviewUuid)}/replies`,
      providesTags: (_res, _err, id) => [{ type: "Reviews", id }],
    }),

    // ── BUYER ENDPOINTS ──
    getMyReviews: builder.query<PagedReviewResponse, ReviewPageParams | void>({
      query: (params) => ({
        url: "/reviews/me",
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 50,
        },
      }),
      providesTags: ["MyReviews"],
    }),

    createProductReview: builder.mutation<ReviewResponse, CreateReviewRequest>({
      query: ({ listingUuid, ...body }) => ({
        url: `/reviews/listings/${encodeURIComponent(listingUuid)}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Reviews", "ReviewSummary", "MyReviews", "SellerComments"],
    }),

    updateProductReview: builder.mutation<ReviewResponse, UpdateReviewRequest>({
      query: ({ reviewUuid, ...body }) => ({
        url: `/reviews/${encodeURIComponent(reviewUuid)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Reviews", "ReviewSummary", "MyReviews", "SellerComments"],
    }),

    deleteReview: builder.mutation<void, string>({
      query: (reviewUuid) => ({
        url: `/reviews/${encodeURIComponent(reviewUuid)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Reviews", "ReviewSummary", "MyReviews", "SellerComments"],
    }),

    // ── SELLER ENDPOINTS ──
    getSellerComments: builder.query<PagedReviewResponse, ReviewPageParams | void>({
      query: (params) => ({
        url: "/reviews/sellers/me",
        params: { page: params?.page ?? 0, size: params?.size ?? 20 },
      }),
      providesTags: ["SellerComments"],
    }),

    replyToComment: builder.mutation<ReviewReply, ReviewReplyRequest>({
      query: ({ reviewUuid, ...body }) => ({
        url: `/reviews/${encodeURIComponent(reviewUuid)}/replies`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Reviews", "SellerComments"],
    }),
  }),
})

export const {
  useGetListingReviewsQuery,
  useGetListingReviewSummaryQuery,
  useGetSellerPublicReviewsQuery,
  useGetSellerPublicReviewSummaryQuery,
  useGetReviewRepliesQuery,
  useGetMyReviewsQuery,
  useCreateProductReviewMutation,
  useUpdateProductReviewMutation,
  useDeleteReviewMutation,
  useGetSellerCommentsQuery,
  useReplyToCommentMutation,
} = sellerCommentApi
