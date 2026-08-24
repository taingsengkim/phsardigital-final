import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

import type {
  CreateListingRequest,
  DeleteListingRequest,
  SellerCategory,
  SellerListing,
  UploadedFile,
} from "@/lib/types/seller-product"

type CategoryApiItem = Partial<SellerCategory> & {
  id?: string
  categoryUuid?: string
  title?: string
}

function normalizeCategories(response: unknown): SellerCategory[] {
  const body = response as { data?: unknown; content?: unknown } | unknown[]
  const items = Array.isArray(body)
    ? body
    : Array.isArray(body?.data)
      ? body.data
      : Array.isArray(body?.content)
        ? body.content
        : []

  return (items as CategoryApiItem[])
    .map((item) => ({
      uuid: item.uuid ?? item.categoryUuid ?? item.id ?? "",
      name: item.name ?? item.title ?? "Unnamed category",
    }))
    .filter((item) => item.uuid)
}

export const sellerProductApi = createApi({
  reducerPath: "sellerProductApi",
  tagTypes: ["SellerListing", "SellerCategory"],
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (builder) => ({
    getSellerCategories: builder.query<SellerCategory[], void>({
      query: () => "/categories",
      transformResponse: normalizeCategories,
      providesTags: ["SellerCategory"],
    }),
    uploadProductFile: builder.mutation<UploadedFile, File>({
      query: (file) => {
        const body = new FormData()
        body.append("file", file)
        return { url: "/files/upload", method: "POST", body }
      },
    }),
    createSellerListing: builder.mutation<SellerListing, CreateListingRequest>({
      query: (body) => ({ url: "/listings", method: "POST", body }),
      invalidatesTags: ["SellerListing"],
    }),
    deleteSellerListing: builder.mutation<void, DeleteListingRequest>({
      query: ({ uuid }) => ({
        url: `/listings/${encodeURIComponent(uuid)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SellerListing"],
    }),
  }),
})

export const {
  useGetSellerCategoriesQuery,
  useUploadProductFileMutation,
  useCreateSellerListingMutation,
  useDeleteSellerListingMutation,
} = sellerProductApi
