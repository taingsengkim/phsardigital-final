import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  Category,
  Listing,
  ListingsQuery,
  PaginatedListings,
} from "@/lib/types";
import type { Seller } from "@/app/(public)/home/seller-mock-types";

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

    // Thin wrappers around getListings for the specific homepage sections,
    // so components can call a purpose-named hook instead of remembering
    // which sort/filter params to pass every time.
    getFeaturedListings: builder.query<PaginatedListings, void>({
      query: () => ({ url: "/listings", params: { sort: "newest", pageSize: 15 } }),
      providesTags: ["Listing"],
    }),
    getTopRatedListings: builder.query<PaginatedListings, void>({
      query: () => ({ url: "/listings", params: { sort: "top_rated", pageSize: 5 } }),
      providesTags: ["Listing"],
    }),
    getWearableListings: builder.query<PaginatedListings, void>({
      query: () => ({ url: "/listings", params: { categoryId: 5, pageSize: 5 } }),
      providesTags: ["Listing"],
    }),

    // No backend endpoint yet — kept here (unused for now) so the shape is
    // ready the day "browse sellers" ships. Until then, sections import the
    // Seller[] mock directly instead of calling this hook.
    getTopSellers: builder.query<Seller[], void>({
      query: () => "/sellers?sort=top",
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetListingsQuery,
  useGetFeaturedListingsQuery,
  useGetTopRatedListingsQuery,
  useGetWearableListingsQuery,
  useGetTopSellersQuery,
} = homeApi;
