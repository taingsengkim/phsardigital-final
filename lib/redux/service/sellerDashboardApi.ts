import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

import type {
  DashboardListing,
  DashboardPageParams,
  PagedResponse,
  SellerConversation,
  SellerOrder,
  SellerProfile,
  SellerReview,
} from "@/lib/types/seller-dashboard"

const pageQuery = ({ pageNumber = 0, pageSize = 20 }: DashboardPageParams = {}) =>
  new URLSearchParams({ pageNumber: String(pageNumber), pageSize: String(pageSize) })

export const sellerDashboardApi = createApi({
  reducerPath: "sellerDashboardApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/seller-dashboard" }),
  tagTypes: ["SellerDashboard"],
  endpoints: (builder) => ({
    getSellerProfile: builder.query<SellerProfile, void>({
      query: () => "?resource=profile",
      providesTags: ["SellerDashboard"],
    }),
    getSellerOrders: builder.query<PagedResponse<SellerOrder>, DashboardPageParams | void>({
      query: (params) => `?resource=orders&${pageQuery(params ?? {}).toString()}`,
      providesTags: ["SellerDashboard"],
    }),
    getSellerReviews: builder.query<PagedResponse<SellerReview>, DashboardPageParams | void>({
      query: (params) => `?resource=reviews&${pageQuery(params ?? {}).toString()}`,
      providesTags: ["SellerDashboard"],
    }),
    getSellerConversations: builder.query<SellerConversation[], void>({
      query: () => "?resource=conversations",
      providesTags: ["SellerDashboard"],
    }),
    getSellerListings: builder.query<PagedResponse<DashboardListing>, DashboardPageParams & { sellerId: string }>({
      query: ({ sellerId, ...params }) =>
        `?resource=listings&sellerId=${encodeURIComponent(sellerId)}&${pageQuery(params).toString()}`,
      providesTags: ["SellerDashboard"],
    }),
  }),
})

export const {
  useGetSellerProfileQuery,
  useGetSellerOrdersQuery,
  useGetSellerReviewsQuery,
  useGetSellerConversationsQuery,
  useGetSellerListingsQuery,
} = sellerDashboardApi
