import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type {
  CheckoutArgs,
  Purchase,
  PurchasePage,
  PurchaseQuery,
} from "@/lib/types/purchase"

/**
 * Buying a product: checkout turns one seller's cart into an order, and the
 * buyer can follow and cancel it afterwards.
 *
 * Checkout is per seller — a cart that spans several shops becomes several
 * orders — so the seller's id is part of the path and the cart's uuid goes in
 * the body. Both the order list and the cart are invalidated after it: the cart
 * is emptied server-side once it becomes an order.
 */
export const purchaseApi = createApi({
  reducerPath: "purchaseApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Purchase"],
  endpoints: (builder) => ({
    checkout: builder.mutation<Purchase, CheckoutArgs>({
      query: ({ sellerId, ...body }) => ({
        url: `/purchases/checkout/${encodeURIComponent(sellerId)}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Purchase"],
    }),

    getMyPurchases: builder.query<PurchasePage, PurchaseQuery | void>({
      query: (params) => ({
        url: "/purchases",
        params: {
          pageNumber: params?.pageNumber ?? 0,
          pageSize: params?.pageSize ?? 20,
          ...(params?.status ? { status: params.status } : {}),
        },
      }),
      providesTags: ["Purchase"],
    }),

    getPurchase: builder.query<Purchase, string>({
      query: (uuid) => `/purchases/${encodeURIComponent(uuid)}`,
      providesTags: (_result, _error, uuid) => [{ type: "Purchase", id: uuid }],
    }),

    /* The buyer's own control over an order. Confirm and complete are the
       seller's side of the same resource, kept here so one service owns the
       status transitions. */
    cancelPurchase: builder.mutation<Purchase, string>({
      query: (uuid) => ({
        url: `/purchases/${encodeURIComponent(uuid)}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: ["Purchase"],
    }),
    confirmPurchase: builder.mutation<Purchase, string>({
      query: (uuid) => ({
        url: `/purchases/${encodeURIComponent(uuid)}/confirm`,
        method: "PATCH",
      }),
      invalidatesTags: ["Purchase"],
    }),
    completePurchase: builder.mutation<Purchase, string>({
      query: (uuid) => ({
        url: `/purchases/${encodeURIComponent(uuid)}/complete`,
        method: "PATCH",
      }),
      invalidatesTags: ["Purchase"],
    }),
  }),
})

export const {
  useCheckoutMutation,
  useGetMyPurchasesQuery,
  useGetPurchaseQuery,
  useCancelPurchaseMutation,
  useConfirmPurchaseMutation,
  useCompletePurchaseMutation,
} = purchaseApi
