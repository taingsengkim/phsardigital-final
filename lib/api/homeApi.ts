import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  Category,
  Listing,
  ListingsQuery,
  PaginatedListings,
  Seller,
} from "@/lib/types";

/**
 * Public/browse endpoints (categories, listings, sellers) — no auth needed,
 * so unlike authApi.ts this doesn't take an accessToken per-query. If you
 * later add endpoints here that DO need auth (e.g. "my saved listings"),
 * copy authApi's pattern: accept `accessToken` in the query arg and pass it
 * through `headers: accessToken ? { Authorization: \`Bearer ${accessToken}\` } : undefined`.
 */
export const homeApi = createApi({
  reducerPath: "homeApi",
  tagTypes: ["Category", "Listing"],
  baseQuery: fetchBaseQuery({
    baseUrl: "/api", // same convention as authApi.ts — hits your Next.js API routes, which proxy to Spring Boot
  }),
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => "/categories",
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.content)) return response.content;
        if (Array.isArray(response?.data)) return response.data;
        return [];
      },
      providesTags: ["Category"],
    }),

    getListings: builder.query<PaginatedListings, ListingsQuery | void>({
      query: (params) => ({
        url: "/listings",
        params: params ?? undefined,
      }),
      providesTags: ["Listing"],
    }),

    // Thin wrappers around getListings for the specific homepage sections, so
    // components call a purpose-named hook instead of remembering the params.
    // `sort` takes a Spring sort expression — "field,direction".
    getFeaturedListings: builder.query<PaginatedListings, void>({
      query: () => ({
        url: "/listings",
        params: { sort: "createdAt,desc", pageSize: 15 },
      }),
      providesTags: ["Listing"],
    }),
    /**
     * Sorted by units sold. `averageRating` is NOT a sortable field upstream —
     * asking for it returns 400 and the section renders empty. The API reports
     * the allowed set: createdAt, discountPrice, fullPrice, lastModifiedAt,
     * price, sold, title.
     */
    getBestSellingListings: builder.query<PaginatedListings, void>({
      query: () => ({
        url: "/listings",
        params: { sort: "sold,desc", pageSize: 5 },
      }),
      providesTags: ["Listing"],
    }),
    getListingsByCategory: builder.query<PaginatedListings, string>({
      query: (categorySlug) => ({
        url: "/listings",
        params: { categorySlug, pageSize: 5 },
      }),
      providesTags: ["Listing"],
    }),

    /**
     * `period` defaults to LAST_30_DAYS upstream, which returns nothing on a
     * marketplace that has not traded this month — the homepage then fell back
     * to placeholder stores. ALL_TIME is the honest window for a top-sellers
     * rail until volume justifies a rolling one.
     */
    getTopSellers: builder.query<any[], void>({
      query: () => ({
        url: "/sellers/top",
        params: { period: "ALL_TIME", limit: 8 },
      }),
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.content)) return response.content;
        if (Array.isArray(response?.data)) return response.data;
        return [];
      },
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetListingsQuery,
  useGetFeaturedListingsQuery,
  useGetBestSellingListingsQuery,
  useGetListingsByCategoryQuery,
  useGetTopSellersQuery,
} = homeApi;
