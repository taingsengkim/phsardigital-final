import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

import type {
  DashboardListing,
  DashboardPageParams,
  PagedResponse,
  SellerConversation,
  SellerDashboardOverview,
  SellerOrder,
  SellerProfile,
  SellerReview,
} from "@/lib/types/seller-dashboard"

const pageQuery = ({ pageNumber = 0, pageSize = 20 }: DashboardPageParams = {}) =>
  new URLSearchParams({ pageNumber: String(pageNumber), pageSize: String(pageSize) })

export const sellerDashboardApi = createApi({
  reducerPath: "sellerDashboardApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["SellerDashboard"],
  endpoints: (builder) => ({
    getSellerDashboardOverview: builder.query<SellerDashboardOverview, void>({
      query: () => "/sellers/me/dashboard",
      providesTags: ["SellerDashboard"],
    }),
    getSellerProfile: builder.query<SellerProfile, void>({
      query: () => "/seller-dashboard?resource=profile",
      providesTags: ["SellerDashboard"],
    }),
    getSellerOrders: builder.query<PagedResponse<SellerOrder>, DashboardPageParams | void>({
      query: (params) => `/seller-dashboard?resource=orders&${pageQuery(params ?? {}).toString()}`,
      providesTags: ["SellerDashboard"],
    }),
    getSellerReviews: builder.query<PagedResponse<SellerReview>, DashboardPageParams | void>({
      query: (params) => `/seller-dashboard?resource=reviews&${pageQuery(params ?? {}).toString()}`,
      providesTags: ["SellerDashboard"],
    }),
    getSellerConversations: builder.query<SellerConversation[], void>({
      query: () => "/seller-dashboard?resource=conversations",
      providesTags: ["SellerDashboard"],
    }),
    getSellerListings: builder.query<PagedResponse<DashboardListing>, DashboardPageParams & { sellerId: string }>({
      query: ({ sellerId, ...params }) =>
        `/seller-dashboard?resource=listings&sellerId=${encodeURIComponent(sellerId)}&${pageQuery(params).toString()}`,
      providesTags: ["SellerDashboard"],
    }),
  }),
})

export const {
  useGetSellerDashboardOverviewQuery,
  useGetSellerProfileQuery,
  useGetSellerOrdersQuery,
  useGetSellerReviewsQuery,
  useGetSellerConversationsQuery,
  useGetSellerListingsQuery,
} = sellerDashboardApi
