import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

import type {
  AddListingImageMutationRequest,
  CategoryAttributeSchema,
  CreateListingRequest,
  DeleteListingRequest,
  SellerCategory,
  SellerCategoryTree,
  SellerListing,
  UpdateListingRequest,
  UpdateListingThumbnailRequest,
  UploadedFile,
} from "@/lib/types/seller-product"
import type { ApiListing } from "@/lib/types"

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
    getSellerCategoryTree: builder.query<SellerCategoryTree[], void>({
      query: () => "/categories?tree=true",
      transformResponse: (response: unknown) => Array.isArray(response) ? response as SellerCategoryTree[] : [],
      providesTags: ["SellerCategory"],
    }),
    getSellerCategoryAttributes: builder.query<CategoryAttributeSchema, string>({
      query: (categoryUuid) => `/categories/${encodeURIComponent(categoryUuid)}/attributes?includeInherited=true`,
      keepUnusedDataFor: 600,
      providesTags: (_result, _error, categoryUuid) => [{ type: "SellerCategory", id: `attributes-${categoryUuid}` }],
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
    getSellerListing: builder.query<ApiListing, string>({
      query: (uuid) => `/listings/${encodeURIComponent(uuid)}`,
      providesTags: (_result, _error, uuid) => [{ type: "SellerListing", id: uuid }],
    }),
    updateSellerListing: builder.mutation<ApiListing, UpdateListingRequest>({
      query: ({ uuid, body }) => ({
        url: `/listings/${encodeURIComponent(uuid)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { uuid }) => ["SellerListing", { type: "SellerListing", id: uuid }],
    }),
    updateListingThumbnail: builder.mutation<ApiListing, UpdateListingThumbnailRequest>({
      query: ({ uuid, objectName }) => ({
        url: `/listings/${encodeURIComponent(uuid)}/thumbnail`,
        method: "PATCH",
        body: { objectName },
      }),
      invalidatesTags: ["SellerListing"],
    }),
    addListingImage: builder.mutation<ApiListing, AddListingImageMutationRequest>({
      query: ({ uuid, objectName, sortOrder }) => ({
        url: `/listings/${encodeURIComponent(uuid)}/images`,
        method: "POST",
        body: { objectName, sortOrder },
      }),
      invalidatesTags: ["SellerListing"],
    }),
    removeListingDiscount: builder.mutation<ApiListing, string>({
      query: (uuid) => ({
        url: `/listings/${encodeURIComponent(uuid)}/discount`,
        method: "DELETE",
      }),
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
  useGetSellerCategoryTreeQuery,
  useGetSellerCategoryAttributesQuery,
  useUploadProductFileMutation,
  useCreateSellerListingMutation,
  useGetSellerListingQuery,
  useUpdateSellerListingMutation,
  useUpdateListingThumbnailMutation,
  useAddListingImageMutation,
  useRemoveListingDiscountMutation,
  useDeleteSellerListingMutation,
} = sellerProductApi
